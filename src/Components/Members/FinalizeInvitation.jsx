import React, { useState, useEffect } from 'react';
import { invitationsService } from '../../services/invitationsService';
import { Loader2 } from 'lucide-react';

const validatePassword = (password) => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
};

const FinalizeInvitation = ({ setCurrentPage }) => {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const validateInvitation = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const invitationId = params.get('invitationId');
        if (!invitationId) {
          throw new Error('Invalid invitation link');
        }

        const { valid, invitation, message } = await invitationsService.validateInvitation(invitationId);
        if (!valid) {
          throw new Error(message);
        }

        setInvitation(invitation);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    validateInvitation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      validatePassword(password);

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      await invitationsService.acceptInvitation(invitation.id, { password });
      setCurrentPage('home');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
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
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Registration
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default FinalizeInvitation;