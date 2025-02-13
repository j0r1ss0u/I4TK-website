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
import { useAuth } from "./Components/AuthContext";
import { signOut, sendPasswordResetEmail} from 'firebase/auth';

// Components
import Header from './Components/Header';
import HomePage from './Components/Home/HomePage';
import AboutPage from './Components/About/AboutPage';
import MembersPage from "./Components/Members/MembersPage";
import LibraryPage from "./Components/Library/LibraryPage";
import { ProtectedForumPage } from "./Components/Forum/ForumPage";
import GenealogyPage from "./Components/Library/GenealogyPage";
import LibraryChat from "./Components/Library/LibraryChat";
import FinalizeInvitation from './Components/Members/FinalizeInvitation';
import Pressrelease from "./Components/About/Pressrelease";
import { auth } from "./services/firebase";
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { LoginForm } from "./Components/AuthContext";
import ForgotPassword from "./Components/Members/ForgotPassword";
import { collection, doc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './services/firebase';

// ================ QUERY CLIENT CONFIGURATION ================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Liste des pages valides pour la navigation
const VALID_PAGES = [
  'home',
  'about',
  'members',
  'library',
  'press-releases',
  'forum',
  'chat',
  'genealogy',
  'finalize-invitation'
];

// ================ APP CONTENT COMPONENT ================
function AppContent() {
  // ===== State Management =====
  const { user, authPage, setAuthPage } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [currentLang, setCurrentLang] = useState('en');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('preferredView') || 'cards');
  const { address } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState(null);

  // ===== Page Change Handler =====
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.location.hash = newPage === 'home' ? '' : newPage;
  };

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

  // ===== Hash Navigation Effect =====
  useEffect(() => {
    // Vérifier le hash au chargement
    const hash = window.location.hash.slice(1);
    if (hash && VALID_PAGES.includes(hash)) {
      setCurrentPage(hash);
    }

    // Écouter les changements de hash
    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1);
      if (newHash && VALID_PAGES.includes(newHash)) {
        setCurrentPage(newHash);
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  // ===== Email Sign In Link Handler =====
  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      let email = params.get('email');

      if (!email) {
        email = window.prompt('Please enter your email for confirmation');
      }

      if (!email) {
        email = action === 'resetPassword' 
          ? window.localStorage.getItem('emailForReset')
          : window.localStorage.getItem('emailForInvitation');
      }

      signInWithEmailLink(auth, email, window.location.href)
        .then(async () => {
          if (action === 'resetPassword') {
            try {
              const resetId = params.get('resetId');
              if (resetId) {
                const resetRef = doc(db, 'passwordResets', resetId);
                await updateDoc(resetRef, {
                  status: 'validated',
                  validatedAt: serverTimestamp()
                });
              }
              window.localStorage.removeItem('emailForReset');
              setAuthPage('forgot-password');
            } catch (error) {
              console.error('Error in reset password flow:', error);
              setAuthPage('login');
            }
          }
          else if (params.get('invitationId')) {
            window.localStorage.removeItem('emailForInvitation');
            handlePageChange('finalize-invitation');
          }
        })
        .catch((error) => {
          console.error('Error processing sign-in link:', error);
          setAuthPage('login');
        });
    }
  }, [setAuthPage, handlePageChange]);

  // ===== Language Handler =====
  const handleLanguageChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  // ===== Loading State =====
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
          handlePageChange={handlePageChange}
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
              handlePageChange={handlePageChange}
              setActiveView={setViewMode}
            />
          )}
          {currentPage === "about" && <AboutPage currentLang={currentLang} />}
          {currentPage === "finalize-invitation" && (
            <FinalizeInvitation handlePageChange={handlePageChange} />
          )}
          {currentPage === "chat" && user?.role === "admin" && (
            <LibraryChat currentLang={currentLang} />
          )}
          {currentPage === "members" && (
            <MembersPage.MembersPageWrapper 
              currentLang={currentLang}
              initialView={localStorage.getItem('preferredView')}
            />
          )}
          {currentPage === "library" && (
            <LibraryPage 
              currentLang={currentLang} 
              handlePageChange={handlePageChange}
              setSelectedTokenId={setSelectedTokenId}
            />
          )}
          {currentPage === "press-releases" && (
            <Pressrelease currentLang={currentLang} />
          )}
          {currentPage === "genealogy" && (
            <GenealogyPage 
              currentLang={currentLang}
              tokenId={selectedTokenId}
              onBack={() => handlePageChange("library")}
            />
          )}
          {currentPage === "forum" && <ProtectedForumPage currentLang={currentLang} />}
        </main>
      </div>

      {/* Modal ForgotPassword */}
      {authPage === 'forgot-password' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <ForgotPassword />
          </div>
        </div>
      )}
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