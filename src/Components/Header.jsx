import React, { useState } from 'react';
import { useAuth, UserProfile, LoginForm } from './AuthContext';
import WalletConnect from './Library/WalletConnect';
import { LogIn } from 'lucide-react';

// Composant LoginButton
const LoginButton = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowLoginForm(true)}
        className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-silver-80"
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
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Composant Navigation
const Navigation = ({ currentPage, setCurrentPage }) => {
  const { user } = useAuth();
  const navItems = [
    { id: "home", label: "Home", public: true },
    { id: "about", label: "About", public: true },
    { id: "members", label: "Members", public: true },
    { id: "library", label: "Library", public: true },
    { id: "forum", label: "Forum", requiresAuth: true }
  ];
  const visibleItems = navItems.filter(item => 
    item.public || (user && item.requiresAuth)
  );

  return (
    <div className="flex items-center space-x-8">
      <nav className="flex space-x-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
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
      <div className="flex items-center">
        {user ? (
          <div className="flex items-center space-x-4">
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

// Composant Header mis à jour avec logo cliquable
const Header = ({ currentPage, setCurrentPage, currentLang }) => {
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
                  className="h-24"
                />
              </button>
            </div>
            <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
          <div className="text-center mt-4 max-w-3xl w-full">
            <p className="font-serif text-2xl font-bold mb-6">
              {currentLang === 'en' 
                ? 'Our community aims to shape a global knowledge network to help regulate digital spaces.'
                : 'Notre communauté aspire à créer un réseau global de connaissance pour assister la gouvernance des espaces numériques.'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};


export default Header;