// =================================================================================
// Contract Addresses
// =================================================================================
export const I4TKTokenAddress = "0x06Fc114E58b8Be5d03b5B7b03ab7f0D3C9605288";
export const I4TKnetworkAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// =================================================================================
// Contract ABIs
// =================================================================================
export const I4TKTokenABI = [
  // Fonctions de lecture importantes pour I4TKDashboard
  {
    "inputs": [],
    "name": "lastTokenId",
    "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address[]", "name": "accounts", "type": "address[]"},
      {"internalType": "uint256[]", "name": "ids", "type": "uint256[]"}
    ],
    "name": "balanceOfBatch",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "uri",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];