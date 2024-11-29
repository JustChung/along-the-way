import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../database/firebase';  // import Firebase auth

export function AccountPage() {
  const navigate = useNavigate();

  // Check if the user is logged in
  const user = auth.currentUser;

  if (!user) {
    // If the user is not logged in, redirect them to the login page
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2>Please log in to view this page.</h2>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Function to send email verification
  const sendVerificationEmail = () => {
    user.sendEmailVerification().then(() => {
      alert('Verification email sent!');
    }).catch((error) => {
      console.error('Error sending verification email:', error);
    });
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>Here is your account information:</p>

        {/* Profile Information */}
        <div className="my-4">
          <p>Email: {user.email}</p>
          <p>Account Created: {new Date(user.metadata.creationTime).toLocaleDateString()}</p>
        </div>

        {/* Account Settings */}
        <div className="my-4">
          <button className="bg-blue-500 text-white py-2 px-4 rounded mb-2">Change Password</button>
          <p>
            {user.emailVerified
              ? 'Email Verified'
              : 'Email Not Verified'}{' '}
            <button
              onClick={sendVerificationEmail}
              className="text-blue-500"
            >
              Resend Verification
            </button>
          </p>
        </div>

        {/* Activity History */}
        <div className="my-4">
          <p>Last Login: {new Date(user.metadata.lastSignInTime).toLocaleString()}</p>
        </div>

        {/* Account Deletion or Deactivation */}
        <div className="my-4">
          <button className="bg-red-500 text-white py-2 px-4 rounded">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}