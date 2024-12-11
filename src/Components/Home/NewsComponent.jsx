import React from 'react';

const NewsComponent = ({ currentLang = 'en' }) => {
  // Données mockées pour simuler les actualités
  const mockNews = [
    {
      id: '1',
      webTitle: 'AI Research Breakthrough in Climate Change Analysis',
      webPublicationDate: '2024-12-08T10:00:00Z',
      webUrl: '#',
      fields: {
        trailText: 'New AI models help scientists better predict climate change patterns and potential solutions',
        // Utilisation d'une image placeholder en ligne
        thumbnail: 'https://picsum.photos/800/400?random=1'
      }
    },
    {
      id: '2',
      webTitle: 'Global Think Tanks Unite for Sustainable Development',
      webPublicationDate: '2024-12-08T09:30:00Z',
      webUrl: '#',
      fields: {
        trailText: 'Major research centers collaborate on innovative approaches to achieve UN Sustainable Development Goals',
        thumbnail: 'https://picsum.photos/800/400?random=2'
      }
    },
    {
      id: '3',
      webTitle: 'Technology Innovation in Educational Research',
      webPublicationDate: '2024-12-08T09:00:00Z',
      webUrl: '#',
      fields: {
        trailText: 'How new technologies are transforming academic research methodologies worldwide',
        thumbnail: 'https://picsum.photos/800/400?random=3'
      }
    },
    {
      id: '4',
      webTitle: 'Academic Collaboration Platform Launch',
      webPublicationDate: '2024-12-08T08:30:00Z',
      webUrl: '#',
      fields: {
        trailText: 'New digital platform connects researchers across Global South and North',
        thumbnail: 'https://picsum.photos/800/400?random=4'
      }
    },
    {
      id: '5',
      webTitle: 'Research Impact on Policy Making',
      webPublicationDate: '2024-12-08T08:00:00Z',
      webUrl: '#',
      fields: {
        trailText: 'How academic research is influencing global policy decisions',
        thumbnail: 'https://picsum.photos/800/400?random=5'
      }
    },
    {
      id: '6',
      webTitle: 'Digital Innovation in Think Tanks',
      webPublicationDate: '2024-12-08T07:30:00Z',
      webUrl: '#',
      fields: {
        trailText: 'Think tanks embrace digital transformation to enhance research capabilities',
        thumbnail: 'https://picsum.photos/800/400?random=6'
      }
    }
  ];

  return (
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {currentLang === 'en' ? 'Latest News' : 'Actualités'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockNews.map((article) => (
          <article key={article.id} className="bg-white/50 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            {/* Conteneur d'image avec fallback en cas d'erreur */}
            <div className="w-full h-48 bg-gray-100">
              <img 
                src={article.fields.thumbnail}
                alt={article.webTitle}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Empêche les boucles infinies
                  e.target.style.display = 'none'; // Cache l'image si elle ne charge pas
                  e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                  e.target.parentElement.innerHTML = `
                    <div class="text-gray-400 text-center p-4">
                      <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <path d="M20.4 14.5L16 10 4 20"></path>
                      </svg>
                      <span>Image not available</span>
                    </div>
                  `;
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">
                {article.webTitle}
              </h3>
              <p className="text-gray-600 mb-4">
                {article.fields.trailText}
              </p>
              <div className="flex justify-between items-center">
                <a 
                  href={article.webUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {currentLang === 'en' ? 'Read more' : 'Lire plus'}
                </a>
                <span className="text-sm text-gray-500">
                  {new Date(article.webPublicationDate).toLocaleDateString(
                    currentLang === 'en' ? 'en-US' : 'fr-FR'
                  )}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;