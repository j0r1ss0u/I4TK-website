// =============== IMPORTS ===============
import React, { useState, useEffect } from 'react';
import { useAccount, useContractWrite, useWaitForTransactionReceipt } from 'wagmi';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { contractConfig } from '../../../config/wagmiConfig';  // Plus besoin de publicClient
import { documentsService } from '../../../services/documentsService';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, ZoomIn, Download } from 'lucide-react';

// =============== CONSTANTS ===============
const ValidationStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: '0/4',
  VALIDATED: 'VALIDATED',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// =============== DOCUMENT VIEWER COMPONENT ===============
const DocumentViewer = ({ documentCid, title }) => {
  const [viewerError, setViewerError] = useState(false);
  const documentUrl = `${IPFS_GATEWAY}${documentCid}`;

  useEffect(() => {
    // Vérifier si le document est accessible
    const checkDocument = async () => {
      try {
        const response = await fetch(documentUrl, { method: 'HEAD' });
        if (!response.ok) setViewerError(true);
      } catch (error) {
        console.error('Erreur lors de la vérification du document:', error);
        setViewerError(true);
      }
    };
    checkDocument();
  }, [documentUrl]);

  if (viewerError) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-2">Options d'accès au document:</h4>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <a href={`ipfs://${documentCid}`} className="text-blue-600 hover:underline inline-flex items-center">
              Ouvrir avec IPFS Desktop
              <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </li>
          <li>
            <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
              Ouvrir via la gateway IPFS
              <ExternalLink className="ml-1 w-4 h-4" />
            </a>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="h-[200px] relative">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={documentUrl} onError={() => setViewerError(true)} />
      </Worker>
      <div className="absolute bottom-0 right-0 p-2 bg-white rounded-tl-lg shadow flex gap-2">
        <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-gray-100 rounded" title="Ouvrir">
          <ZoomIn className="w-4 h-4" />
        </a>
        <a href={documentUrl} download className="p-1 hover:bg-gray-100 rounded" title="Télécharger">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

// =============== MAIN COMPONENT ===============
const NetworkPublications = ({ isWeb3Validator, isWeb3Admin, isWebMember, isWebAdmin, address }) => {
  // =============== STATE MANAGEMENT ===============
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validationInProgress, setValidationInProgress] = useState({});
  const [error, setError] = useState(null);

  // =============== CONTRACT INTERACTIONS ===============
  const { writeAsync: validateContent } = useContractWrite({
    ...contractConfig,
    functionName: 'valideContent',
  });

  // =============== DATA LOADING ===============
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        const docs = await documentsService.getDocuments();
        console.log("Documents chargés:", docs);
        const filteredDocs = docs.filter(doc => {
          if (!doc) return false;
          if (doc.validationStatus === ValidationStatus.PUBLISHED) return true;
          return isWebMember || isWebAdmin;
        });
        setDocuments(filteredDocs);
      } catch (err) {
        console.error("Erreur chargement documents:", err);
        setError('Erreur lors du chargement des documents: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDocuments();
  }, [isWebMember, isWebAdmin]);

  // =============== VALIDATION HANDLER ===============
  const handleValidate = async (docId) => {
    try {
      const doc = documents.find(d => d.id === docId);
      if (!doc) {
        throw new Error('Document introuvable');
      }
      const tokenId = doc.tokenId;
      if (!tokenId) {
        throw new Error('TokenId manquant pour ce document');
      }

      setValidationInProgress(prev => ({ ...prev, [docId]: true }));
      setError(null);

      const tokenIdBigInt = BigInt(tokenId);
      console.log("Validation du tokenId:", tokenIdBigInt.toString());

      const tx = await validateContent({
        args: [tokenIdBigInt],
      });

      await documentsService.updateDocumentStatus(docId, ValidationStatus.IN_PROGRESS);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        setDocuments(prev => prev.map(d => 
          d.id === docId ? { ...d, validationStatus: ValidationStatus.IN_PROGRESS } : d
        ));
      }
    } catch (err) {
      console.error("Erreur de validation:", err);
      setError(err.message);
      await documentsService.updateDocumentStatus(docId, ValidationStatus.FAILED);
    } finally {
      setValidationInProgress(prev => ({ ...prev, [docId]: false }));
    }
  };

  // =============== UTILITY FUNCTIONS ===============
  const canValidate = (doc) => {
    console.log("Vérification des droits de validation:", {
      isWeb3Validator,
      isWeb3Admin,
      docCreator: doc?.creatorAddress,
      currentAddress: address,
      validators: doc?.validators
    });

    if (!doc) return false;
    if (!isWeb3Validator && !isWeb3Admin) return false;
    if (doc.creatorAddress === address) return false;
    if (doc.validators?.includes(address)) return false;
    if (doc.validationStatus === ValidationStatus.PUBLISHED) return false;
    return true;
  };

  const getDocumentCid = (doc) => {
    if (!doc || !doc.ipfsCid) return null;
    let cid = doc.ipfsCid;
    if (cid.startsWith('ipfs://')) {
      cid = cid.replace('ipfs://', '');
    }
    cid = cid.trim();
    return cid.match(/^[a-zA-Z0-9]{46,62}$/) ? cid : null;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date inconnue';
    if (timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(timestamp).toLocaleString('fr-FR');
  };
  // =============== UI HELPERS ===============
  const getStatusBadge = (status) => {
    const badges = {
      [ValidationStatus.PENDING]: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: "En attente"
      },
      [ValidationStatus.IN_PROGRESS]: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        text: "En cours"
      },
      [ValidationStatus.PUBLISHED]: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle2,
        text: "Publié"
      },
      [ValidationStatus.FAILED]: {
        color: "bg-red-100 text-red-800",
        icon: AlertCircle,
        text: "Échec"
      }
    };

    const badge = badges[status] || badges[ValidationStatus.PENDING];

    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <badge.icon className="w-4 h-4" />
        {badge.text}
      </span>
    );
  };
  // =============== RENDER STATES ===============
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        <h4 className="font-semibold">Erreur</h4>
        <p>{error}</p>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Aucun document trouvé</h3>
        <p className="mt-2 text-sm text-gray-500">Les documents apparaîtront ici une fois soumis.</p>
      </div>
    );
  }

  // =============== MAIN RENDER ===============
  return (
    <div className="grid grid-cols-1 gap-6">
      {documents.map((doc) => {
        if (!doc) return null;
        const documentCid = getDocumentCid(doc);

        return (
          <div key={doc.id} className="bg-white shadow-sm rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex">
              <div className="w-48 mr-4">
                {documentCid && (
                  <div className="border rounded-lg overflow-hidden">
                    <DocumentViewer documentCid={documentCid} title={doc.title} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-serif font-bold text-gray-900">{doc.title}</h3>
                  {getStatusBadge(doc.validationStatus)}
                </div>
                <div className="prose prose-sm max-w-none mb-4">
                  <p>{doc.description || 'Pas de description disponible'}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Auteurs: {doc.authors}</span>
                  <span>Créé le: {formatDate(doc.createdAt)}</span>
                </div>
                {canValidate(doc) && (
                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      onClick={() => handleValidate(doc.id)}
                      disabled={validationInProgress[doc.id]}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                                disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {validationInProgress[doc.id] ? 'Validation...' : 'Valider'}
                    </button>
                  </div>
                )}
                {doc.validationStatus === ValidationStatus.IN_PROGRESS && (
                  <div className="mt-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Progression</span>
                      <span className="text-sm font-medium">{doc.validationStatus}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(parseInt(doc.validationStatus) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NetworkPublications;