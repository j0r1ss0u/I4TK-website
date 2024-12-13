// =============== IMPORTS ===============
import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractConfig } from '../../../config/wagmiConfig';
import { documentsService } from '../../../services/documentsService';

// =============== CONSTANTS ===============
const PROGRAMMES = [
  "I4TK Opteam",
  "Platform Governance",
  "Disinformation & Fact-checking",
  "Digital Rights & Inclusion",
  "Technology & Social Cohesion"
];

const CATEGORIES = [
  "Guidelines",
  "Research Paper",
  "Case Study",
  "Policy Brief",
  "Technical Report",
  "Internal document"
];

// =============== AUXILIARY COMPONENTS ===============
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
      <a href="https://sepoliafaucet.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
        Obtenir des ETH Sepolia →
      </a>
    </p>
  </div>
);

// =============== MAIN COMPONENT ===============
export default function SubmitContribution() {
  // =============== HOOKS AND STATES ===============
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [showNetworkHelp, setShowNetworkHelp] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  const [formData, setFormData] = useState({
    ipfsCid: '',
    title: '',
    authors: '',
    description: '',
    programme: '',
    categories: [],
    references: ''
  });

  // Transaction monitoring
  const { isLoading: isTxPending, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash
  });

  // =============== HANDLERS ===============
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('=== Début de la Soumission du Document ===');
      setError('');
      setTxHash(null);
      setShowNetworkHelp(false);

      // Validation
      if (!formData.ipfsCid || !formData.title || !formData.authors || !formData.programme) {
        throw new Error('Veuillez remplir tous les champs requis');
      }

      // Formatage des références
      const references = formData.references
        ? formData.references.split(',').map(ref => parseInt(ref.trim()))
        : [];

      // Préparation de l'appel à proposeContent
      console.log('Arguments pour proposeContent:', {
        tokenURI: formData.ipfsCid,
        references: references
      });

      const tx = await writeContractAsync({
        ...contractConfig,
        functionName: 'proposeContent',
        args: [formData.ipfsCid, references],
      });

      setTxHash(tx);
      console.log('Transaction soumise:', tx);

      // Création du document dans Firestore
      const docData = {
        ipfsCid: formData.ipfsCid,
        title: formData.title,
        authors: formData.authors,
        description: formData.description,
        programme: formData.programme,
        categories: formData.categories,
        references: references,
        creatorAddress: address,
        transactionHash: tx,
        validationStatus: "0/4",
        createdAt: new Date().toISOString()
      };

      const newDocId = await documentsService.addDocument(docData);
      setDocumentId(newDocId);

    } catch (err) {
      console.error('❌ Erreur de soumission:', err);
      handleError(err);
    }
  };

  // =============== UTILITY FUNCTIONS ===============
  const handleError = async (err) => {
    if (documentId) {
      try {
        await documentsService.updateDocumentStatus(documentId, 'FAILED');
        console.log('Document marqué comme échoué dans Firestore');
      } catch (firebaseErr) {
        console.error('Erreur lors de la mise à jour du statut:', firebaseErr);
      }
    }

    if (err.message.includes('insufficient funds')) {
      setError('Fonds insuffisants pour la transaction. Vous avez besoin d\'ETH Sepolia pour payer les frais de gas.');
      setShowNetworkHelp(true);
    } else if (err.message.includes('user rejected transaction')) {
      setError('Transaction annulée par l\'utilisateur.');
    } else {
      setError(err.message || 'Une erreur est survenue lors de la soumission');
    }
  };

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

  // =============== RENDER CONDITIONS ===============
  if (!address) {
    return (
      <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded">
        Veuillez connecter votre portefeuille pour soumettre du contenu.
      </div>
    );
  }

  // =============== COMPONENT RENDER ===============
  return (
    <div className="bg-white rounded-lg shadow-md max-w-3xl mx-auto">
      <div className="p-6">
        <h2 className="text-2xl font-serif mb-6">Soumettre du contenu pour révision I4TK</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Transaction Status */}
          {(txHash || isTxPending) && (
            <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-md">
              <p>Transaction {isTxPending ? 'en cours' : 'soumise'}...</p>
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

          {/* Success Message */}
          {isTxSuccess && (
            <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Document soumis avec succès !
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* IPFS CID Field */}
            <div>
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

            {/* Title Field */}
            <div>
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

            {/* Authors Field */}
            <div>
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

            {/* Description Field */}
            <div>
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

            {/* Programme Selection */}
            <div>
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
                  <option key={prog} value={prog}>{prog}</option>
                ))}
              </select>
            </div>

            {/* Categories Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégories
              </label>
              <div className="mt-2 grid grid-cols-2 gap-4">
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

            {/* References Field */}
            <div>
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isTxPending}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTxPending ? 'Soumission en cours...' : 'Soumettre la contribution'}
          </button>
        </form>

        {/* Network Help Component */}
        {showNetworkHelp && <NetworkHelp />}
      </div>
    </div>
  );
}