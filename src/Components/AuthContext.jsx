// =================================================================
// AuthContext.jsx
// Contexte d'authentification principal de l'application
// Gère l'état de connexion et fournit les fonctionnalités d'auth
// =================================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, LogIn, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { auth } from "../services/firebase";
import { firebaseAuthService } from "../services/firebaseAuthService";
import { invitationsService } from "../services/invitationsService";
import ForgotPassword from "./Members/ForgotPassword";

// =================================================================
// Création et export du Context et Hook personnalisé
// =================================================================

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// =================================================================
// AuthProvider Component
// =================================================================

export const AuthProvider = ({ children }) => {
  // ------- État local -------
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [authPage, setAuthPage] = useState('login');

  // ------- Gestionnaire de notifications -------
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ------- Observer Firebase Auth -------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log('Changement d\'état d\'authentification:', firebaseUser?.email);
      try {
        if (firebaseUser) {
          if (firebaseUser.email === 'admin@i4tk.org') {
            setUser({ uid: 'admin', role: 'admin', email: firebaseUser.email });
            showNotification('Connecté en tant qu\'administrateur');
            setLoading(false);
            return;
          }

          const pendingInvitationData = localStorage.getItem('pendingInvitationData');

          if (pendingInvitationData) {
            console.log('Données d\'invitation trouvées:', pendingInvitationData);
            const invitationData = JSON.parse(pendingInvitationData);

            const userDoc = await firebaseAuthService.initializeUserRole(
              firebaseUser.uid, 
              firebaseUser.email,
              invitationData
            );

            localStorage.removeItem('pendingInvitationData');

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              role: invitationData.role,
              organization: invitationData.organization,
              ...userDoc
            });

            showNotification(`Bienvenue ${
              invitationData.role === 'validator' ? 'validateur' : 'membre'
            } de ${invitationData.organization}`);

          } else {
            console.log('Récupération des données utilisateur standard');
            const userDoc = await firebaseAuthService.getUserData(firebaseUser.uid);

            if (userDoc) {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                emailVerified: firebaseUser.emailVerified,
                role: userDoc.role,
                organization: userDoc.organization,
                ...userDoc
              });

              showNotification(`Bienvenue ${
                userDoc.role === 'validator' ? 'validateur' : 'membre'
              }${userDoc.organization ? ` de ${userDoc.organization}` : ''}`);
            } else {
              console.error('Données utilisateur non trouvées');
              setUser(null);
              showNotification('Erreur de chargement du profil', 'error');
            }
          }
        } else {
          console.log('Déconnexion détectée');
          setUser(null);
          localStorage.removeItem('pendingInvitationData');
        }
      } catch (error) {
        console.error('Erreur lors du changement d\'état d\'auth:', error);
        setUser(null);
        showNotification('Erreur lors de la connexion', 'error');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ------- Méthodes d'authentification -------
  const login = async (credentials) => {
    try {
      if (credentials.email === 'admin@i4tk.org' && credentials.password === 'admin') {
        const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
        setUser({ role: 'admin', email: credentials.email });
        showNotification('Connecté en tant qu\'administrateur');
        return user;
      } 

      const user = await firebaseAuthService.loginUser(credentials.email, credentials.password);
      showNotification(`Bienvenue${user.role === 'admin' ? ' administrateur' : ''} !`);
      return user;
    } catch (error) {
      let message = 'Échec de la connexion. Vérifiez vos identifiants.';
      if (error.message.includes('verify your email')) {
        message = 'Veuillez vérifier votre email avant de vous connecter.';
      }
      showNotification(message, 'error');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuthService.logoutUser();
      setUser(null);
      showNotification('Vous avez été déconnecté avec succès');
    } catch (error) {
      showNotification('Échec de la déconnexion', 'error');
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      const invitation = await invitationsService.getInvitationByEmail(email);
      if (invitation?.status === 'pending') {
        const invitationDate = invitation.createdAt.toDate();
        showNotification(
          `Une invitation est en attente depuis le ${invitationDate.toLocaleDateString()} (${invitationDate.toLocaleTimeString()}) - Vérifiez l'email envoyé par noreply@i4tk.org`,
          'info'
        );
        return;
      }

      const userExists = await firebaseAuthService.getUserByEmail(email);
      if (!userExists) {
        showNotification('Aucun compte associé à cette adresse email', 'error');
        return;
      }

      await firebaseAuthService.resetPassword(email);
      showNotification('Instructions de réinitialisation envoyées par email');
      setAuthPage('login');
      return true;
    } catch (error) {
      console.error('Erreur resetPassword:', error);
      showNotification(error.message, 'error');
      throw error;
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await firebaseAuthService.updatePassword(newPassword);
      showNotification('Mot de passe mis à jour avec succès');
    } catch (error) {
      showNotification('Échec de la mise à jour du mot de passe', 'error');
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      await firebaseAuthService.resendVerificationEmail();
      showNotification('Email de vérification envoyé');
    } catch (error) {
      showNotification('Échec de l\'envoi de l\'email de vérification', 'error');
      throw error;
    }
  };

  // ------- Rendu du Provider -------
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      resetPassword,
      changePassword,
      resendVerificationEmail,
      showNotification,
      authPage,
      setAuthPage
    }}>
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

// =================================================================
// HOC de protection des routes et logique de rôles
// =================================================================

const ROLE_HIERARCHY = {
  admin: ['admin', 'validator', 'member'], 
  validator: ['validator', 'member'],     
  member: ['member']                     
};

export const withAuth = (WrappedComponent, allowedRoles = []) => {
  return function ProtectedComponent(props) {
    const { user, authPage } = useAuth();

    if (!user) {
      return authPage === 'forgot-password' ? <ForgotPassword /> : <LoginForm />;
    }

    if (allowedRoles.length === 0) {
      return <WrappedComponent {...props} />;
    }

    const userAccessibleRoles = ROLE_HIERARCHY[user.role] || [];
    const hasAccess = allowedRoles.some(role => userAccessibleRoles.includes(role));

    if (!hasAccess) {
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

// =================================================================
// Composant UserProfile
// =================================================================

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
        Déconnexion
      </button>
    </div>
  );
};

// =================================================================
// Composant LoginForm
// =================================================================

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { login, setAuthPage, showNotification } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.code === 'auth/email-not-verified') {
        setNeedsVerification(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      await firebaseAuthService.resendVerificationEmail();
      showNotification('Email de vérification envoyé. Vérifiez votre boîte de réception.');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      showNotification('Erreur lors de l\'envoi de l\'email de vérification.', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-center mb-6">
        <User className="h-12 w-12 text-gray-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Connexion
      </h2>

      {needsVerification && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Please verify your email before connecting.
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            className="mt-2 text-sm text-yellow-600 hover:text-yellow-500 underline"
          >
            Send verification email
          </button>
        </div>
      )}

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
          <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => {
              console.log('Clicking forgot password');
              setAuthPage('forgot-password'); // S'assurer que setAuthPage est bien passé via useAuth()
            }}
            className="text-sm text-amber-600 hover:text-amber-500"
          >
            Forgot password ?
          </button>
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
              Connexion
            </>
          )}
        </button>
      </form>
    </div>
  );
};