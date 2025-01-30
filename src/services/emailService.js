// =================================================================
// emailService.js
// Service de gestion des emails de l'application
// =================================================================
import { auth } from './firebase';
import { sendSignInLinkToEmail, getAuth } from 'firebase/auth';

// Configuration des actions d'email
const actionCodeSettings = {
  url: 'https://www.i4tknowledge.org/finalize-invitation',
  handleCodeInApp: true,
  };

export const emailService = {
  // ------- Envoi d'email d'invitation -------
  async sendInvitationEmail(email, invitationId, organizationName) {
    try {
      console.log('Envoi d\'email d\'invitation à:', email);

      // Créer un auth temporaire pour l'invité
      const tempAuth = getAuth();
      await sendSignInLinkToEmail(tempAuth, email, {
        ...actionCodeSettings,
        url: `${actionCodeSettings.url}?invitationId=${invitationId}&org=${encodeURIComponent(organizationName)}`
      });

      // Stocker l'email dans localStorage pour la vérification
      window.localStorage.setItem('emailForInvitation', email);

      console.log('Email d\'invitation envoyé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email d\'invitation:', error);
      throw error;
    }
  }
};

export default emailService;