import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,  // Ajout
  doc      // Ajout
} from 'firebase/firestore';
import { db, auth } from './firebase';  // Ou le chemin correct vers votre config Firebase

export const torService = {
  
  async acceptToR(userId, docId) {
    try {
      const acceptancesRef = collection(db, 'torAcceptances');
      const currentUser = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      const acceptanceDoc = {
        userId: currentUser.uid,  // Stockage de l'UID Firebase au lieu de l'email
        documentId: docId,
        acceptedAt: serverTimestamp(),
        status: 'accepted',
        email: currentUser?.email || '', // On garde l'email pour référence
        organization: userData?.organization || ''
      };

      const docRef = await addDoc(acceptancesRef, acceptanceDoc);
      return docRef.id;
    } catch (error) {
      console.error('Error recording ToR acceptance:', error);
      throw error;
    }
  },

  // Récupérer la liste des signataires
  
  async getSignatories(documentId) {
    try {
      console.log('Fetching signatories for document:', documentId);
      const acceptancesRef = collection(db, 'torAcceptances');
      const q = query(
        acceptancesRef,
        where('documentId', '==', documentId),
        where('status', '==', 'accepted'),
        orderBy('acceptedAt', 'desc')
      );
      const snapshot = await getDocs(q);

      // Log des données brutes
      console.log('Raw signatories data:', snapshot.docs.map(doc => doc.data()));

      // Vérifions que nous avons bien des UIDs
      const signatories = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing signatory data:', data);
        if (!data.userId) {
          console.warn('No userId found for signatory:', data);
        }
        return {
          id: doc.id,
          ...data,
          acceptedAt: data.acceptedAt?.toDate()
        };
      });

      console.log('Processed signatories:', signatories);
      return signatories;
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