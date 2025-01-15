import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { Loader2 } from 'lucide-react';
import Piechart from './Piechart';

// Contract configuration
const TOKEN_ADDRESS = '0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288';

const I4TDashboard = () => {
  const { address, isConnected } = useAccount();
  const [debugInfo, setDebugInfo] = useState({
    lastTokenId: null,
    balances: null,
    error: null
  });

  // Fetch last token ID
  const { 
    data: lastTokenId,
    isError: isLastTokenError,
    error: lastTokenError
  } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: [{
      "inputs": [],
      "name": "lastTokenId",
      "outputs": [{"internalType": "int256","name": "","type": "int256"}],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'lastTokenId',
    enabled: isConnected,
    onSuccess: (data) => {
      console.log("Last Token ID Success:", data);
      setDebugInfo(prev => ({...prev, lastTokenId: data}));
    },
    onError: (err) => {
      console.error("Last Token ID Error:", err);
      setDebugInfo(prev => ({...prev, error: err.message}));
    }
  });

  // Fetch balances if we have lastTokenId
  const { 
    data: balances,
    isError: isBalancesError,
    error: balancesError 
  } = useContractRead({
    address: TOKEN_ADDRESS,
    abi: [{
      "inputs": [
        {"internalType": "address[]","name": "accounts","type": "address[]"},
        {"internalType": "uint256[]","name": "ids","type": "uint256[]"}
      ],
      "name": "balanceOfBatch",
      "outputs": [{"internalType": "uint256[]","name": "","type": "uint256[]"}],
      "stateMutability": "view",
      "type": "function"
    }],
    functionName: 'balanceOfBatch',
    args: lastTokenId ? [
      Array(Number(lastTokenId) + 1).fill(address),
      Array.from({length: Number(lastTokenId) + 1}, (_, i) => i)
    ] : undefined,
    enabled: !!lastTokenId && !!address,
    onSuccess: (data) => {
      console.log("Balances Success:", data);
      setDebugInfo(prev => ({...prev, balances: data}));
    },
    onError: (err) => {
      console.error("Balances Error:", err);
      setDebugInfo(prev => ({...prev, error: err.message}));
    }
  });

  // Debug section to display raw data
  const renderDebugSection = () => (
    <div className="bg-gray-50 p-4 mt-4 rounded-lg text-sm font-mono">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div>Connected Address: {address || 'Not connected'}</div>
      <div>Last Token ID: {debugInfo.lastTokenId?.toString() || 'Not loaded'}</div>
      <div>Raw Balances: {debugInfo.balances ? JSON.stringify(debugInfo.balances) : 'Not loaded'}</div>
      {debugInfo.error && (
        <div className="text-red-500">Error: {debugInfo.error}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      {renderDebugSection()}

      <div className="bg-white">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Network Statistics</h2>
        <Piechart 
          myBalance={0} 
          totalSupply={100} 
        />
      </div>

      <div className="bg-white">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">My Documents</h2>
        <div className="text-center text-gray-500 py-8">
          Loading documents...
        </div>
      </div>
    </div>
  );
};

export default I4TDashboard;