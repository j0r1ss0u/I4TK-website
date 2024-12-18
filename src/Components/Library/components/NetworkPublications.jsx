import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';
import { AlertCircle, CheckCircle2, Clock, ExternalLink, ZoomIn, Download } from 'lucide-react';
import DocumentValidator from "./DocumentValidator";
import DocumentViewer from './DocumentViewer';


// =============== CONSTANTS ===============
const ValidationStatus = {
  PENDING: '0/4',
  VALIDATION_1: '1/4',
  VALIDATION_2: '2/4',
  VALIDATION_3: '3/4',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED'
};

// =============== MAIN COMPONENT ===============
const NetworkPublications = ({ isWeb3Validator, isWeb3Admin, isWebMember, isWebAdmin, address, networkContract }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // =============== UTILITY FUNCTIONS ===============
  const canValidate = (doc) => {
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
                  <DocumentValidator
                    document={doc}
                    documentsService={documentsService}
                  />
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