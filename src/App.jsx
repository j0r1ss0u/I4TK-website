import React, { useState, useEffect } from "react";
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, chains } from './config/wagmiConfig';
import { AuthProvider } from "./Components/AuthContext";
import { MembersProvider } from './Components/Members/MembersContext';
import { testFirebaseConnection } from "./services/firebase";
// Import des composants
import Header from './Components/Header';
import HomePage from './Components/Home/HomePage';
import AboutPage from './Components/About/AboutPage';
import MembersPage from "./Components/Members/MembersPage";
import LibraryPage from "./Components/Library/LibraryPage";
import { ProtectedForumPage } from "./Components/Forum/ForumPage";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});
function AppContent() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLang, setCurrentLang] = useState('en');
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await testFirebaseConnection();
        if (isConnected) {
          console.log('✅ Firebase est correctement connecté');
        } else {
          console.log('❌ Problème de connexion à Firebase');
        }
      } catch (error) {
        console.error('Erreur lors du test de connexion Firebase:', error);
      }
    };
    testConnection();
  }, []);
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };
  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed top-24 left-0 right-0 h-[600px] z-0"
        style={{
          backgroundImage: "url('/assets/images/carte_reseau.png')",
          backgroundSize: '80%',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          backgroundColor: '#ffffff'
        }}
      />
      <div className="relative z-20">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      </div>
      <div className="relative z-10">
        <main>
          {currentPage === "home" && <HomePage currentLang={currentLang} setCurrentPage={setCurrentPage} />}
          {currentPage === "about" && <AboutPage currentLang={currentLang} />}
          {currentPage === "members" && <MembersPage.MembersPageWrapper currentLang={currentLang} />}
          {currentPage === "library" && <LibraryPage currentLang={currentLang} />}
          {currentPage === "forum" && <ProtectedForumPage currentLang={currentLang} />}
        </main>
      </div>
    </div>
  );
}
function App() {
  useEffect(() => {
    const handleError = (error) => {
      console.error('Erreur globale:', error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          <AuthProvider>
            <MembersProvider>
              <AppContent />
            </MembersProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
export default App;