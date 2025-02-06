import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import { auth } from '../../services/firebase';
import { db } from '../../services/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import PasswordForm from './PasswordForm';

const ForgotPassword = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [resetDocument, setResetDocument] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, reset, success

  const { resetPassword, setAuthPage } = useAuth();

  // Init - Check if arriving from reset link
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        // Get resetId from URL
        const params = new URLSearchParams(window.location.search);
        const resetId = params.get('resetId');

        if (resetId) {
          // Validate reset document
          const resetRef = doc(db, 'passwordResets', resetId);
          const resetDoc = await getDoc(resetRef);

          if (!resetDoc.exists()) {
            throw new Error('Reset request not found');
          }

          const resetData = resetDoc.data();

          // Check status and expiration
          if (resetData.status !== 'validated') {
            throw new Error('Invalid reset link');
          }

          if (resetData.expiresAt.toDate() < new Date()) {
            await updateDoc(resetRef, { status: 'expired' });
            throw new Error('Reset link has expired');
          }

          setResetDocument({ id: resetId, ...resetData });
          setEmail(resetData.email);
          setStatus('reset');
        }
      } catch (err) {
        console.error('Error initializing password reset:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // Handle initial password reset request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await resetPassword(email);
      setStatus('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordSubmit = async ({ password }) => {
    try {
      if (!resetDocument?.id) {
        throw new Error('Reset information not found');
      }

      setIsSubmitting(true);

      // 1. Update password
      await auth.currentUser.updatePassword(password);

      // 2. Update reset document
      const resetRef = doc(db, 'passwordResets', resetDocument.id);
      await updateDoc(resetRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // 3. Redirect to login
      setAuthPage('login');
    } catch (error) {
      console.error('Error during password reset:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => setAuthPage('login')}
            className="mt-4 flex items-center text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Success state - after sending email
  if (status === 'success') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Check Your Email</h2>
          <p className="text-gray-600 mb-4 text-center">
            If an account exists with this email address, you will receive password reset instructions.
          </p>
          <button
            onClick={() => setAuthPage('login')}
            className="w-full flex justify-center items-center text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Reset password form
  if (status === 'reset') {
    return (
      <div className="container mx-auto max-w-md p-6">
        <PasswordForm 
          onSubmit={handlePasswordSubmit}
          buttonText="Reset Password"
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // Initial request form
  return (
    <div className="container mx-auto max-w-md p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Your Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Reset Instructions
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAuthPage('login')}
            className="w-full flex justify-center items-center text-gray-600 hover:text-gray-700 mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;