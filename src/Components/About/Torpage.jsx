// src/Components/About/Torpage.jsx
import React, { useState, useEffect } from 'react';
import { documentsService } from '../../services/documentsService';
import { torService } from '../../services/torService';
import { useAuth } from '../../Components/AuthContext'; // Correction de la casse
import DocumentViewer from '../Library/components/DocumentViewer';

const SignatoriesList = ({ documentId }) => {
  // Garder le composant SignatoriesList identique
  const [signatories, setSignatories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSignatories = async () => {
      if (!documentId) {
        setLoading(false);
        return;
      }

      try {
        const data = await torService.getSignatories(documentId);
        setSignatories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading signatories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSignatories();
  }, [documentId]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No date';
    // Gestion des deux formats possibles de timestamp Firestore
    const date = timestamp.seconds 
      ? new Date(timestamp.seconds * 1000) 
      : new Date(timestamp);

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        Error loading signatories: {error}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="font-serif text-lg font-semibold mb-4">Signatories</h4>
      {signatories && signatories.length > 0 ? (
        <div className="grid gap-4 bg-white/30 backdrop-blur-sm rounded-lg p-4">
          {signatories.map((signatory) => (
            <div key={signatory.id} className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div>
                <p className="font-medium">{signatory.email || 'Unknown user'}</p>
                {signatory.organization && (
                  <p className="text-sm text-gray-600">{signatory.organization}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(signatory.acceptedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center py-4 text-gray-500 bg-white/30 backdrop-blur-sm rounded-lg">
          No signatories yet
        </p>
      )}
    </div>
  );
};

const Torpage = () => {
  const { user } = useAuth(); // Ajout de useAuth
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const searchTermsofreference = async () => {
      try {
        setIsSearching(true);
        const searchResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        const formattedResults = searchResults.map(result => ({
          id: result.id,
          title: result.title,
          excerpt: result.description || result.excerpt,
          author: result.author || result.creatorAddress,
          ipfsCid: result.ipfsCid,
          date: result.createdAt 
            ? new Date(result.createdAt.seconds * 1000).toLocaleDateString()
            : new Date().toLocaleDateString()
        }));
        setResults(formattedResults);
      } catch (err) {
        console.error('Search error:', err);
        setError('Error loading Terms of reference: ' + err.message);
      } finally {
        setIsSearching(false);
      }
    };

    searchTermsofreference();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="font-serif text-2xl font-bold mb-6">Terms of Reference</h2>

      {error && (
        <div className="text-red-600 mb-4 text-center">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {isSearching ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : results.length > 0 ? (
          results.map((result) => (
            <article key={result.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{result.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{result.author}</span>
                  <span>•</span>
                  <span>{result.date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="w-full md:col-span-1">
                    {result.ipfsCid && (
                      <DocumentViewer documentCid={result.ipfsCid.replace('ipfs://', '')} />
                    )}
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-gray-600">{result.excerpt}</p>
                  </div>
                </div>

                {/* Condition d'affichage pour les admin uniquement */}
                {user?.role === 'admin' && (
                  <SignatoriesList documentId={result.id} />
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No Terms of reference found
          </div>
        )}
      </div>
    </div>
  );
};

export default Torpage;