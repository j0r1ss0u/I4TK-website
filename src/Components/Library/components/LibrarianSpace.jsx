// =============== IMPORTS ===============
import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { contractConfig } from "../../../config/wagmiConfig";
import { roleManagementService } from "../../../services/firebase";
import { web3RoleService } from "../../../services/web3";
import { useMembers } from "../../Members/MembersContext";
import RolesTable from './RolesTable';

// =============== CONSTANTS ===============
const WEB3_ROLES = [
  { name: "Contributeur", value: "CONTRIBUTOR" },
  { name: "Validateur", value: "VALIDATOR" },
  { name: "Administrateur", value: "ADMIN" }
];

// =============== UTILITY FUNCTIONS ===============
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const sortByDate = (a, b) => {
  try {
    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
    return dateB - dateA;
  } catch (error) {
    console.error('Error sorting dates:', error);
    return 0;
  }
};

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
  const { members } = useMembers();

  // =============== EFFECTS ===============
 
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
  async function handleTransactionSuccess(receipt) {
    try {
      console.log('Starting handleTransactionSuccess with receipt:', receipt);
      console.log('Current form data:', formData);

      const existingRoles = await roleManagementService.getRolesByAddress(formData.address);
      console.log('Existing roles:', existingRoles);

      await loadRoles();
      resetForm();
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

      // Mapper les rôles vers les profils du smart contract
      let profile;
      switch(formData.role) {
        case 'CONTRIBUTOR':
          profile = 1; // Profiles.researcher
          break;
        case 'VALIDATOR':
          profile = 2; // Profiles.labs
          break;
        case 'ADMIN':
          profile = 3; // Profiles.admin
          break;
        default:
          setError('Invalid role');
          return;
      }

      const functionName = action === 'register' ? 'registerMember' : 'revokeMember';

      // Transaction blockchain
      const tx = await writeContractAsync({
        ...contractConfig,
        functionName,
        args: action === 'register' ? [formData.address, profile] : [formData.address],
      });

      console.log('Transaction submitted:', tx);
      setTxHash(tx);

      // Enregistrement dans Firestore avec le nouveau champ "action"
      const roleData = {
        address: formData.address,
        role: formData.role,
        action: action, // 'register' ou 'revoke'
        transactionHash: tx,
        memberId: formData.memberId,
        memberName: formData.memberName,
        category: formData.category,
        country: formData.country,
        createdAt: new Date().toISOString()
      };

      await roleManagementService.addRole(roleData);
      console.log('Role action recorded in Firestore:', roleData);

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
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Member Organisation
            </label>
            <select
              className="w-full border rounded p-2 bg-white"
              value={formData.memberId}
              onChange={(e) => {
                const selectedMember = members.find(m => m.id === Number(e.target.value));
                setFormData({
                  ...formData,
                  memberId: e.target.value,
                  memberName: selectedMember?.name || '',
                  category: selectedMember?.category || '',
                  country: selectedMember?.country || ''
                });
              }}
              required
            >
              <option value="">Select a member organisation</option>
              {members
                .filter(m => m.isVisible)
                .map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.category} - {member.country})
                  </option>
                ))}
            </select>
          </div>

          {/* Existing Address field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wallet Address
            </label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="0x..."
              required
            />
          </div>

          {/* Existing Role field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              className="w-full border rounded p-2 bg-white"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              <option value="">Select a role</option>
              {WEB3_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="w-full bg-blue-500 text-white rounded p-2 hover:bg-blue-600 disabled:bg-gray-300"
            onClick={() => handleSubmit(activeTab)}
            disabled={isTxPending || !formData.memberId || !formData.address || !formData.role}
          >
            {isTxPending ? 'Processing...' : activeTab === 'register' ? 'Register' : 'Revoke'}
          </button>
        </form>

        {/* Roles Registry */}
                {rolesRegistry.length > 0 && (
                  <RolesTable 
                    rolesRegistry={rolesRegistry} 
                    formatDate={formatDate}
                  />
                )}
              </div>
            </div>
          );
        }