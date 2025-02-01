import axios from 'axios';

class IPFSService {
  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY;
    this.apiSecret = import.meta.env.VITE_PINATA_API_SECRET;
    this.baseURL = 'https://api.pinata.cloud';
    this.gateway = 'https://gateway.pinata.cloud/ipfs';
  }

  async uploadFile(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Ajout des métadonnées Pinata
      const pinataMetadata = {
        name: metadata.title || file.name,
        keyvalues: {
          type: 'I4TK_document',
          timestamp: new Date().toISOString(),
          ...metadata
        }
      };
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

      // Configuration Pinata pour le pinning
      const pinataOptions = {
        cidVersion: 1,
        wrapWithDirectory: false
      };
      formData.append('pinataOptions', JSON.stringify(pinataOptions));

      const response = await axios.post(`${this.baseURL}/pinning/pinFileToIPFS`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret
        },
        maxBodyLength: 'Infinity',
        maxContentLength: 'Infinity'
      });

      const cid = response.data.IpfsHash;
      return {
        cid,
        url: `ipfs://${cid}`,
        gatewayUrl: `${this.gateway}/${cid}`
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(error.response?.data?.message || 'Error uploading to IPFS');
    }
  }

  getGatewayURL(cid) {
    return `${this.gateway}/${cid}`;
  }
}

export const ipfsService = new IPFSService();