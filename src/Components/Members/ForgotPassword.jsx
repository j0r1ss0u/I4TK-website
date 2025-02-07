import React, { useState, useEffect } from 'react';
import { AlertTriangle, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../Components/AuthContext';
import { auth, db } from '../../services/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updatePassword, confirmPasswordReset } from 'firebase/auth';
import PasswordForm from './PasswordForm';

const ForgotPassword = () => {
 const { resetPassword, setAuthPage } = useAuth();
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [email, setEmail] = useState('');
 const [status, setStatus] = useState('idle');

 useEffect(() => {
   const params = new URLSearchParams(window.location.search);
   const oobCode = params.get('oobCode');
   if (oobCode) {
     setStatus('reset');
   }
   setLoading(false);
 }, []);

  const handlePasswordSubmit = async ({ password }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      await updatePassword(auth.currentUser, password);

      const params = new URLSearchParams(window.location.search);
      const resetId = params.get('resetId');
      if (resetId) {
        const resetRef = doc(db, 'passwordResets', resetId);
        await updateDoc(resetRef, {
          status: 'completed',
          completedAt: serverTimestamp()
        });
      }

      setAuthPage('login');
    } catch (error) {
      console.error('Error during password reset:', error);
      setError(error.message);
    }
  };

 const handleSubmit = async (e) => {
   e.preventDefault();
   setStatus('loading');
   setError('');
   try {
     await resetPassword(email);
     setStatus('success');
   } catch (error) {
     setError('An error occurred while sending the email. Please try again.');
     setStatus('error');
   }
 };

 if (loading) {
   return (
     <div className="flex justify-center items-center min-h-screen">
       <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
     </div>
   );
 }

 return (
   <div className="container mx-auto max-w-md p-6">
     {status === 'reset' ? (
       <PasswordForm 
         onSubmit={handlePasswordSubmit}
         buttonText="Reset Password"
       />
     ) : (
       <div className="bg-white shadow-lg rounded-lg p-6">
         <h2 className="text-2xl font-bold text-center mb-6">
           Reset Your Password
         </h2>
         {status === 'success' ? (
           <div className="text-center">
             <p className="text-gray-600 mb-4">
               If an account exists with this email, you will receive password reset instructions.
             </p>
             <button
               onClick={() => setAuthPage('login')}
               className="text-amber-600 hover:text-amber-700"
             >
               <ArrowLeft className="h-4 w-4 inline mr-2" />
               Back to Login
             </button>
           </div>
         ) : (
           <form onSubmit={handleSubmit} className="space-y-4">
             <div>
               <input
                 type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="Enter your email"
                 className="w-full px-4 py-2 border rounded-md"
                 required
               />
             </div>
             {error && (
               <div className="text-red-500 flex items-center">
                 <AlertTriangle className="h-4 w-4 mr-2" />
                 {error}
               </div>
             )}
             <button
               type="submit"
               disabled={status === 'loading'}
               className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
             >
               {status === 'loading' ? (
                 <Loader2 className="h-5 w-5 animate-spin mx-auto" />
               ) : (
                 'Send Reset Instructions'
               )}
             </button>
             <button
               type="button"
               onClick={() => setAuthPage('login')}
               className="w-full text-gray-600 hover:text-gray-700 flex items-center justify-center"
             >
               <ArrowLeft className="h-4 w-4 mr-2" />
               Back to Login
             </button>
           </form>
         )}
       </div>
     )}
   </div>
 );
};

export default ForgotPassword;