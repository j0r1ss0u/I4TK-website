import React, { useState } from 'react';

const LibraryRAG = ({ currentLang = 'en' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Simulation de résultats de recherche
  const mockResults = [
    {
      id: '1',
      title: 'Climate Change Adaptation Strategies',
      excerpt: 'Comprehensive analysis of climate change adaptation strategies in developing countries',
      relevance: 0.95,
      author: 'Dr. Sarah Johnson',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Sustainable Development Goals Progress Report',
      excerpt: 'Assessment of global progress towards achieving the UN Sustainable Development Goals',
      relevance: 0.88,
      author: 'United Nations Research Team',
      date: '2024-01-10'
    },
    {
      id: '3',
      title: 'Digital Innovation in Education',
      excerpt: 'Impact of digital technologies on educational outcomes in rural areas',
      relevance: 0.82,
      author: 'Prof. Michael Chen',
      date: '2024-01-05'
    },
    {
      id: '4',
      title: 'Global Health Initiatives',
      excerpt: 'Evaluation of international health programs and their effectiveness',
      relevance: 0.78,
      author: 'Dr. Emily Martinez',
      date: '2023-12-28'
    }
  ];

  const handleSearch = (searchQuery) => {
    setIsSearching(true);
    // Simuler un délai de recherche
    setTimeout(() => {
      // Filtrer les résultats mockés en fonction de la requête
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filteredResults);
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {currentLang === 'en' ? 'Search Library' : 'Rechercher dans la bibliothèque'}
      </h2>

      {/* Barre de recherche */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={currentLang === 'en' ? 'Search publications...' : 'Rechercher des publications...'}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Résultats */}
      <div className="grid grid-cols-1 gap-6">
        {isSearching ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          results.length > 0 ? (
            results.map((result) => (
              <article key={result.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {result.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {result.excerpt}
                  </p>
                  <div className="flex flex-wrap justify-between items-center">
                    <span className="text-sm text-blue-600">
                      {Math.round(result.relevance * 100)}% {currentLang === 'en' ? 'relevant' : 'pertinent'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {result.author}
                    </span>
                    <button className="mt-2 sm:mt-0 text-blue-600 hover:text-blue-800 transition-colors">
                      {currentLang === 'en' ? 'View details' : 'Voir détails'}
                    </button>
                  </div>
                </div>
              </article>
            ))
          ) : query && (
            <div className="text-center py-8 text-gray-500">
              {currentLang === 'en' ? 'No results found' : 'Aucun résultat trouvé'}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LibraryRAG;