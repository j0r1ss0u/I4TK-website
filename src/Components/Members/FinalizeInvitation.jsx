// =================================================================
// FinalizeInvitation.jsx
// Composant de finalisation d'invitation utilisateur
// =================================================================

import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { documentsService } from '../../services/documentsService';
import { torService } from '../../services/torService';
import { Loader2 } from 'lucide-react' ;
import { auth } from '../../services/firebase';
import PasswordForm from './PasswordForm';

// =================================================================
// Constantes
// =================================================================

const STEPS = {
  TOR: 'tor',
  PASSWORD: 'password'
};

// =================================================================
// Composant Principal
// =================================================================

const FinalizeInvitation = ({ handlePageChange }) => {
  // ------- État local -------
  const [step, setStep] = useState(STEPS.TOR);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [torDocument, setTorDocument] = useState(null);
  const [acceptTor, setAcceptTor] = useState(false);

  // ------- Initialisation -------
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Valider l'invitation
        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get('invitationId');
        if (!invitationId) {
          throw new Error('Invalid invitation link');
        }

        const invitationResult = await invitationsService.validateInvitation(invitationId);
        if (!invitationResult.valid) {
          throw new Error(invitationResult.message);
        }
        setInvitation(invitationResult.invitation);

        // 2. Récupérer le dernier ToR
        const torResults = await documentsService.semanticSearch('TERMS OF REFERENCE');
        if (torResults && torResults.length > 0) {
          setTorDocument(torResults[0]);
        } else {
          throw new Error('Terms of Reference document not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ------- Gestionnaires d'événements -------
  const handleTorAccept = async () => {
    if (!acceptTor) {
      setError('You must accept the Terms of Reference to continue');
      return;
    }

    try {
      setIsSubmitting(true);
      await torService.acceptToR(invitation.email, torDocument.id);
      setStep(STEPS.PASSWORD);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------- Gestionnaire de finalisation -------
  const handlePasswordSubmit = async ({ password }) => {
    try {
      if (!acceptTor) {
        throw new Error('Terms of Reference must be accepted first');
      }

      // Attendre la création complète du profil
      const userData = await invitationsService.acceptInvitation(invitation.id, { password });

      // Forcer un rafraîchissement de l'état d'authentification
      await auth.currentUser.reload();

      // Attendre que les changements soient propagés
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Rediriger
      window.history.pushState({}, '', '/');
      handlePageChange('home');
    } catch (error) {
      throw error;
    }
  };

  // ------- Rendus conditionnels -------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // ------- Rendu principal -------
  return (
    <div className="container mx-auto max-w-2xl p-6">
      {step === STEPS.TOR ? (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
              Terms of Reference
            </h2>

            {torDocument && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">{torDocument.title}</h3>
                <div className="prose max-w-none mb-6">
                  <p>{torDocument.excerpt || torDocument.description}</p>

                  {torDocument.ipfsCid && (
                    <div className="mt-4">
                      <a 
                        href={`ipfs://${torDocument.ipfsCid}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:text-amber-700"
                      >
                        View complete document
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={acceptTor}
                      onChange={(e) => setAcceptTor(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-amber-600"
                    />
                    <span className="text-gray-700">
                      I have read and accept the Terms of Reference
                    </span>
                  </label>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleTorAccept}
                    disabled={!acceptTor || isSubmitting}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <PasswordForm 
          onSubmit={handlePasswordSubmit}
          buttonText="Complete Registration"
        />
      )}
    </div>
  );
};

export default FinalizeInvitation;