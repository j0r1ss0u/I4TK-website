// =============== IMPORTS ===============
import React, { useState, useEffect } from 'react';
import { documentsService } from '../../services/documentsService';
import DocumentViewer from '../Library/components/DocumentViewer';

// =============== COMPOSANT PRINCIPAL ===============
const LibraryRAG = ({ currentLang = 'en' }) => {
  // =============== ÉTATS ===============
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [testStatus, setTestStatus] = useState('');

  // =============== INITIALISATION ET CONFIGURATION ===============
  useEffect(() => {
    console.log("=== Test de la configuration Firebase ===");
    console.log("Firebase config:", {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    });
  }, []);

  // =============== RECHERCHE EN TEMPS RÉEL ===============
  useEffect(() => {
    // Fonction pour gérer la recherche
    const handleSearch = async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await documentsService.semanticSearch(
          searchQuery,
          currentLang
        );

        const formattedResults = searchResults.map(result => ({
          id: result.id,
          title: result.title,
          excerpt: result.description || result.excerpt,
          relevance: result.relevance,
          author: result.author || result.creatorAddress,
          ipfsCid: result.ipfsCid,
          date: result.createdAt 
            ? new Date(result.createdAt.seconds * 1000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        }));

        setResults(formattedResults);
      } catch (err) {
        console.error('Search error:', err);
        setError(currentLang === 'en' 
          ? 'Error performing search' 
          : 'Erreur lors de la recherche'
        );
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Timer pour le debounce
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300); // Délai de 300ms

    // Nettoyage
    return () => clearTimeout(timeoutId);
  }, [query, currentLang]); // Se déclenche quand la requête change

  // =============== RENDU DU COMPOSANT ===============
  return (
    <div className="container mx-auto">
      {/* Titre */}
      <h2 className="font-serif text-xl font-bold mb-6">
        {currentLang === 'en' 
          ? 'Search for title, author or content:' 
          : 'Rechercher un titre, un auteur ou un contenu :'}
      </h2>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={currentLang === 'en' 
            ? 'Search in the knowledge base...' 
            : 'Rechercher dans la base de connaissances...'}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={currentLang === 'en' ? 'Search' : 'Rechercher'}
        />
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="text-red-600 mb-4 text-center">
          {error}
        </div>
      )}

      {/* Liste des résultats */}
      <div className="grid grid-cols-1 gap-6">
        {isSearching ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length > 0 ? (
          results.map((result) => (
            <article 
              key={result.id} 
              className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-4">
                {/* En-tête du résultat */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {result.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{result.author}</span>
                    <span>•</span>
                    <span>{result.date}</span>
                    <span>•</span>
                    <span className="text-blue-600">
                      {Math.round(result.relevance*100)}%
                      {currentLang === 'en' ? ' relevant' : ' pertinent'}
                    </span>
                  </div>
                </div>

                {/* Contenu du résultat - responsive */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                  {/* Prévisualisation du document */}
                  <div className="w-full md:col-span-1">
                    {result.ipfsCid && (
                      <DocumentViewer 
                        documentCid={result.ipfsCid.replace('ipfs://', '')} 
                      />
                    )}
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3">
                    <p className="text-gray-600">
                      {result.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : query && (
          <div className="text-center py-8 text-gray-500">
            {currentLang === 'en' ? 'No results found' : 'Aucun résultat trouvé'}
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryRAG;