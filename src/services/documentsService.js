import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export const documentsService = {
  async addDocument(documentData) {
    try {
      console.log('=== Adding Document to Firestore ===');
      console.log('1. Document data received:', documentData);

      const documentsRef = collection(db, 'web3IP');
      console.log('2. Collection reference obtained');

      const docRef = await addDoc(documentsRef, {
        ...documentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'PENDING'
      });

      console.log('3. Document added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding document:', error);
      throw error;
    }
  },

  async getDocuments() {
    try {
      console.log('=== Fetching Documents ===');
      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);
      console.log('Found', snapshot.size, 'documents');

      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return documents;
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      throw error;
    }
  },

  async updateDocumentStatus(documentId, status) {
    try {
      console.log('=== Updating Document Status ===');
      console.log('Params:', { documentId, status });

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      });

      console.log('Document status updated successfully');
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      throw error;
    }
  },

  async getDocumentsByAddress(address) {
    try {
      console.log('=== Fetching Documents by Address ===');
      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('creatorAddress', '==', address));
      const snapshot = await getDocs(q);

      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return documents;
    } catch (error) {
      console.error('❌ Error getting documents by address:', error);
      throw error;
    }
  },

  async addComment(documentId, comment) {
    try {
      console.log('=== Adding Comment ===');
      const docRef = doc(db, 'web3IP', documentId);

      await updateDoc(docRef, {
        comments: [...(await this.getDocuments(documentId)).comments, comment],
        updatedAt: serverTimestamp()
      });

      console.log('Comment added successfully');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  }
};

export default documentsService;