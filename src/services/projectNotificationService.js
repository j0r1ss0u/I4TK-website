// src/services/projectNotificationService.js
import { db } from './firebase';
import { torService } from './torService';
import { 
  collection, 
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';

export const projectNotificationService = {
  // Récupère le dernier ToR et ses signataires
  async getNotificationRecipients(documentId) {
    try {
      // Utilisation de la méthode existante avec l'ID du document
      const signatories = await torService.getSignatories(documentId);
      return signatories.map(signatory => ({
        id: signatory.userId,
        email: signatory.email,
        organization: signatory.organization || 'Unknown'
      }));
    } catch (error) {
      console.error('Error getting notification recipients:', error);
      return [];
    }
  },

  // Envoie une notification pour un nouveau projet
  async notifyNewProject(projectData, documentId) {
    try {
      // D'abord, récupérer les destinataires
      const recipients = await this.getNotificationRecipients(documentId);

      if (!recipients || recipients.length === 0) {
        console.log('No recipients found for notifications');
        return null;
      }

      const notification = {
        type: 'NEW_PROJECT',
        title: `New Project: ${projectData.title}`,
        description: projectData.description,
        projectId: projectData.id,
        creator: projectData.creator,
        createdAt: new Date(),
        recipients: recipients.map(r => r.id),
        status: 'unread'
      };

      // Ajouter la notification à Firestore
      const notificationsRef = collection(db, 'notifications');
      const notificationDoc = await addDoc(notificationsRef, notification);

      // Mettre à jour le compteur de notifications pour chaque destinataire
      for (const recipient of recipients) {
        if (recipient.id) {
          const userRef = doc(db, 'users', recipient.id);
          await updateDoc(userRef, {
            unreadNotifications: increment(1)
          });
        }
      }

      return {
        ...notification,
        id: notificationDoc.id
      };
    } catch (error) {
      console.error('Error in notifyNewProject:', error);
      return null;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId, userId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        [`readBy.${userId}`]: true
      });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        unreadNotifications: increment(-1)
      });

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }
};