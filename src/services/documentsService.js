// =============== IMPORTS ===============
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

// =============== DOCUMENT SERVICE ===============
export const documentsService = {
  // =============== ADD DOCUMENT ===============
  async addDocument(documentData) {
    try {
      console.log('=== Adding Document to Firestore ===');
      console.log('1. Document data received:', documentData);

      // Vérification du tokenId
      if (!documentData.tokenId) {
        console.error('TokenId manquant dans les données du document');
        throw new Error('TokenId required');
      }

      const documentsRef = collection(db, 'web3IP');
      console.log('2. Collection reference obtained');

      const docRef = await addDoc(documentsRef, {
        ...documentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        validationStatus: "0/4"
      });

      console.log('3. Document added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error adding document:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENTS ===============
  async getDocuments() {
    try {
      console.log('=== Fetching Documents ===');
      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);
      console.log('Found', snapshot.size, 'documents');
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Ensure validationStatus is always present
        validationStatus: doc.data().validationStatus || "PENDING" 
      }));
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT STATUS ===============
  async updateDocumentStatus(documentId, validationStatus) {
    try {
      console.log('=== Updating Document Status ===');
      console.log('Params:', { documentId, validationStatus });

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        validationStatus,
        updatedAt: serverTimestamp()
      });

      console.log('Document status updated successfully');
    } catch (error) {
      console.error('❌ Error updating document status:', error);
      throw error;
    }
  },

  // =============== GET DOCUMENTS BY ADDRESS ===============
  async getDocumentsByAddress(address) {
    try {
      console.log('=== Fetching Documents by Address ===');
      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('creatorAddress', '==', address));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        validationStatus: doc.data().validationStatus || "PENDING"
      }));
    } catch (error) {
      console.error('❌ Error getting documents by address:', error);
      throw error;
    }
  },

  // =============== ADD COMMENT ===============
  async addComment(documentId, comment) {
    try {
      console.log('=== Adding Comment ===');
      const docRef = doc(db, 'web3IP', documentId);
      const docSnapshot = await getDocs(docRef);

      if (!docSnapshot.exists()) {
        throw new Error('Document not found');
      }

      const currentComments = docSnapshot.data().comments || [];
      await updateDoc(docRef, {
        comments: [...currentComments, comment],
        updatedAt: serverTimestamp()
      });

      console.log('Comment added successfully');
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT TOKEN ID ===============
  async updateDocumentTokenId(documentId, tokenId) {
    try {
      console.log('=== Updating Document TokenId ===');
      console.log('Params:', { documentId, tokenId });

      if (!documentId || !tokenId) {
        throw new Error('Document ID and Token ID are required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        tokenId,
        updatedAt: serverTimestamp()
      });

      console.log('Document tokenId updated successfully');
    } catch (error) {
      console.error('❌ Error updating document tokenId:', error);
      throw error;
    }
  }
};

export default documentsService;