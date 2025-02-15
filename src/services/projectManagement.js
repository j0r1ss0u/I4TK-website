import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { projectNotificationService } from './projectNotificationService';
import { documentsService } from './documentsService';  // Ajout de cet import
import { torService } from './torService';  // Ajout de cet import aussi

export const projetManagementService = {
  
  async ajouterProjet(projetData) {
    try {
      const projetsRef = collection(db, 'projects');

      const newProjet = {
        title: projetData.title || '',
        description: projetData.description || '',
        budget: {
          amount: Number(projetData.budget?.amount) || 0,
          currency: projetData.budget?.currency || 'EUR',
          fundingType: projetData.budget?.fundingType || 'fiat',
        },
        timeline: {
          startDate: projetData.timeline?.startDate || '',
          endDate: projetData.timeline?.endDate || '',
          milestones: projetData.timeline?.milestones || []
        },
        requiredSkills: projetData.requiredSkills || [],
        visibility: projetData.visibility || 'public',
        creator: {
          uid: projetData.creator?.uid || '',
          email: projetData.creator?.email || '',
          role: projetData.creator?.role || 'member'
        },
        status: {
          current: 'draft',
          lastUpdated: serverTimestamp()
        },
        comments: {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(projetsRef, newProjet);
      return { id: docRef.id, ...newProjet };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  async getProjets() {
    try {
      const projetsRef = collection(db, 'projects');
      const snapshot = await getDocs(projetsRef);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          comments: data.comments || {},
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
        };
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },

  async getProjetsByStatus(status) {
    try {
      const projetsRef = collection(db, 'projects');
      const q = query(projetsRef, where('status.current', '==', status));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          comments: data.comments || {},
          createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
        };
      });
    } catch (error) {
      console.error('Error fetching projects by status:', error);
      throw error;
    }
  },

  async updateProjectStatus(projetId, newStatus) {
    try {
      const projetRef = doc(db, 'projects', projetId);
      const docSnap = await getDoc(projetRef);

      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }

      const oldStatus = docSnap.data().status?.current;
      console.log(`Project status transition: ${oldStatus} -> ${newStatus}`);

      await updateDoc(projetRef, {
        'status.current': newStatus,
        'status.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (oldStatus === 'draft' && newStatus === 'published') {
        const torResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        console.log('Found ToR documents:', torResults);

        if (!torResults || torResults.length === 0) {
          throw new Error('Terms of Reference document not found');
        }
        const latestTor = torResults[0];
        console.log('Latest ToR:', latestTor);

        const signatories = await torService.getSignatories(latestTor.id);
        console.log('Retrieved signatories:', signatories);

        if (signatories.length === 0) {
          console.log('No signatories found for ToR');
          return true;
        }

        const projectData = { id: projetId, ...docSnap.data() };
        await projectNotificationService.notifyNewProject(projectData, signatories);
      }

      return true;
    } catch (error) {
      console.error('Error in updateProjectStatus:', error);
      throw error;
    }
  },

  async addComment(projetId, commentData) {
    try {
      const projetRef = doc(db, 'projects', projetId);
      const docSnap = await getDoc(projetRef);

      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }

      const commentId = `comment_${Date.now()}`;
      const timestamp = new Date().toISOString();

      await updateDoc(projetRef, {
        [`comments.${commentId}`]: {
          content: commentData.content,
          userEmail: commentData.author.email,
          timestamp: timestamp
        },
        updatedAt: serverTimestamp()
      });

      return {
        id: commentId,
        content: commentData.content,
        userEmail: commentData.author.email,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  async updateProjet(projetId, updates) {
    try {
      const projetRef = doc(db, 'projects', projetId);
      await updateDoc(projetRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async supprimerProjet(projetId) {
    try {
      await deleteDoc(doc(db, 'projects', projetId));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
};

export default projetManagementService;