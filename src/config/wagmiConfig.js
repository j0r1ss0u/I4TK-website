// =============== IMPORTS ===============
import { http, createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createPublicClient, createWalletClient, custom } from 'viem';

// =============== CHAIN CONFIGURATION ===============
export const chains = [sepolia];

// =============== WAGMI CONFIGURATION ===============
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http()
});

const walletClient = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum)
});

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http()
  },
  connectors: [injected()]
});

// =============== CONTRACT CONFIGURATION ===============
export const contractConfig = {
  address: '0xa9870f477E6362E0810948fd87c0398c2c0a4F55',
  // Les rôles du contrat en constantes - conservés de la version précédente
  roles: {
    CONTRIBUTOR_ROLE: '0xe2889e7308860b3fe8df0daa86fccfea4d71e43776719a57be28cf90b6db81e9',
    VALIDATOR_ROLE: '0x21702c8af46127c7fa207f89d0b0a8441bb32959a0ac7df790e9ab1a25c98926',
    ADMIN_ROLE: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
    MINTER_ROLE: '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
  },
  // Nouvelle ABI complète du contrat I4TKNetwork
  abi: [
    {
      "inputs": [{"internalType": "address","name": "_I4TKdocTokenAddr","type": "address"}],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{"internalType": "uint256","name": "wrongTokenId","type": "uint256"}],
      "name": "tokenInReferenceNotExistOrNotValidated",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true,"internalType": "bytes32","name": "role","type": "bytes32"},
        {"indexed": true,"internalType": "bytes32","name": "previousAdminRole","type": "bytes32"},
        {"indexed": true,"internalType": "bytes32","name": "newAdminRole","type": "bytes32"}
      ],
      "name": "RoleAdminChanged",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true,"internalType": "bytes32","name": "role","type": "bytes32"},
        {"indexed": true,"internalType": "address","name": "account","type": "address"},
        {"indexed": true,"internalType": "address","name": "sender","type": "address"}
      ],
      "name": "RoleGranted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true,"internalType": "bytes32","name": "role","type": "bytes32"},
        {"indexed": true,"internalType": "address","name": "account","type": "address"},
        {"indexed": true,"internalType": "address","name": "sender","type": "address"}
      ],
      "name": "RoleRevoked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true,"internalType": "address","name": "creator","type": "address"},
        {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"},
        {"indexed": false,"internalType": "string","name": "tokenURI","type": "string"},
        {"indexed": false,"internalType": "uint256","name": "date","type": "uint256"}
      ],
      "name": "contentProposed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {"indexed": true,"internalType": "address","name": "creator","type": "address"},
        {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"},
        {"indexed": false,"internalType": "string","name": "tokenURI","type": "string"},
        {"indexed": false,"internalType": "uint256","name": "date","type": "uint256"}
      ],
      "name": "contentPublished",
      "type": "event"
    },
    {
      "inputs": [
        {"internalType": "address","name": "addr","type": "address"},
        {"internalType": "enum Profiles","name": "profile","type": "uint8"}
      ],
      "name": "registerMember",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "addr","type": "address"}],
      "name": "revokeMember",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "string","name": "tokenURI","type": "string"},
        {"internalType": "uint256[]","name": "references","type": "uint256[]"}
      ],
      "name": "proposeContent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
      "name": "valideContent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "bytes32","name": "role","type": "bytes32"},
        {"internalType": "address","name": "account","type": "address"}
      ],
      "name": "grantRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "bytes32","name": "role","type": "bytes32"},
        {"internalType": "address","name": "account","type": "address"}
      ],
      "name": "revokeRole",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {"internalType": "bytes32","name": "role","type": "bytes32"},
        {"internalType": "address","name": "account","type": "address"}
      ],
      "name": "hasRole",
      "outputs": [{"internalType": "bool","name": "","type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

// =============== CONTRACT HELPERS ===============
export const getContractConfig = () => {
  return {
    address: contractConfig.address,
    abi: contractConfig.abi,
    publicClient,
    walletClient
  };
};

// =============== ROLE HELPERS ===============
export const getRoleHash = (role) => {
  return contractConfig.roles[`${role}_ROLE`];
};

export { publicClient, walletClient };
export default config;