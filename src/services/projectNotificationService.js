import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment
} from 'firebase/firestore';

export const projectNotificationService = {
  async notifyNewProject(projectData, signatories) {
    try {
      if (!signatories || signatories.length === 0) {
        console.log('No signatories to notify');
        return null;
      }

      const notification = {
        type: 'NEW_PROJECT',
        title: `New Project: ${projectData.title}`,
        description: projectData.description,
        projectId: projectData.id,
        creator: {
          email: projectData.creator.email,
          uid: projectData.creator.uid
        },
        createdAt: new Date(),
        recipients: signatories.map(s => s.userId),
        status: 'unread'
      };

      // Créer la notification
      const notificationRef = await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification created for project:', projectData.title);

      // Mettre à jour les compteurs
      for (const signatory of signatories) {
        try {
          const userRef = doc(db, 'users', signatory.userId);
          await updateDoc(userRef, {
            unreadNotifications: increment(1)
          });
        } catch (error) {
          console.error(`Error updating counter for ${signatory.email}:`, error);
        }
      }

      return {
        ...notification,
        id: notificationRef.id
      };
    } catch (error) {
      console.error('Error sending project notification:', error);
      return null;
    }
  }
};