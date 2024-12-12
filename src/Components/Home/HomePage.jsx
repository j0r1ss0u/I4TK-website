// =============== IMPORTS ===============
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MEMBERS_DATA } from '../../data/members';
import NewsComponent from './NewsComponent';
import LibraryRAG from './LibraryRAG';

// =============== MAIN COMPONENT ===============
const HomePage = ({ currentLang }) => {
  // ===== State =====
  const [stats, setStats] = useState({
    totalMembers: 0,
    regionStats: {
      southPercent: 0,
      northPercent: 0
    },
    typeStats: {
      academicPercent: 0,
      civilSocietyPercent: 0
    },
    documentsCount: 0,
    projectsCount: 0
  });

  // ===== Data Fetching =====
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 1. Calcul des statistiques des membres
        const visibleMembers = MEMBERS_DATA.filter(member => member.isVisible);

        // Calcul des régions
        const regionCounts = visibleMembers.reduce((acc, member) => {
          const region = member.region?.toLowerCase() || '';
          if (region.includes('asia') || region.includes('africa') || 
              region.includes('south america') || region.includes('oceania')) {
            acc.south++;
          } else if (region.includes('europe') || region.includes('north america')) {
            acc.north++;
          }
          return acc;
        }, { south: 0, north: 0 });

        // Calcul Academic vs Civil Society
        const academicCount = visibleMembers.reduce((count, member) => {
          return member.category === 'Academic' ? count + 1 : count;
        }, 0);

        // 2. Récupération des documents depuis Firestore
        const docsSnapshot = await getDocs(collection(db, 'web3IP'));
        const documentsCount = docsSnapshot.size;

        // 3. Récupération des projets depuis Firestore
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsCount = projectsSnapshot.size;

        // 4. Calcul des pourcentages finaux
        const total = visibleMembers.length;
        const southPercent = Math.round((regionCounts.south / total) * 100);
        const academicPercent = Math.round((academicCount / total) * 100);

        setStats({
          totalMembers: total,
          regionStats: {
            southPercent: southPercent,
            northPercent: 100 - southPercent
          },
          typeStats: {
            academicPercent: academicPercent,
            civilSocietyPercent: 100 - academicPercent
          },
          documentsCount,
          projectsCount
        });

      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  // ===== Render =====
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* === Statistics Section === */}
      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {/* Total Members Card */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[160px] flex flex-col justify-center">
            <div className="text-orange-600 font-serif text-4xl md:text-5xl font-bold">
              {stats.totalMembers}
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              {currentLang === 'en' ? 'members' : 'membres'}
            </p>
          </div>

          {/* Region Distribution Card */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[160px] flex flex-col justify-center">
            <div className="text-emerald-600 font-serif text-4xl md:text-4xl font-bold flex justify-center items-center gap-2">
              <span>{stats.regionStats.southPercent}%</span>
              <span className="text-gray-400">/</span>
              <span>{stats.regionStats.northPercent}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentLang === 'en' ? 'South / North' : 'Sud / Nord'}
            </p>
          </div>

          {/* Category Distribution Card */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[160px] flex flex-col justify-center">
            <div className="text-blue-600 font-serif text-4xl md:text-4xl font-bold flex justify-center items-center gap-2">
              <span>{stats.typeStats.civilSocietyPercent}%</span>
              <span className="text-gray-400">/</span>
              <span>{stats.typeStats.academicPercent}%</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {currentLang === 'en' ? 'Civil Society / Academic' : 'Société Civile / Académique'}
            </p>
          </div>

          {/* Documents Count Card */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[160px] flex flex-col justify-center">
            <div className="text-orange-500 font-serif text-4xl md:text-5xl font-bold">
              {stats.documentsCount}
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              {currentLang === 'en' ? 'Publications' : 'Publications'}
            </p>
          </div>

          {/* Projects Count Card */}
          <div className="backdrop-blur-sm bg-white/30 p-6 rounded-lg text-center h-[160px] flex flex-col justify-center">
            <div className="text-gray-400 font-serif text-4xl md:text-5xl font-bold">
              {stats.projectsCount}
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              {currentLang === 'en' ? 'Active Projects' : 'Projets actifs'}
            </p>
          </div>
        </div>
      </div>

      {/* === Library Section === */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-2">
          <LibraryRAG currentLang={currentLang} />
        </div>
      </div>

      {/* === News Section === */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-2">
          <NewsComponent currentLang={currentLang} />
        </div>
      </div>

      {/* === Call to Action Section === */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

// =============== SUBCOMPONENTS ===============
const CTACard = ({ title, description }) => (
  <div className="text-center p-4">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// =============== EXPORT ===============
export default HomePage;