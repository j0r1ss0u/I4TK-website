// src/services/torService.js
import { db, auth } from './firebase';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

export const torService = {
  // Enregistrer une nouvelle acceptation de ToR
  async acceptToR(userId, docId) {
    try {
      const acceptancesRef = collection(db, 'torAcceptances');
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      const acceptanceDoc = {
        userId,
        documentId: docId,
        acceptedAt: serverTimestamp(),
        status: 'accepted',
        email: auth.currentUser?.email || '',
        organization: userData?.organization || '' // Récupération de l'organisation depuis le profil utilisateur
      };

      const docRef = await addDoc(acceptancesRef, acceptanceDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error recording ToR acceptance:', error);
      throw error;
    }
  }

  // Récupérer la liste des signataires
  async getSignatories(documentId) {
    try {
      const acceptancesRef = collection(db, 'torAcceptances');
      const q = query(
        acceptancesRef,
        where('documentId', '==', documentId),
        where('status', '==', 'accepted'),
        orderBy('acceptedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        acceptedAt: doc.data().acceptedAt?.toDate()
      }));
    } catch (error) {
      console.error('Error fetching ToR signatories:', error);
      throw error;
    }
  },

  // Vérifier si un utilisateur a accepté le ToR
  async hasAcceptedToR(userId, documentId) {
    try {
      const acceptancesRef = collection(db, 'torAcceptances');
      const q = query(
        acceptancesRef,
        where('userId', '==', userId),
        where('documentId', '==', documentId),
        where('status', '==', 'accepted')
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking ToR acceptance:', error);
      throw error;
    }
  }
};

export default torService;