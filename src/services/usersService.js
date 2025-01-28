// =================================================================
// usersService.js
// Service de gestion des utilisateurs
// =================================================================

import { db } from './firebase';
import { 
  collection, 
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

export const usersService = {
  // ------- Récupérer tous les utilisateurs -------
  async getAllUsers() {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // ------- Mettre à jour un utilisateur -------
  async updateUser(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });

      return {
        uid,
        ...userData
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Supprimer un utilisateur -------
  async deleteUser(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      throw error;
    }
  },

  // ------- Obtenir les utilisateurs par organisation -------
  async getUsersByOrganization(organizationId) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs par organisation:', error);
      throw error;
    }
  },

  // ------- Obtenir un utilisateur par ID -------
  async getUserById(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDocs(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        uid: userDoc.id,
        ...userDoc.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }
  }
};

export default usersService;