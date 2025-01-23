// =================================================================================
// 1. IMPORTS & DEPENDENCIES
// =================================================================================
import React, { useState, useEffect } from 'react';
import { GitFork, ArrowLeft } from 'lucide-react';
import DocumentGenealogy from './components/DocumentGenealogy';
import { documentsService } from '../../services/documentsService';

// =================================================================================
// 2. COMPONENT DEFINITION
// =================================================================================
const GenealogyPage = ({ tokenId, onBack, currentLang }) => {
  // -----------------------------------------------------------------------------
  // 2.1 Hooks & State
  // -----------------------------------------------------------------------------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentTitle, setDocumentTitle] = useState('');

  // -----------------------------------------------------------------------------
  // 2.2 Effects
  // -----------------------------------------------------------------------------
  useEffect(() => {
    const fetchDocumentTitle = async () => {
      if (!tokenId) {
        setError('Token ID non fourni');
        return;
      }

      try {
        setLoading(true);
        const doc = await documentsService.getDocumentByTokenId(tokenId);
        if (doc) {
          setDocumentTitle(doc.title);
        } else {
          setError('Document non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du document:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentTitle();
  }, [tokenId]);

  // -----------------------------------------------------------------------------
  // 2.3 Render Helpers
  // -----------------------------------------------------------------------------
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {currentLang === 'fr' 
                  ? `Erreur lors du chargement de la généalogie : ${error}`
                  : `Error loading genealogy: ${error}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------------
  // 2.4 Main Render
  // -----------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white/50 backdrop-blur-sm rounded-lg shadow">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GitFork className="w-6 h-6 text-gray-500" />
              <div>
                <h1 className="text-2xl font-serif">
                  {currentLang === 'en' ? 'Arbre de citations' : 'Citation tree'}
                </h1>
                {documentTitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {currentLang === 'fr' ? 'Document : ' : 'Document: '}{documentTitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentLang === 'en' ? 'Retour à la bibliothèque' : 'Back to Library'}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <DocumentGenealogy 
              tokenId={tokenId} 
              currentLang={currentLang}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default GenealogyPage;