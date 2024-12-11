import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { contractConfig } from '../config/wagmiConfig';

export function useContract() {
  // Lecture du dernier ID de token
  const { data: lastTokenId } = useContractRead({
    ...contractConfig,
    functionName: 'lastTokenId',
    watch: true,
  });

  // Lecture de l'URI d'un token
  const getTokenURI = (tokenId) => {
    const { data: uri } = useContractRead({
      ...contractConfig,
      functionName: 'uri',
      args: [tokenId],
    });
    return uri;
  };

  // Préparation de la fonction mint
  const { config: mintConfig } = usePrepareContractWrite({
    ...contractConfig,
    functionName: 'mint',
  });

  // Fonction d'écriture pour le mint
  const { write: mint, isLoading: isMinting } = useContractWrite(mintConfig);

  // Lecture des contributions pour un token
  const getContributions = (tokenId) => {
    const { data: contributions } = useContractRead({
      ...contractConfig,
      functionName: 'getcontributions',
      args: [tokenId],
    });
    return contributions;
  };

  // Lecture du créateur d'un token
  const getTokenCreator = (tokenId) => {
    const { data: creator } = useContractRead({
      ...contractConfig,
      functionName: 'getTokenCreator',
      args: [tokenId],
    });
    return creator;
  };

  return {
    lastTokenId,
    getTokenURI,
    mint,
    isMinting,
    getContributions,
    getTokenCreator,
  };
}