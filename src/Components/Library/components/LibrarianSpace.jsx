// =============== IMPORTS ===============
import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { contractConfig } from "../../../config/wagmiConfig";
import { roleManagementService } from "../../../services/firebase";
import { web3RoleService } from "../../../services/web3";

// =============== CONSTANTS ===============
const WEB3_ROLES = [
  { name: "Contributeur", value: "CONTRIBUTOR" },
  { name: "Validateur", value: "VALIDATOR" },
  { name: "Administrateur", value: "ADMIN" }
];

// =============== COMPONENT ===============
export default function LibrarianSpace() {
  // =============== HOOKS ET STATES ===============
  // Remplacer toute la section des hooks et states par :
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { data: hasAdminRole } = useReadContract({
    ...contractConfig,
    functionName: 'hasRole',
    args: [contractConfig.roles.ADMIN_ROLE, connectedAddress],
    enabled: !!connectedAddress
  });

  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    address: '',
    role: '',
    memberId: ''
  });
  const [rolesRegistry, setRolesRegistry] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);

  // =============== EFFECTS ===============
  // Remplacer toute la section des effects par :
  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    if (txHash) {
      console.log('Transaction hash set:', txHash);
      setTransactionStatus('PENDING');
    }
  }, [txHash]);

  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
    onSuccess: async (receipt) => {
      console.log('Transaction confirmed:', receipt);
      setTransactionStatus('CONFIRMED');
      await handleTransactionSuccess(receipt);
    },
    onError: (error) => {
      console.error('Transaction failed:', error);
      setTransactionStatus('FAILED');
      setError('Transaction failed');
    }
  });

  // =============== HANDLERS ===============
  // Remplacer toute la section des handlers par :
  async function handleTransactionSuccess(receipt) {
    try {
      console.log('Starting handleTransactionSuccess with receipt:', receipt);
      console.log('Current form data:', formData);

      const existingRoles = await roleManagementService.getRolesByAddress(formData.address);
      console.log('Existing roles:', existingRoles);

      const pendingRole = existingRoles.find(r => 
        r.status === 'PENDING' && 
        r.role === formData.role
      );
      console.log('Found pending role:', pendingRole);

      if (pendingRole) {
        await roleManagementService.updateRoleStatus(
          pendingRole.id,
          'COMPLETED',
          receipt.transactionHash
        );
        console.log('Role status updated to COMPLETED');

        await loadRoles();
        resetForm();
      } else {
        console.warn('No pending role found to update');
        setError('No pending role found to update');
      }
    } catch (error) {
      console.error('Error in handleTransactionSuccess:', error);
      setError('Failed to update role status');
    }
  }

  async function loadRoles() {
    try {
      setIsLoading(true);
      const roles = await roleManagementService.getAllRoles();
      console.log('Loaded roles:', roles);
      setRolesRegistry(roles);
    } catch (error) {
      console.error('Error loading roles:', error);
      setError('Error loading roles');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(action) {
    try {
      console.log('Starting handleSubmit:', { action, formData });
      setError(null);
      setTxHash(null);

      if (!formData.address || !formData.role) {
        setError('Please fill all required fields');
        return;
      }

      const roleHash = contractConfig.roles[`${formData.role}_ROLE`];
      console.log('Role hash:', roleHash);
      const functionName = action === 'register' ? 'grantRole' : 'revokeRole';

      // Blockchain transaction
      const tx = await writeContractAsync({
        ...contractConfig,
        functionName,
        args: [roleHash, formData.address],
      });

      console.log('Transaction submitted:', tx);
      setTxHash(tx);

      if (action === 'register') {
        const roleData = {
          address: formData.address,
          role: formData.role,
          status: 'PENDING',
          transactionHash: tx,
          createdAt: new Date().toISOString()
        };

        await roleManagementService.addRole(roleData);
        console.log('Role added to Firestore:', roleData);
      }

    } catch (error) {
      console.error('Transaction error:', error);
      setError(error.message || 'Transaction failed');
    }
  }

  function resetForm() {
    setFormData({
      address: '',
      role: '',
      memberId: ''
    });
    setError(null);
    setTxHash(null);
    setTransactionStatus(null);
  }

  // =============== RENDER CONDITIONS ===============
  if (!hasAdminRole) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        Not authorized
      </div>
    );
  }

  // =============== RENDER ===============
  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 border-b mb-6">
          <button
            className={`pb-2 ${activeTab === 'register' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register Role
          </button>
          <button
            className={`pb-2 ${activeTab === 'revoke' ? 'border-b-2 border-blue-500' : ''}`}
            onClick={() => setActiveTab('revoke')}
          >
            Revoke Role
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4">
          <div>
            <label className="block mb-2">Address</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="0x..."
            />
          </div>

          <div>
            <label className="block mb-2">Role</label>
            <select
              className="w-full border rounded p-2"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="">Select Role</option>
              {WEB3_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="w-full bg-blue-500 text-white rounded p-2"
            onClick={() => handleSubmit(activeTab)}
            disabled={isTxPending}
          >
            {isTxPending ? 'Processing...' : activeTab === 'register' ? 'Register' : 'Revoke'}
          </button>
        </form>

        {/* Roles Registry */}
        {rolesRegistry.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">Registered Roles</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Address</th>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Transaction</th>
                  </tr>
                </thead>
                <tbody>
                  {rolesRegistry
                    .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
                    .map((role) => (
                      <tr key={role.id} className="border-t">
                        <td className="px-4 py-2">{role.address}</td>
                        <td className="px-4 py-2">{role.role}</td>
                        <td className="px-4 py-2">
                          {role.createdAt?.toDate().toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 py-2">
                          {role.transactionHash && (
                            <a
                              href={`https://sepolia.etherscan.io/tx/${role.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {`${role.transactionHash.slice(0, 6)}...${role.transactionHash.slice(-4)}`}
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}