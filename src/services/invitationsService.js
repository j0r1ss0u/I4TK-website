// =================================================================
// invitationsService.js
// Service de gestion des invitations utilisateurs
// =================================================================

import { auth, db } from './firebase';
import { emailService } from './emailService';
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
  Timestamp,
  getDoc,
  orderBy,
  setDoc,
  runTransaction
} from 'firebase/firestore';
import { 
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';

export const invitationsService = {
  // ------- Création d'une invitation -------
  async createInvitation(invitationData) {
    try {
      console.log('Création d\'une nouvelle invitation:', invitationData);

      // Vérification des données requises
      if (!invitationData.email || !invitationData.organization || !invitationData.role) {
        throw new Error('Email, organization et role sont requis');
      }

      // Vérifier si une invitation existe déjà pour cet email
      const existingInvitation = await this.getInvitationByEmail(invitationData.email);
      if (existingInvitation) {
        throw new Error('Une invitation active existe déjà pour cet email. Elle doit expirer ou être annulée avant d\'en créer une nouvelle.');
      }

      // Création de l'invitation
      const invitationsRef = collection(db, 'invitations');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const newInvitation = {
        email: invitationData.email.toLowerCase(),
        organization: invitationData.organization, // On stocke directement le nom de l'organisation
        role: invitationData.role,
        status: 'pending',
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: serverTimestamp(),
        createdBy: invitationData.createdBy
      };

      const docRef = await addDoc(invitationsRef, newInvitation);
      console.log('Invitation créée avec succès:', docRef.id);

      // Envoi de l'email avec le nom de l'organisation
      await emailService.sendInvitationEmail(
        invitationData.email,
        docRef.id,
        invitationData.organization // On utilise directement le nom
      );

      return {
        id: docRef.id,
        ...newInvitation
      };
    } catch (error) {
      console.error('Erreur lors de la création de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Récupération d'une invitation par email -------
  async getInvitationByEmail(email) {
    try {
      console.log('Recherche d\'invitation pour:', email);
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase())
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      // Vérifier si il y a une invitation active
      const activeInvitation = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.status === 'pending' && data.expiresAt.toDate() > new Date();
      });

      if (!activeInvitation) {
        return null;
      }

      return {
        id: activeInvitation.id,
        ...activeInvitation.data()
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Acceptation d'une invitation -------
  async acceptInvitation(invitationId, userData) {
   console.log('Début acceptInvitation avec:', { invitationId, userData });
   try {
     // 1. Récupération et validation de l'invitation
     const invitationRef = doc(db, 'invitations', invitationId);
     const invitationDoc = await getDoc(invitationRef);
     if (!invitationDoc.exists()) {
       throw new Error('Invitation non trouvée');
     }

     const invitation = invitationDoc.data();

     // 2. Vérifications de validité
     if (invitation.status !== 'pending') {
       throw new Error('Cette invitation n\'est plus valide');
     }

     if (invitation.expiresAt.toDate() < new Date()) {
       await updateDoc(invitationRef, { status: 'expired' });
       throw new Error('Cette invitation a expiré');
     }

     // 3. Vérification de l'utilisateur connecté
     const currentUser = auth.currentUser;
     if (!currentUser) {
       throw new Error('Utilisateur non connecté');
     }

     if (currentUser.email !== invitation.email) {
       throw new Error('Cette invitation ne correspond pas à votre email');
     }

     // 4. Préparation des données d'invitation
     const invitationData = {
       id: invitationId,
       role: invitation.role,
       organization: invitation.organization,
       email: invitation.email
     };

     // 5. Mise à jour du mot de passe d'abord
     await updatePassword(currentUser, userData.password);

     // 6. Création du profil et mise à jour de l'invitation dans une transaction
     await runTransaction(db, async (transaction) => {
       const userRef = doc(db, 'users', currentUser.uid);
       const userProfile = {
         email: currentUser.email,
         role: invitation.role,
         organization: invitation.organization,
         status: 'active',
         emailVerified: true,
         invitationId: invitationId,
         createdAt: serverTimestamp(),
         updatedAt: serverTimestamp()
       };

       // Créer le profil utilisateur
       transaction.set(userRef, userProfile);

       // Mettre à jour le statut de l'invitation
       transaction.update(invitationRef, {
         status: 'accepted',
         acceptedAt: serverTimestamp()
       });
     });

     // 7. Forcer un rafraîchissement de l'état d'authentification
     await currentUser.reload();

     // 8. Stocker temporairement les données pour AuthContext
     localStorage.setItem('pendingInvitationData', JSON.stringify(invitationData));

     console.log('Invitation acceptée avec succès');

     // 9. Attendre que les changements soient propagés
     await new Promise(resolve => setTimeout(resolve, 2000));

     return {
       uid: currentUser.uid,
       email: currentUser.email,
       ...invitationData
     };

   } catch (error) {
     console.error('Erreur complète dans acceptInvitation:', error);
     throw error;
   }
  },

  // ------- Annulation d'une invitation -------
  async cancelInvitation(invitationId) {
    try {
      console.log('Annulation de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      await deleteDoc(invitationRef);
      console.log('Invitation annulée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Liste des invitations en attente pour une organisation -------
  async getAllPendingInvitations() {
    try {
      console.log('Récupération de toutes les invitations en attente');
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const invitations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Invitations trouvées:', invitations);
      return invitations;
    } catch (error) {
      console.error('Erreur lors de la récupération des invitations:', error);
      throw error;
    }
  },

  // ------- Validation d'une invitation -------
  async validateInvitation(invitationId) {
    try {
      console.log('Vérification de l\'invitation:', invitationId);
      const invitationRef = doc(db, 'invitations', invitationId);
      const invitation = await getDoc(invitationRef);

      if (!invitation.exists()) {
        return { valid: false, message: 'Invitation non trouvée' };
      }

      const data = invitation.data();

      if (data.status !== 'pending') {
        return { valid: false, message: 'Cette invitation n\'est plus valide' };
      }

      if (data.expiresAt.toDate() < new Date()) {
        await updateDoc(invitationRef, { status: 'expired' });
        return { valid: false, message: 'Cette invitation a expiré' };
      }

      return { 
        valid: true,
        invitation: {
          id: invitation.id,
          ...data
        }
      };
    } catch (error) {
      console.error('Erreur lors de la validation de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Mise à jour du statut d'une invitation -------
  async updateInvitationStatus(invitationId, status, additionalData = {}) {
    try {
      console.log('Mise à jour du statut de l\'invitation:', invitationId, status);
      const invitationRef = doc(db, 'invitations', invitationId);

      await updateDoc(invitationRef, {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'invitation:', error);
      throw error;
    }
  },

  // ------- Nettoyage des invitations expirées -------
  async cleanupExpiredInvitations() {
    try {
      console.log('Nettoyage des invitations expirées');
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('status', '==', 'pending'),
        where('expiresAt', '<=', Timestamp.now())
      );

      const snapshot = await getDocs(q);
      const batch = db.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { status: 'expired' });
      });

      await batch.commit();
      console.log(`${snapshot.size} invitations expirées nettoyées`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des invitations:', error);
      throw error;
    }
  },

  // ------- Renvoyer une invitation -------
  async resendInvitation(invitationId) {
    try {
      console.log('Renvoi de l\'invitation:', invitationId);
      const invitation = await this.getInvitationById(invitationId);

      if (!invitation) {
        throw new Error('Invitation non trouvée');
      }

      // Mettre à jour la date d'expiration
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await updateDoc(doc(db, 'invitations', invitationId), {
        expiresAt: Timestamp.fromDate(expiresAt),
        updatedAt: serverTimestamp()
      });

      // Renvoyer l'email
      await emailService.sendInvitationEmail(
        invitation.email,
        invitationId,
        invitation.organization
      );

      return true;
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'invitation:', error);
      throw error;
    }
  }
};

export default invitationsService;