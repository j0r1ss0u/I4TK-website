// ================ IMPORTS ================
import React, { useState, useEffect } from "react";
// RainbowKit & Wagmi imports
import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useAccount } from 'wagmi';

// Query Client
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration & Providers
import { config, chains } from './config/wagmiConfig';
import { AuthProvider } from "./Components/AuthContext";
import { MembersProvider } from './Components/Members/MembersContext';
import { testFirebaseConnection } from "./services/firebase";

// Components
import Header from './Components/Header';
import HomePage from './Components/Home/HomePage';
import AboutPage from './Components/About/AboutPage';
import MembersPage from "./Components/Members/MembersPage";
import LibraryPage from "./Components/Library/LibraryPage";
import { ProtectedForumPage } from "./Components/Forum/ForumPage";

// ================ QUERY CLIENT CONFIGURATION ================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// ================ APP CONTENT COMPONENT ================
function AppContent() {
  // ===== State Management =====
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredView') || 'cards');
  const { address } = useAccount();

  // ===== Provider Check Effect =====
  useEffect(() => {
    const checkProvider = async () => {
      try {
        await window.ethereum?.request({ method: 'eth_chainId' });
      } catch (error) {
        console.warn('Provider check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProvider();
  }, []);

  // ===== Environment & Firebase Check Effect =====
  useEffect(() => {
    console.log('AppContent mounting...');
    console.log('Environment check:', {
      userAgent: navigator.userAgent,
      hasEthereum: !!window.ethereum,
      hasWeb3: !!window.web3,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    });

    const testConnection = async () => {
      try {
        console.log('Testing Firebase connection...');
        const isConnected = await testFirebaseConnection();
        console.log('Firebase connection result:', isConnected);
      } catch (error) {
        console.error('Firebase connection error:', error);
      }
    };

    testConnection();
  }, []);

  // ===== Wallet Change Effect =====
  useEffect(() => {
    if (address) {
      console.log('Wallet address changed:', address);
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 0);
    }
  }, [address]);

  // ===== Language Handler =====
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  // ===== Loading State =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  // ===== Render Component =====
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div 
        className="fixed top-24 left-0 right-0 bottom-0 z-0"
        style={{
          backgroundImage: "url('/assets/images/carte_reseau.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'top center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          backgroundColor: '#ffffff'
        }}
      />
      {/* Header Section */}
      <div className="relative z-20">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          currentLang={currentLang}
          onLanguageChange={handleLanguageChange}
        />
      </div>
      {/* Main Content */}
      <div className="relative z-10 w-full">
        <main className="w-full overflow-x-hidden">
          {currentPage === "home" && (
            <HomePage 
              currentLang={currentLang} 
              setCurrentPage={setCurrentPage}
              setActiveView={setViewMode}
            />
          )}
          {currentPage === "about" && <AboutPage currentLang={currentLang} />}
          {currentPage === "members" && (
            <MembersPage.MembersPageWrapper 
              currentLang={currentLang}
              initialView={localStorage.getItem('preferredView')}
            />
          )}
          {currentPage === "library" && <LibraryPage currentLang={currentLang} />}
          {currentPage === "forum" && <ProtectedForumPage currentLang={currentLang} />}
        </main>
      </div>
    </div>
  );
}

// ================ MAIN APP COMPONENT ================
function App() {
  // ===== Error Handler Effect =====
  useEffect(() => {
    console.log('App component mounting...');
    console.log('Wagmi config:', config);

    const handleError = (error) => {
      console.error('Global error caught:', {
        message: error.message,
        stack: error.stack,
        type: error.type
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // ===== Render Component =====
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