import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MEMBERS_DATA } from '../../data/members';
import NewsComponent from './NewsComponent';
import LibraryRAG from './LibraryRAG';

// Composant CTACard
const CTACard = ({ title }) => (
  <div className="text-center p-4">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <p className="text-gray-600 text-sm">
      Contact us at{" "}
      <a 
        href="mailto:general.secretary@i4tknowledge.net"
        className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
      >
        general.secretary@i4tknowledge.net
      </a>
    </p>
  </div>
);

const HomePage = ({ currentLang, setCurrentPage }) => {
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
    publishedDocumentsCount: 0,
    projectsCount: 0
  });

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

        // 2. Récupération uniquement des documents publiés depuis Firestore
        const documentsRef = collection(db, 'web3IP');
        const publishedDocsQuery = query(
          documentsRef, 
          where('validationStatus', '==', 'PUBLISHED')
        );
        const publishedDocsSnapshot = await getDocs(publishedDocsQuery);
        const publishedDocumentsCount = publishedDocsSnapshot.size;

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
          publishedDocumentsCount,
          projectsCount
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    };

    fetchStats();
  }, []);

  const handleNavigation = (page, view) => {
    setCurrentPage(page);
    if (view) {
      localStorage.setItem('preferredView', view);
    }
  };

  const StatCard = ({ onClick, textColor, value, label }) => (
    <div 
      onClick={onClick}
      className={`backdrop-blur-sm bg-white/30 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg text-center 
                 h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] flex flex-col justify-center 
                 cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg
                 flex-1`}
    >
      <div className={`font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold ${textColor}
                      truncate`}>
        {value}
      </div>
      <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm lg:text-base text-gray-600 truncate">
        {label}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Section des statistiques */}
      <div className="mb-4">
        <div className="flex justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
          {/* Carte des membres */}
          <StatCard
            onClick={() => handleNavigation('members')}
            textColor="text-blue-800"
            value={stats.totalMembers}
            label={currentLang === 'en' ? 'members' : 'membres'}
          />

          {/* Carte de répartition régionale */}
          <StatCard
            onClick={() => handleNavigation('members', 'mapView')}
            textColor="text-blue-600"
            value={
              <div className="flex items-center justify-center">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl truncate">
                  {stats.regionStats.southPercent}%
                  <span className="text-gray-400 mx-1">/</span>
                  {stats.regionStats.northPercent}%
                </span>
              </div>
            }
            label={currentLang === 'en' ? 'South / North' : 'Sud / Nord'}
          />

          {/* Carte de répartition par catégorie */}
          <StatCard
            onClick={() => handleNavigation('members')}
            textColor="text-blue-600"
            value={
              <div className="flex items-center justify-center">
                <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl truncate">
                  {stats.typeStats.civilSocietyPercent}%
                  <span className="text-gray-400 mx-1">/</span>
                  {stats.typeStats.academicPercent}%
                </span>
              </div>
            }
            label={currentLang === 'en' ? 'Civil Society / Academic' : 'Société Civile / Académique'}
          />

          {/* Carte des publications */}
          <StatCard
            onClick={() => handleNavigation('library')}
            textColor="text-emerald-700"
            value={stats.publishedDocumentsCount}
            label={currentLang === 'en' ? 'Published Documents' : 'Documents Publiés'}
          />

          {/* Carte des projets */}
          <StatCard
            onClick={() => handleNavigation('forum')}
            textColor="text-orange-400"
            value={stats.projectsCount}
            label={currentLang === 'en' ? 'Active Projects' : 'Projets actifs'}
          />
        </div>
      </div>

      {/* Section Library */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-2">
          <LibraryRAG currentLang={currentLang} />
        </div>
      </div>

      {/* Section News */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-2">
          <NewsComponent currentLang={currentLang} />
        </div>
      </div>

      {/* Section Call to Action */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CTACard 
            title={currentLang === 'en' ? 'Join the Network' : 'Rejoindre le Réseau'}
          />
          <CTACard 
            title={currentLang === 'en' ? 'Share Knowledge' : 'Partager les Connaissances'}
          />
          <CTACard 
            title={currentLang === 'en' ? 'Stay Updated' : 'Restez Informé'}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;