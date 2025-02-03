import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  increment,
  query,
  where,
  getDocs
} from 'firebase/firestore';

export const projectNotificationService = {
  async notifyNewProject(projectData, signatories) {
    try {
      console.log('Signatories détaillés:', JSON.stringify(signatories, null, 2));

      if (!signatories || signatories.length === 0) {
        console.log('No signatories to notify');
        return null;
      }

      const userUids = {};
      for (const signatory of signatories) {
        if (signatory.userId) {
          console.log('Ajout de l\'UID:', signatory.userId);
          userUids[signatory.email] = signatory.userId;
        }
      }

      console.log('Mapped user UIDs:', userUids);

      if (Object.keys(userUids).length === 0) {
        console.log('Aucun UID trouvé pour les signataires');
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
        recipients: Object.values(userUids),
        status: 'unread'
      };

      const notificationRef = await addDoc(collection(db, 'notifications'), notification);
      console.log('Notification created:', notification);

      for (const uid of Object.values(userUids)) {
        try {
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, {
            unreadNotifications: increment(1)
          });
          console.log(`Counter updated for user ${uid}`);
        } catch (error) {
          console.error(`Error updating counter for user ${uid}:`, error);
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
  },

  async markNotificationAsRead(notificationId, userId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        status: 'read'
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        unreadNotifications: increment(-1)
      });

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
};
