// =============== IMPORTS ===============
import { contractConfig, publicClient, walletClient } from '../config/wagmiConfig';

// =============== CONSTANTS ===============
const ROLES = {
  CONTRIBUTOR: 'CONTRIBUTOR',
  VALIDATOR: 'VALIDATOR',
  ADMIN: 'ADMIN'
};

// =============== ROLE MANAGEMENT FUNCTIONS ===============
export const web3RoleService = {
  async checkRole(address, role) {
    try {
      const roleHash = contractConfig.roles[`${role}_ROLE`];
      const data = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'hasRole',
        args: [roleHash, address]
      });
      return data;
    } catch (error) {
      console.error(`Error checking ${role} role:`, error);
      return false;
    }
  },

  async grantRole(address, role) {
    try {
      const roleHash = contractConfig.roles[`${role}_ROLE`];
      const { request } = await publicClient.simulateContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'grantRole',
        args: [roleHash, address]
      });
      return await walletClient.writeContract(request);
    } catch (error) {
      console.error('Error granting role:', error);
      throw error;
    }
  }
};

// =============== ERC1155 MANAGEMENT FUNCTIONS ===============
export const web3TokenService = {
  async mint(address, tokenURI, references = []) {
    try {
      const { request } = await publicClient.simulateContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'mint',
        args: [address, tokenURI, references, "0x"]
      });
      return await walletClient.writeContract(request);
    } catch (error) {
      console.error('Error minting token:', error);
      throw error;
    }
  },

  async getLastTokenId() {
    try {
      const data = await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'lastTokenId'
      });
      return Number(data);
    } catch (error) {
      console.error('Error getting last token ID:', error);
      throw error;
    }
  }
};

// =============== UTILITY FUNCTIONS ===============
export const web3Utils = {
  async verifyContractConnection() {
    try {
      await publicClient.readContract({
        address: contractConfig.address,
        abi: contractConfig.abi,
        functionName: 'supportsInterface',
        args: ['0x01ffc9a7']
      });
      return true;
    } catch (error) {
      console.error('Error verifying contract connection:', error);
      return false;
    }
  }
};

export default {
  roles: ROLES,
  roleService: web3RoleService,
  tokenService: web3TokenService,
  utils: web3Utils
};