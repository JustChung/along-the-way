import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase"; // import Firebase auth
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
} from "firebase/auth";

export function AccountPage() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCurrentPasswordEntered, setIsCurrentPasswordEntered] =
    useState(false); // Flag for current password entry
  const [isPasswordChangeFailed, setIsPasswordChangeFailed] = useState(false); // Flag for failed password change attempt
  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2>Please log in to view this page.</h2>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Function to send email verification
  const sendVerificationEmail = async () => {
    if (user) {
      try {
        // Reload user to ensure the object is fresh
        await user.reload();

        // Send email verification
        await sendEmailVerification(user);
        alert("Verification email sent!");
      } catch (error) {
        console.error("Error sending verification email:", error);

        if (error.code === "auth/too-many-requests") {
          alert("Too many requests. Please try again later.");
        } else if (error.code === "auth/user-not-found") {
          alert("User not found. Please log in again.");
        } else {
          alert("Failed to send verification email. Please try again.");
        }
      }
    } else {
      alert("No user is logged in.");
    }
  };

  // Function to handle change password
  const handleChangePassword = async () => {
    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    try {
      setLoading(true);

      // Reauthenticate the user with current password
      const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Now update the password if user credentials are correct
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");

      // Reset the form after success
      setCurrentPassword("");
      setNewPassword("");
      setIsCurrentPasswordEntered(false);
      setIsPasswordChangeFailed(false); // Reset failed flag
      setLoading(false);
    } catch (error) {
      setPasswordError(
        "Failed to change password. Please check your current password. It has to be entered correctly in order to change it."
      );
      setIsPasswordChangeFailed(true); // Set the failed flag
      setLoading(false);
    }
  };

  // Function to retry password change after failed attempt
  const handleRetry = () => {
    setCurrentPassword("");
    setNewPassword("");
    setIsCurrentPasswordEntered(false);
    setPasswordError("");
    setIsPasswordChangeFailed(false); // Reset the failed flag
  };

  // Function to delete account
  const deleteAccount = async () => {
    if (!user) return;

    try {
      await deleteUser(user);
      alert("Account deleted successfully");
      navigate("/signup");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="text-center">
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>Here is your account information:</p>

        {/* Profile Information */}
        <div className="my-4">
          <p>Email: {user.email}</p>
          <p>
            Account Created:{" "}
            {new Date(user.metadata.creationTime).toLocaleDateString()}
          </p>
        </div>

        {/* Account Settings */}
        <div className="my-4">
          {/* Change Password Section */}
          <p>Change Password: </p>
          <div className="mb-4">
            {!isCurrentPasswordEntered ? (
              <>
                <input
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border p-2"
                />
                <button
                  onClick={() => setIsCurrentPasswordEntered(true)}
                  className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
                  disabled={loading}
                >
                  Verify Current Password
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border p-2"
                />
                {passwordError && (
                  <p className="text-red-500">{passwordError}</p>
                )}
                {isPasswordChangeFailed ? (
                  <button onClick={handleRetry} className="text-blue-500 mt-2">
                    Retry
                  </button>
                ) : (
                  <button
                    onClick={handleChangePassword}
                    className="bg-blue-500 text-white py-2 px-4 rounded mt-2"
                    disabled={loading}
                  >
                    {loading ? "Changing Password..." : "Change Password"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Resend Verification */}
          <p>
            {user.emailVerified ? "Email Verified" : "Email Not Verified"}{" "}
            <button onClick={sendVerificationEmail} className="text-blue-500">
              Resend Verification
            </button>
          </p>
        </div>

        {/* Activity History */}
        <div className="my-4">
          <p>
            Last Login:{" "}
            {new Date(user.metadata.lastSignInTime).toLocaleString()}
          </p>
        </div>

        {/* Account Deletion or Deactivation */}
        <div className="my-4">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded"
            onClick={deleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
