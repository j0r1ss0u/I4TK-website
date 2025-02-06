// =================================================================
// emailService.js
// Service de gestion des emails de l'application
// =================================================================

import { auth } from './firebase';
import { 
  sendSignInLinkToEmail, 
  getAuth
} from 'firebase/auth';

// Configuration de base
const BASE_URL = 'https://www.i4tknowledge.org';

// Configuration des liens
const actionCodeSettings = {
  url: BASE_URL,
  handleCodeInApp: true
};

export const emailService = {
  // ------- Envoi d'email d'invitation -------
  async sendInvitationEmail(email, invitationId, organizationName) {
    try {
      console.log('Sending invitation email to:', email);
      const tempAuth = getAuth();
      await sendSignInLinkToEmail(tempAuth, email, {
        ...actionCodeSettings,
        url: `${BASE_URL}?invitationId=${invitationId}&org=${encodeURIComponent(organizationName)}`
      });
      window.localStorage.setItem('emailForInvitation', email);
      console.log('Invitation email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending invitation email:', error);
      throw error;
    }
  },

  // ------- Envoi d'email de réinitialisation de mot de passe -------
  async sendResetPasswordEmail(email, resetId) {
    try {
      console.log('Sending password reset email to:', email);
      const tempAuth = getAuth();

      await sendSignInLinkToEmail(tempAuth, email, {
        ...actionCodeSettings,
        // Structure similaire à l'invitation mais avec action et resetId
        url: `${BASE_URL}?action=resetPassword&resetId=${resetId}&email=${encodeURIComponent(email)}`
      });

      // Store email like in invitation flow
      window.localStorage.setItem('emailForReset', email);
      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending reset email:', error);
      throw error;
    }
  }
};

export default emailService;