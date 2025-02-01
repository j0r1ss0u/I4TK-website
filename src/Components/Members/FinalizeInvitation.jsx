// src/components/Members/FinalizeInvitation.jsx
import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { documentsService } from '../../services/documentsService';
import { torService } from '../../services/torService';
import { Loader2 } from 'lucide-react';

const STEPS = {
  TOR: 'tor',
  PASSWORD: 'password'
};

const FinalizeInvitation = ({ setCurrentPage }) => {
  const [step, setStep] = useState(STEPS.TOR);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [torDocument, setTorDocument] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTor, setAcceptTor] = useState(false);

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

  const handleTorAccept = async () => {
    if (!acceptTor) {
      setError('You must accept the Terms of Reference to continue');
      return;
    }

    try {
      setIsSubmitting(true);
      // Enregistrer l'acceptation du ToR
      await torService.acceptToR(invitation.email, torDocument.id);
      // Passer à l'étape suivante
      setStep(STEPS.PASSWORD);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!acceptTor) {
        throw new Error('Terms of Reference must be accepted first');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const result = await invitationsService.acceptInvitation(invitation.id, { password });
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.history.pushState({}, '', '/');
      setCurrentPage('home');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-6">
            Set Your Password
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Password must be at least 8 characters long and contain at least one uppercase letter, 
                one lowercase letter, and one number.
              </p>
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinalizeInvitation;