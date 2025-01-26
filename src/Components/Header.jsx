import React, { useState } from 'react';
import { useAuth, UserProfile, LoginForm } from './AuthContext';
import WalletConnect from './Library/WalletConnect';
import { LogIn, Menu, X } from 'lucide-react';

// =============== LOGIN BUTTON COMPONENT ===============
const LoginButton = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowLoginForm(true)}
        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-gray-100"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Connexion
      </button>
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <LoginForm />
            <button
              onClick={() => setShowLoginForm(false)}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// =============== NAVIGATION COMPONENT ===============
const Navigation = ({ currentPage, setCurrentPage, isMobile, setIsMenuOpen }) => {
  const { user } = useAuth();
  const navItems = [
    { id: "home", label: "Home", public: true },
    { id: "about", label: "About", public: true },
    { id: "members", label: "Members", public: true },
    { id: "library", label: "Library", public: true },
    { id: "forum", label: "Forum", requiresAuth: true },
    { id: "chat", label: "AI Chat", adminOnly: false }
  ];

  const visibleItems = navItems.filter(item => 
    item.public || 
    (user && item.requiresAuth) || 
    (user?.role === 'admin' && item.adminOnly)
  );

  const handleNavClick = (itemId) => {
    setCurrentPage(itemId);
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center space-x-8'}`}>
      <nav className={`${isMobile ? 'flex flex-col space-y-2' : 'flex space-x-4'}`}>
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === item.id
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={`${isMobile ? 'flex justify-center' : 'flex items-center'}`}>
        {user ? (
          <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center space-x-4'}`}>
            <UserProfile />
            {(user.role === 'member' || user.role === 'admin') && <WalletConnect />}
          </div>
        ) : (
          <LoginButton />
        )}
      </div>
    </div>
  );
};

// =============== HEADER COMPONENT ===============
const Header = ({ currentPage, setCurrentPage, currentLang }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white bg-opacity-90 border-b" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center">
              <button 
                onClick={() => setCurrentPage("home")}
                className="focus:outline-none hover:opacity-80 transition-opacity"
              >
                <img
                  src="/assets/logos/I4TK logo.jpg"
                  alt="I4TK Logo"
                  className="h-16 md:h-24"
                />
              </button>
            </div>

            <div className="hidden md:block">
              <Navigation 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                isMobile={false}
              />
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu principal"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden w-full mt-4">
              <Navigation 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage}
                isMobile={true}
                setIsMenuOpen={setIsMenuOpen}
              />
            </div>
          )}

          <div className="text-center mt-4 max-w-3xl w-full">
            <p className="font-serif text-lg md:text-2xl font-bold mb-6">
              {currentLang === 'en' 
                ? 'Global knowledge network for an Internet for Trust'
                : 'Réseau global de connaissance pour un Internet de confiance'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;