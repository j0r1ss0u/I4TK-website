// =================================================================
// firebaseAuthService.js
// Gère toutes les interactions avec Firebase Auth
// =================================================================

import { auth } from './firebase';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updatePassword
} from 'firebase/auth';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const firebaseAuthService = {
  // ------- Initialisation du profil utilisateur -------
  async initializeUserRole(userId, email) {
    console.log('Initialisation du rôle utilisateur pour:', email);
    try {
      // Référence au document utilisateur
      const userRef = doc(db, 'users', userId);

      // Vérifier si le document existe déjà
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Données de base pour un nouvel utilisateur
        const userData = {
          email: email,
          role: 'member', // Rôle par défaut
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        // Créer le document utilisateur
        await setDoc(userRef, userData);
        console.log('Profil utilisateur initialisé avec succès');

        return userData;
      } else {
        console.log('Le profil utilisateur existe déjà');
        return userDoc.data();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du profil utilisateur:', error);
      throw error;
    }
  },

  // ------- Connexion utilisateur -------
  async loginUser(email, password) {
    try {
      console.log('Tentative de connexion pour:', email);

      // Gestion des comptes spéciaux
      if (email === 'admin@i4t.org' && password === 'admin') {
        console.log('Tentative de connexion avec compte admin');
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
          uid: userCredential.user.uid,
          email: email,
          role: 'admin',
          emailVerified: true
        };
      }

      // Authentification standard
      console.log('Tentative d\'authentification standard');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      console.log('Utilisateur authentifié:', user.email);
      console.log('Email vérifié:', user.emailVerified);

      if (!user.emailVerified) {
        console.log('Email non vérifié, tentative d\'envoi de l\'email de vérification...');
        try {
          await sendEmailVerification(user);
          console.log('Email de vérification envoyé avec succès');
        } catch (verificationError) {
          console.error('Erreur lors de l\'envoi de l\'email de vérification:', verificationError);
        }
        throw { code: 'auth/email-not-verified', message: 'Please verify your email before logging in' };
      }

      // Initialiser ou récupérer le profil utilisateur
      const userData = await this.initializeUserRole(user.uid, user.email);
      console.log('Données utilisateur:', userData);

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userData
      };
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },

  // ------- Déconnexion -------
  async logoutUser() {
    console.log('Tentative de déconnexion');
    try {
      await signOut(auth);
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // ------- Réinitialisation du mot de passe -------
  async resetPassword(email) {
    console.log('Tentative de réinitialisation du mot de passe pour:', email);
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Email de réinitialisation envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw error;
    }
  },

  // ------- Récupération des données utilisateur -------
  async getUserData(uid) {
    console.log('Récupération des données pour l\'utilisateur:', uid);
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        console.log('Aucune donnée trouvée pour l\'utilisateur');
        return null;
      }
      console.log('Données utilisateur trouvées:', userDoc.data());
      return userDoc.data();
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      throw error;
    }
  },

  // ------- Renvoi de l'email de vérification -------
  async resendVerificationEmail() {
    console.log('Tentative de renvoi de l\'email de vérification');
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error('No user logged in');
      }
      await sendEmailVerification(user);
      console.log('Email de vérification renvoyé avec succès');
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email de vérification:', error);
      throw error;
    }
  },

  // ------- Création d'un nouvel utilisateur -------
  async createUser(email, password, userData) {
    console.log('Tentative de création d\'utilisateur:', email);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Créer le profil utilisateur dans Firestore
      const userProfile = {
        email: user.email,
        role: 'member',
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Envoyer l'email de vérification
      await sendEmailVerification(user);
      console.log('Utilisateur créé et email de vérification envoyé');

      return {
        uid: user.uid,
        ...userProfile
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Mise à jour du mot de passe -------
  async updatePassword(newPassword) {
    console.log('Tentative de mise à jour du mot de passe');
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('Aucun utilisateur connecté');
        throw new Error('No user logged in');
      }
      await updatePassword(user, newPassword);
      console.log('Mot de passe mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      throw error;
    }
  }
};

export default firebaseAuthService;