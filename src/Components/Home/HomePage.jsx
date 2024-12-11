import React from 'react';
import NewsComponent from './NewsComponent';
import LibraryRAG from './LibraryRAG';
const HomePage = ({ currentLang }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard number="65+" text={currentLang === 'en' ? 'Academic research Centers & Think Tanks' : 'Centres de recherche académique et groupes de réflexion'} color="text-orange-600" />
          <StatCard number="55%" text={currentLang === 'en' ? 'Global South' : 'Sud Global'} color="text-green-700" />
          <StatCard number="35%" text={currentLang === 'en' ? 'Global North' : 'Nord Global'} color="text-green-700" />
          <StatCard number="10%" text={currentLang === 'en' ? 'Global' : 'Mondial'} color="text-green-700" />
        </div>
      </div>
      {/*Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Library Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6"></h2>
            <div className="aspect-[16/9] bg-white">
              <LibraryRAG currentLang={currentLang} />
            </div>
          </div>
        </div>
        {/* News Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6"></h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <NewsComponent currentLang={currentLang} />
          </div>
        </div>
      </div>
      {/* Call to Action */}
      <div className="mt-12 bg-white rounded-lg p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <CTACard 
            title={currentLang === 'en' ? 'Join the Network' : 'Rejoindre le Réseau'}
            description={currentLang === 'en' ? 'Connect with research centers worldwide' : 'Connectez-vous avec des centres de recherche du monde entier'}
          />
          <CTACard 
            title={currentLang === 'en' ? 'Share Knowledge' : 'Partager les Connaissances'}
            description={currentLang === 'en' ? 'Contribute to our growing library' : 'Contribuez à notre bibliothèque'}
          />
          <CTACard 
            title={currentLang === 'en' ? 'Stay Updated' : 'Restez Informé'}
            description={currentLang === 'en' ? 'Follow the latest research trends' : 'Suivez les dernières tendances de la recherche'}
          />
        </div>
      </div>
    </div>
  );
};
const StatCard = ({ number, text, color }) => (
  <div className="bg-white p-6 rounded-lg text-center">
    <div className={`${color} font-serif text-4xl md:text-5xl font-bold`}>{number}</div>
    <p className="mt-2 text-sm md:text-base text-gray-600">{text}</p>
  </div>
);

const CTACard = ({ title, description }) => (
  <div className="text-center p-4">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);
export default HomePage;
