// =============== IMPORTS ===============
import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';

// =============== CONSTANTES ===============
const PROGRAMMES = [
  "Platform Governance",
  "Disinformation & Fact-checking",
  "Digital Rights & Inclusion",
  "Technology & Social Cohesion"
];

const CATEGORIES = [
  "Research Paper",
  "Case Study",
  "Policy Brief",
  "Technical Report"
];

// =============== COMPOSANTS AUXILIAIRES ===============
const NetworkHelp = () => (
  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
    <h3 className="font-medium mb-2">Besoin d'ETH Sepolia ?</h3>
    <p>Pour soumettre un document, vous avez besoin d'ETH sur le réseau de test Sepolia. Voici comment en obtenir :</p>
    <ol className="list-decimal ml-4 mt-2 space-y-1">
      <li>Visitez le faucet Sepolia (Alchemy ou Infura)</li>
      <li>Entrez votre adresse de portefeuille</li>
      <li>Recevez des ETH de test gratuits</li>
    </ol>
    <p className="mt-2">
      <a 
        href="https://sepoliafaucet.com" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-blue-600 hover:text-blue-800"
      >
        Obtenir des ETH Sepolia →
      </a>
    </p>
  </div>
);

// =============== COMPOSANT PRINCIPAL ===============
export default function SubmitContribution() {
  // =============== HOOKS ET ÉTATS ===============
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Ajout des nouveaux hooks pour la vérification des rôles
  const { data: minterRole } = useReadContract({
    ...contractConfig,
    functionName: 'MINTER_ROLE'
  });

  const { data: hasMinterRole } = useReadContract({
    ...contractConfig,
    functionName: 'hasRole',
    args: [minterRole, address],
    enabled: !!minterRole && !!address,
  });

  // États existants
  const [formData, setFormData] = useState({
    ipfsCid: '',
    title: '',
    authors: '',
    description: '',
    programme: '',
    categories: [],
    references: ''
  });
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  
  // =============== GESTIONNAIRES D'ÉVÉNEMENTS ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('=== Début de la Soumission du Document ===');
      setError('');
      setTxHash(null);
      setShowNetworkHelp(false);

      // Vérification du rôle MINTER_ROLE
      if (!hasMinterRole) {
        throw new Error("Vous n'avez pas le rôle MINTER_ROLE requis pour créer un document. Contactez l'administrateur.");
      }

      // Validation
      if (!formData.ipfsCid || !formData.title || !formData.authors || !formData.programme) {
        throw new Error('Veuillez remplir tous les champs requis');
      }

      // Vérification du solde
      const hasBalance = await checkBalance();
      if (!hasBalance) {
        throw new Error('Vérifiez que vous avez suffisamment d\'ETH Sepolia pour la transaction');
      }

      // Formatage des références
      const references = formData.references
        ? formData.references.split(',').map(ref => parseInt(ref.trim()))
        : [];

      // Récupération du prochain tokenId
      const nextTokenId = lastTokenId ? parseInt(lastTokenId) + 1 : 0;
      console.log('1. Prochain token ID:', nextTokenId);

      // Formatage du token URI
      console.log('2. Préparation du formatTokenURI avec les arguments:', {
        nextTokenId,
        ipfsCid: formData.ipfsCid,
        title: formData.title,
        authors: formData.authors,
        description: formData.description,
        programme: formData.programme,
        categories: formData.categories
      });

      const tokenURIResult = await writeContractAsync({
        ...contractConfig,
        functionName: 'formatTokenURI',
        args: [
          nextTokenId,
          formData.ipfsCid,
          formData.title,
          formData.authors,
          formData.description,
          formData.programme,
          formData.categories
        ]
      });

      console.log('3. URI du token formaté:', tokenURIResult);

      // Création du document dans Firestore
      const docData = {
        ipfsCid: formData.ipfsCid,
        title: formData.title,
        authors: formData.authors,
        description: formData.description,
        programme: formData.programme,
        categories: formData.categories,
        references: formData.references,
        creatorAddress: address,
        tokenId: nextTokenId,
        tokenURI: tokenURIResult,
        status: 'PENDING'
      };

      console.log('4. Création du document dans Firestore');
      const newDocId = await documentsService.addDocument(docData);
      setDocumentId(newDocId);
      console.log('5. Document créé avec ID:', newDocId);

      // Soumission au smart contract
      console.log('6. Soumission à la blockchain avec les arguments:', {
        address,
        tokenURIResult,
        references,
      });

      const tx = await writeContractAsync({
        ...contractConfig,
        functionName: 'mint',
        args: [address, tokenURIResult, references, "0x"]
      });

      console.log('7. Transaction soumise:', tx);
      setTxHash(tx);

    } catch (err) {
      console.error('❌ Erreur de soumission:', err);

      // Gestion spécifique des erreurs
      if (documentId) {
        try {
          await documentsService.updateDocumentStatus(documentId, 'FAILED');
          console.log('Document marqué comme échoué dans Firestore');
        } catch (firebaseErr) {
          console.error('Erreur lors de la mise à jour du statut:', firebaseErr);
        }
      }

      // Messages d'erreur personnalisés
      if (err.message.includes('MINTER_ROLE')) {
        setError('Vous n\'avez pas les permissions nécessaires pour créer un document. Contactez l\'administrateur.');
      } else if (err.message.includes('insufficient funds')) {
        setError('Fonds insuffisants pour la transaction. Vous avez besoin d\'ETH Sepolia pour payer les frais de gas.');
        setShowNetworkHelp(true);
      } else if (err.message.includes('user rejected transaction')) {
        setError('Transaction annulée par l\'utilisateur.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la soumission');
      }
    }
  };
  
  // =============== FONCTIONS UTILITAIRES ===============
  const resetForm = () => {
    setFormData({
      ipfsCid: '',
      title: '',
      authors: '',
      description: '',
      programme: '',
      categories: [],
      references: ''
    });
    setTxHash(null);
    setDocumentId(null);
    setError('');
    setShowNetworkHelp(false);
  };

  const handleError = async (errorMessage) => {
    console.error('Gestion de l\'erreur:', errorMessage);

    if (documentId) {
      try {
        await documentsService.updateDocumentStatus(documentId, 'FAILED');
        console.log('Document marqué comme échoué dans Firestore');
      } catch (firebaseErr) {
        console.error('Erreur lors de la mise à jour du statut:', firebaseErr);
      }
    }

    if (errorMessage.includes('insufficient funds')) {
      setError('Fonds insuffisants pour la transaction. Vous avez besoin d\'ETH Sepolia pour payer les frais de gas.');
      setShowNetworkHelp(true);
    } else {
      setError(errorMessage || 'Une erreur est survenue lors de la soumission');
    }
  };

  // Vérification du solde avant transaction
  const checkBalance = async () => {
    try {
      const gasEstimate = await writeContractAsync.estimateGas({
        ...contractConfig,
        functionName: 'mint',
        args: [address, '', [], "0x"]
      });

      if (!gasEstimate) {
        throw new Error('Impossible d\'estimer les frais de gas');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du solde:', error);
      return false;
    }
  };

  // =============== CONDITIONS DE RENDU ===============
  if (!address) {
    return (
      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded">
        Veuillez connecter votre portefeuille pour soumettre du contenu.
      </div>
    );
  }

  // Nouvelle condition pour le rôle
  if (!hasMinterRole) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
        <h3 className="font-medium">Permission requise</h3>
        <p className="mt-2">
          Vous avez besoin du rôle MINTER_ROLE pour pouvoir soumettre des documents.
          Contactez l'administrateur du contrat pour obtenir ce rôle.
        </p>
        <p className="mt-2 text-sm">
          Adresse du contrat : {contractConfig.address}
        </p>
      </div>
    );
  }

  // =============== RENDU DU COMPOSANT ===============
  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-serif mb-6">Soumettre du contenu pour révision I4TK</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage des erreurs */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Statut de la transaction */}
          {(txHash || isTxPending) && (
            <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
              <p>Transaction {isTxPending ? 'en cours' : 'soumise'}...</p>
              <p className="text-sm mt-2">
                Note: Cette opération nécessite des frais de transaction (gas) en ETH sur le réseau Sepolia.
              </p>
              {txHash && (
                <div className="text-sm mt-2">
                  Hash de transaction: 
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:text-blue-800 break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Message de succès */}
          {isTxSuccess && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Document soumis avec succès !
            </div>
          )}

          {/* Information sur le rôle */}
          {!hasMinterRole && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="font-medium text-yellow-800">Permission requise</h3>
              <p className="mt-1 text-yellow-700">
                Vous avez besoin du rôle MINTER_ROLE pour soumettre des documents.
                Contactez l'administrateur du contrat.
              </p>
              <p className="mt-2 text-xs text-yellow-600">
                Adresse du contrat : {contractConfig.address}
              </p>
            </div>
          )}

          {/* Champ IPFS CID */}
          <div className="space-y-2">
            <label htmlFor="ipfsCid" className="block text-sm font-medium text-gray-700">
              CID IPFS ou URL du Document<span className="text-red-500">*</span>
            </label>
            <input
              id="ipfsCid"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.ipfsCid}
              onChange={e => setFormData({...formData, ipfsCid: e.target.value})}
              placeholder="Qm... ou https://..."
              required
            />
          </div>

          {/* Champ Titre */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Titre<span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          {/* Champ Auteurs */}
          <div className="space-y-2">
            <label htmlFor="authors" className="block text-sm font-medium text-gray-700">
              Auteurs<span className="text-red-500">*</span>
            </label>
            <input
              id="authors"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.authors}
              onChange={e => setFormData({...formData, authors: e.target.value})}
              placeholder="Entrez les auteurs séparés par des virgules"
              required
            />
          </div>

          {/* Champ Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* Sélection du Programme */}
          <div className="space-y-2">
            <label htmlFor="programme" className="block text-sm font-medium text-gray-700">
              Programme<span className="text-red-500">*</span>
            </label>
            <select
              id="programme"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.programme}
              onChange={e => setFormData({...formData, programme: e.target.value})}
              required
            >
              <option value="">Sélectionner un programme</option>
              {PROGRAMMES.map(prog => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection des Catégories */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégories
            </label>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(category => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.categories.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          categories: [...formData.categories, category]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          categories: formData.categories.filter(c => c !== category)
                        });
                      }
                    }}
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Champ Références */}
          <div className="space-y-2">
            <label htmlFor="references" className="block text-sm font-medium text-gray-700">
              Références bibliographiques (IDs des tokens)
            </label>
            <input
              id="references"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.references}
              onChange={e => setFormData({...formData, references: e.target.value})}
              placeholder="Entrez les IDs des tokens séparés par des virgules (ex: 1,2,3)"
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isTxPending || !hasMinterRole}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTxPending ? 'Soumission en cours...' : 'Soumettre la contribution'}
          </button>
        </form>
      </div>
    </div>
  );
                    }