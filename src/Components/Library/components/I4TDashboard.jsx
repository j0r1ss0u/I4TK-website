import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { publicClient } from '@/utils/client';
import { parseBase64DataURL } from '@/utils/utils';
import { Loader2 } from 'lucide-react';
import Piechar from '@/components/shared/Piechar';
import { getContractConfig } from '@/config/wagmiConfig';

const I4TKDashboard = () => {
  const { address, isConnected } = useAccount();
  const [ownedTokens, setOwnedTokens] = useState([]);
  const [myTotalBalance, setMyTotalBalance] = useState(0);
  const [networkTotalBalance, setNetworkTotalBalance] = useState(0);

  const contractConfig = getContractConfig();

  // Fetch last token ID
  const { data: lastTokenId } = useReadContract({
    ...contractConfig,
    functionName: 'lastTokenId',
    enabled: isConnected,
  });

  // Fetch total supply
  const { data: totalSupply } = useReadContract({
    ...contractConfig,
    functionName: 'totalSupply',
    enabled: isConnected,
  });

  // Fetch balances using React Query
  const { data: balances, isLoading: isBalancesLoading } = useQuery({
    queryKey: ['balances', address, lastTokenId],
    queryFn: async () => {
      const addressArray = Array(Number(lastTokenId) + 1).fill(address);
      const tokenIdArray = Array.from({length: Number(lastTokenId) + 1}, (_, i) => i);

      return await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'balanceOfBatch',
        args: [addressArray, tokenIdArray]
      });
    },
    enabled: !!lastTokenId && !!address,
  });

  // Fetch token validation status
  const useTokenValidationStatus = (tokenId) => {
    return useReadContract({
      ...contractConfig,
      functionName: 'nbValidation',
      args: [tokenId],
      enabled: !!tokenId,
    });
  };

  // Fetch token metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!balances) return;

      const ownedTokensData = [];
      for (let i = 0; i <= Number(lastTokenId); i++) {
        if (balances[i] !== BigInt(0)) {
          try {
            const uri = await publicClient.readContract({
              address: contractConfig.address,
              abi: contractConfig.abi,
              functionName: 'uri',
              args: [BigInt(i)]
            });

            const validationStatus = await publicClient.readContract({
              ...contractConfig,
              functionName: 'nbValidation',
              args: [BigInt(i)]
            });

            const metadata = parseBase64DataURL(uri);
            ownedTokensData.push({
              tokenId: i,
              balance: balances[i],
              metadata,
              validations: Number(validationStatus)
            });
          } catch (error) {
            console.error(`Error fetching metadata for token ${i}:`, error);
          }
        }
      }
      setOwnedTokens(ownedTokensData);
    };

    fetchMetadata();
  }, [balances, lastTokenId]);

  // Calculate totals
  useEffect(() => {
    if (ownedTokens.length > 0) {
      const total = ownedTokens.reduce((acc, token) => 
        acc + Number(token.balance), 0);
      setMyTotalBalance(total);
    }

    if (totalSupply) {
      setNetworkTotalBalance(Number(totalSupply));
    }
  }, [ownedTokens, totalSupply]);

  const getValidationStatusColor = (validations) => {
    if (validations >= 4) return 'bg-green-100 text-green-800';
    if (validations > 0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please connect your wallet to view your documents</p>
      </div>
    );
  }

  if (isBalancesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Statistics Section */}
      <div className="mb-12 bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Statistics</h2>
        <Piechar myBalance={myTotalBalance} totalSupply={networkTotalBalance} />
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">My Documents</h2>

        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {ownedTokens.map((token) => (
            <div key={token.tokenId} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <img
                  src="/assets/logos/I4T token.jpeg"
                  alt={token.metadata.name}
                  className="h-full w-full object-contain object-center group-hover:opacity-75 p-4"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full ${getValidationStatusColor(token.validations)}`}>
                  {token.validations}/4 validations
                </div>
              </div>
              <div className="mt-4 flex flex-col">
                <h3 className="text-sm font-medium text-gray-900">
                  {token.metadata.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {token.metadata.properties.title}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  Ownership: {Number(token.balance) / 1000000}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {ownedTokens.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No documents found for this address
          </p>
        )}
      </div>
    </div>
  );
};

export default I4TKDashboard;