// =========================================
// Imports
// =========================================
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MEMBERS_DATA } from '../../data/members';
import NewsComponent from './NewsComponent';
import LibraryRAG from './LibraryRAG';

// =========================================
// Sub-Components
// =========================================
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

const StatCard = ({ onClick, textColor, value, label }) => (
  <div 
    onClick={onClick}
    className={`backdrop-blur-sm bg-white/30 p-2 sm:p-3 md:p-4 lg:p-6 rounded-lg text-center 
               min-h-[100px] sm:min-h-[120px] md:min-h-[140px] lg:min-h-[160px] flex flex-col justify-center 
               cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg
               w-full`}
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

// =========================================
// Main Component
// =========================================
const HomePage = ({ currentLang, setCurrentPage, setActiveView }) => {
  // =========================================
  // State Management
  // =========================================
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

  // =========================================
  // Navigation Handler
  // =========================================
  const handleNavigation = (page, view) => {
    if (view) {
      localStorage.setItem('preferredView', view);
      if (setActiveView) {
        setActiveView(view);
      }
    } else {
      // Reset view preference when navigating to pages without specific views
      localStorage.removeItem('preferredView');
    }
    setCurrentPage(page);
  };

  // =========================================
  // Data Fetching
  // =========================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Members Statistics
        const visibleMembers = MEMBERS_DATA.filter(member => member.isVisible);

        // Regional Statistics
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

        // Member Type Statistics
        const academicCount = visibleMembers.reduce((count, member) => {
          return member.category === 'Academic' ? count + 1 : count;
        }, 0);

        // Published Documents Count
        const documentsRef = collection(db, 'web3IP');
        const publishedDocsQuery = query(
          documentsRef, 
          where('validationStatus', '==', 'PUBLISHED')
        );
        const publishedDocsSnapshot = await getDocs(publishedDocsQuery);
        const publishedDocumentsCount = publishedDocsSnapshot.size;

        // Projects Count
        const projectsSnapshot = await getDocs(collection(db, 'projects'));
        const projectsCount = projectsSnapshot.size;

        // Calculate Final Percentages
        const total = visibleMembers.length;
        const southPercent = Math.round((regionCounts.south / total) * 100);
        const academicPercent = Math.round((academicCount / total) * 100);

        // Update State
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
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, []);

  // =========================================
  // Render
  // =========================================
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Statistics Section */}
      <div className="mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6 w-full">
          {/* Members Card */}
          <StatCard
            onClick={() => handleNavigation('members')}
            textColor="text-blue-800"
            value={stats.totalMembers}
            label={currentLang === 'en' ? 'members' : 'membres'}
          />

          {/* Regional Distribution Card */}
          <StatCard
            onClick={() => handleNavigation('members', 'map')}
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

          {/* Member Type Card */}
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

          {/* Publications Card */}
          <StatCard
            onClick={() => handleNavigation('library')}
            textColor="text-emerald-700"
            value={stats.publishedDocumentsCount}
            label={currentLang === 'en' ? 'Published Documents' : 'Documents Publiés'}
          />

          {/* Projects Card */}
          <StatCard
            onClick={() => handleNavigation('forum')}
            textColor="text-orange-400"
            value={stats.projectsCount}
            label={currentLang === 'en' ? 'Active Projects' : 'Projets actifs'}
          />
        </div>
      </div>

      {/* Library Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-2">
          <LibraryRAG currentLang={currentLang} />
        </div>
      </div>

      {/* News Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
        <div className="p-2">
          <NewsComponent currentLang={currentLang} />
        </div>
      </div>

      {/* Call to Action Section */}
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

// =========================================
// Export
// =========================================
export default HomePage;