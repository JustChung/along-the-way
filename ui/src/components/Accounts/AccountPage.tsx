import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
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
  const [passwordShown, setPasswordShown] = useState(false); // State for toggling password visibility
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCurrentPasswordEntered, setIsCurrentPasswordEntered] =
    useState(false); // Flag for current password entry
  const [isPasswordChangeFailed, setIsPasswordChangeFailed] = useState(false); // Flag for failed password change attempt
  const togglePasswordVisibility = () => setPasswordShown(!passwordShown);
  const user = auth.currentUser;

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
        <h2 className="text-xl mb-4">Please log in to view your account</h2>
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 transition-colors"
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
        "Failed to change password. Please check your current password. It has to be entered correctly before you can change it."
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
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          Welcome, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-700 mb-6">Here is your account information:</p>

        {/* Profile Information */}
        <div className="mb-6">
          <p className="text-gray-600">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-gray-600">
            <strong>Account Created:</strong>{" "}
            {new Date(user.metadata.creationTime).toLocaleDateString()}
          </p>
        </div>

        {/* Account Settings */}
        {/* Change Password Section */}
        <div className="mb-6">
          <p className="font-semibold text-gray-700 mb-2">Change Password:</p>
          {!isCurrentPasswordEntered ? (
            <div>
              <div className="relative">
                <input
                  type={passwordShown ? "text" : "password"}
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200"
                />
                <i
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 cursor-pointer"
                >
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  )}
                </i>
              </div>
              <button
                onClick={() => setIsCurrentPasswordEntered(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-3 w-full hover:bg-blue-600"
                disabled={loading}
              >
                Verify Current Password
              </button>
            </div>
          ) : (
            <div>
              <div className="relative">
                <input
                  type={passwordShown ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="border rounded-lg p-2 w-full focus:ring focus:ring-blue-200"
                />
                <i
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 cursor-pointer"
                >
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  )}
                </i>
              </div>
              {passwordError && (
                <p className="text-red-500 mt-2">{passwordError}</p>
              )}
               {isPasswordChangeFailed ? (
                  <button onClick={handleRetry} className="text-blue-500 mt-2">
                    Retry
                  </button>
                ) : (
              <button
                onClick={handleChangePassword}
                className="bg-blue-500 text-white py-2 px-4 rounded mt-3 w-full hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Changing Password..." : "Change Password"}
              </button>
                )}
            </div>
          )}
        </div>

        {/* Verification Section */}
        <div className="mb-6">
          <p className="text-gray-700">
            {user.emailVerified ? "Email Verified" : "Email Not Verified"}
            <button
              onClick={sendVerificationEmail}
              className="text-blue-500 hover:underline ml-2"
            >
              Resend Verification
            </button>
          </p>
        </div>

        {/* Activity History */}
        <div className="mb-6">
          <p className="text-gray-600">
            <strong>Last Login:</strong>{" "}
            {new Date(user.metadata.lastSignInTime).toLocaleString()}
          </p>
        </div>

        {/* Account Deletion */}
        <div>
          <button
            onClick={deleteAccount}
            className="bg-red-500 text-white py-2 px-4 rounded w-full hover:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

