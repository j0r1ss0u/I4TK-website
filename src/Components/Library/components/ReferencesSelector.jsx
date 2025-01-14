import React, { useState, useEffect } from 'react';
import { documentsService } from '../../../services/documentsService';

const ReferencesSelector = ({ onChange, selectedRefs = [] }) => {
  const [publishedDocs, setPublishedDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Formater les dates pour l'affichage
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Charger les documents publiés au montage du composant
  useEffect(() => {
    const fetchPublishedDocs = async () => {
      try {
        const docs = await documentsService.getDocumentsByStatus('PUBLISHED');
        setPublishedDocs(docs);
      } catch (err) {
        setError('Erreur lors du chargement des documents publiés');
        console.error('Error fetching published docs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedDocs();
  }, []);

  // Gérer la sélection/déselection des documents
  const handleCheckboxChange = (tokenId) => {
    const newSelection = selectedRefs.includes(tokenId)
      ? selectedRefs.filter(id => id !== tokenId)
      : [...selectedRefs, tokenId];

    onChange(newSelection);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span>Chargement des documents publiés...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600">
        {error}
      </div>
    );
  }

  if (publishedDocs.length === 0) {
    return (
      <div className="p-4 text-gray-600">
        Aucun document publié disponible
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto px-2">
      {publishedDocs.map((doc) => (
        <label key={doc.tokenId} className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-colors">
          <input
            type="checkbox"
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={selectedRefs.includes(parseInt(doc.tokenId))}
            onChange={() => handleCheckboxChange(parseInt(doc.tokenId))}
          />
          <div className="ml-3 flex-1">
            <div className="flex items-start justify-between">
              <div className="font-medium text-gray-900">{doc.title}</div>
              <div className="text-xs text-gray-500 whitespace-nowrap ml-2">
                Token #{doc.tokenId}
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-700">{doc.authors}</div>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                {doc.programme}
              </span>
              <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                {formatDate(doc.createdAt)}
              </span>
              {doc.categories?.map((cat, index) => (
                <span key={index} className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </label>
      ))}
    </div>
  );
};

export default ReferencesSelector;