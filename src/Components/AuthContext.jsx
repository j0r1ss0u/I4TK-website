import React, { createContext, useState, useContext } from 'react';
import { User, LogIn, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';

// 1. Création du contexte
const AuthContext = createContext(null);

// 2. Hook useAuth (déplacé avant son utilisation)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 3. Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const login = (credentials) => {
    if (credentials.email === 'admin@i4tk.org' && credentials.password === 'admin') {
      setUser({ role: 'admin', email: credentials.email });
      showNotification('Connecté en tant qu\'administrateur');
    } else if (credentials.email === 'member@i4tk.org' && credentials.password === 'member') {
      setUser({ role: 'member', email: credentials.email });
      showNotification('Connecté en tant que membre');
    } else {
      showNotification('Email ou mot de passe incorrect', 'error');
    }
  };

  const logout = () => {
    setUser(null);
    showNotification('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        } flex items-center space-x-2 z-50 transition-all duration-500 ease-in-out`}>
          {notification.type === 'error' ? 
            <AlertTriangle className="h-5 w-5" /> : 
            <CheckCircle2 className="h-5 w-5" />
          }
          <span>{notification.message}</span>
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

// 4. Form de connexion
export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    login({ email, password });
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Connexion
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <LogIn className="h-5 w-5 mr-2" />
              Connect
            </>
          )}
        </button>
      </form>
      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p className="text-center font-semibold">demonstration account :</p>
        <p className="text-center">Admin </p>
        <p className="text-center">Membre</p>
      </div>
    </div>
  );
};

// 5. Composant profil utilisateur
export const UserProfile = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center bg-gray-100 rounded-full p-2">
        <User className="h-5 w-5 text-gray-600" />
        <span className="ml-2 text-sm text-gray-700">{user.email}</span>
      </div>
      <button
        onClick={logout}
        className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        <LogOut className="h-4 w-4 mr-1" />
        Deconnexion
      </button>
    </div>
  );
};

// 6. HOC de protection
export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    const { user } = useAuth();

    if (!user) {
      return <LoginForm />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};