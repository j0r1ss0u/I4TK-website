// =============== IMPORTS ===============
import { collection, addDoc, getDocs, query, where, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { embeddingService } from './embeddingService';

// =============== UTILITY FUNCTIONS ===============
const calculateSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  const similarity = dotProduct / (normA * normB);
  const normalizedSimilarity = (similarity + 1) / 2;

  console.log({
    dotProduct,
    normA,
    normB,
    similarity,
    normalizedSimilarity
  });

  return normalizedSimilarity;
};


// =============== DOCUMENT SERVICE ===============
export const documentsService = {
  // =============== ADD DOCUMENT ===============
  async addDocument(documentData) {
    try {
      console.log('=== Adding Document to Firestore ===');
      console.log('1. Document data received:', documentData);

      if (!documentData.tokenId) {
        console.error('TokenId manquant dans les données du document');
        throw new Error('TokenId required');
      }

      // Générer les embeddings pour le titre et la description
      let titleEmbedding = null;
      let contentEmbedding = null;

      try {
        if (documentData.title) {
          titleEmbedding = await embeddingService.getEmbedding(documentData.title);
        }
        if (documentData.description) {
          contentEmbedding = await embeddingService.getEmbedding(documentData.description);
        }
      } catch (embeddingError) {
        console.warn('Warning: Could not generate embeddings:', embeddingError);
      }

      const documentsRef = collection(db, 'web3IP');
      console.log('2. Collection reference obtained');

      const docRef = await addDoc(documentsRef, {
        ...documentData,
        titleEmbedding: titleEmbedding ? titleEmbedding[0] : null,
        contentEmbedding: contentEmbedding ? contentEmbedding[0] : null,
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
        validationStatus: doc.data().validationStatus || "PENDING" 
      }));
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      throw error;
    }
  },

  // =============== GET SINGLE DOCUMENT ===============
  async getDocument(documentId) {
    try {
      console.log('=== Fetching Single Document ===');
      console.log('Document ID:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Document not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
        validationStatus: docSnap.data().validationStatus || "PENDING"
      };
    } catch (error) {
      console.error('❌ Error getting document:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT ===============
  async updateDocument(documentId, updateData) {
    try {
      console.log('=== Updating Document ===');
      console.log('Params:', { documentId, updateData });

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);

      // Générer de nouveaux embeddings si le titre ou la description sont mis à jour
      let embeddings = {};
      if (updateData.title) {
        const titleEmbedding = await embeddingService.getEmbedding(updateData.title);
        embeddings.titleEmbedding = titleEmbedding[0];
      }
      if (updateData.description) {
        const contentEmbedding = await embeddingService.getEmbedding(updateData.description);
        embeddings.contentEmbedding = contentEmbedding[0];
      }

      await updateDoc(docRef, {
        ...updateData,
        ...embeddings,
        updatedAt: serverTimestamp()
      });

      console.log('Document updated successfully');
    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  },

  // =============== DELETE DOCUMENT ===============
  async deleteDocument(documentId) {
    try {
      console.log('=== Deleting Document ===');
      console.log('Document ID:', documentId);

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      const docRef = doc(db, 'web3IP', documentId);
      await deleteDoc(docRef);

      console.log('Document deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  },

  // =============== UPDATE DOCUMENT STATUS ===============
  async updateDocumentStatus(documentId, validationStatus) {
    try {
      console.log('=== Updating Document Status ===');

      if (!documentId) {
        throw new Error('Document ID is required');
      }

      // Ajout de la transformation du statut
      let finalStatus = validationStatus;
      if (validationStatus === "4/4") {
        finalStatus = "PUBLISHED";
      }

      const docRef = doc(db, 'web3IP', documentId);
      await updateDoc(docRef, {
        validationStatus: finalStatus,
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

  // =============== GET DOCUMENTS BY STATUS ===============
  async getDocumentsByStatus(status) {
    try {
      console.log('=== Fetching Documents by Status ===');
      const documentsRef = collection(db, 'web3IP');
      const q = query(documentsRef, where('validationStatus', '==', status));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error getting documents by status:', error);
      throw error;
    }
  },

  // =============== ADD COMMENT ===============
  async addComment(documentId, comment) {
    try {
      console.log('=== Adding Comment ===');
      const docRef = doc(db, 'web3IP', documentId);
      const docSnapshot = await getDoc(docRef);

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
  },

  // =============== SEMANTIC SEARCH ===============
  async semanticSearch(query, currentLang = 'en', limit = 10) {
    try {
      console.log('=== Performing Hybrid Search ===');
      console.log('Query:', query);

      // Préparation de la recherche sémantique
      const queryEmbedding = await embeddingService.getEmbedding(query);

      // Préparation de la recherche lexicale
      const keywords = query.toLowerCase().trim().split(/\s+/);

      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);

      const results = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        let semanticScore = 0;
        let lexicalScore = 0;

        // Calcul du score sémantique
        if (data.titleEmbedding) {
          const titleSimilarity = calculateSimilarity(queryEmbedding[0], data.titleEmbedding);
          semanticScore = Math.max(semanticScore, titleSimilarity);
        }
        if (data.contentEmbedding) {
          const contentSimilarity = calculateSimilarity(queryEmbedding[0], data.contentEmbedding);
          semanticScore = Math.max(semanticScore, contentSimilarity);
        }

        // Calcul du score lexical
        const titleWords = (data.title || '').toLowerCase();
        const contentWords = (data.description || '').toLowerCase();

        const keywordMatches = keywords.filter(keyword => 
          titleWords.includes(keyword) || contentWords.includes(keyword)
        ).length;

        lexicalScore = keywordMatches / keywords.length;

        // Score combiné (70% sémantique, 30% lexical)
        const combinedScore = (semanticScore * 0.5) + (lexicalScore * 0.5);

        // Seuil minimal de pertinence augmenté à 0.75
        if (combinedScore > 0.75) {
          results.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            author: data.author,
            createdAt: data.createdAt,
            relevance: combinedScore,
            semanticScore,
            lexicalScore,
            ...data
          });
        }
      });

      console.log(`Found ${results.length} results before sorting`);

      // Tri par score combiné
      const sortedResults = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit);

      return sortedResults;
    } catch (error) {
      console.error('❌ Error in hybrid search:', error);
      throw error;
    }
  },

  // =============== REINDEX EMBEDDINGS ===============
  async reindexEmbeddings() {
    try {
      console.log('=== Reindexing All Documents Embeddings ===');
      const documentsRef = collection(db, 'web3IP');
      const snapshot = await getDocs(documentsRef);

      let updated = 0;
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const docRef = doc(db, 'web3IP', docSnapshot.id);

        let updates = {};

        if (data.title && !data.titleEmbedding) {
          const titleEmbedding = await embeddingService.getEmbedding(data.title);
          updates.titleEmbedding = titleEmbedding[0];
        }

        if (data.description && !data.contentEmbedding) {
          const contentEmbedding = await embeddingService.getEmbedding(data.description);
          updates.contentEmbedding = contentEmbedding[0];
        }

        if (Object.keys(updates).length > 0) {
          await updateDoc(docRef, updates);
          updated++;
        }
      }

      console.log(`Reindexing completed. Updated ${updated} documents`);
      return updated;
    } catch (error) {
      console.error('❌ Error reindexing documents:', error);
      throw error;
    }
  }
};

export default documentsService;