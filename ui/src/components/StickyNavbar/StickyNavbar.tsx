import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
} from "@material-tailwind/react";
import { auth } from "../../database/firebase"; // import Firebase auth
import { signOut } from "firebase/auth"; // import Firebase signOut function

export function StickyNavbar() {
  const [openNav, setOpenNav] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
  const navigate = useNavigate(); // For navigation

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user); // Set isLoggedIn based on whether a user is authenticated
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setIsLoggedIn(false); // Update login status after sign out
        navigate("/"); // Redirect to homepage after sign out
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const navList = (
    <ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <Link to="/">Home</Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <Link to="/account">Account</Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <Link to="#">Docs</Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <Link to="#">Saved Routes</Link>
      </Typography>
      <Typography
        as="li"
        variant="small"
        color="blue-gray"
        className="p-1 font-normal"
      >
        <Link to="#">Chat History</Link>
      </Typography>
    </ul>
  );

  return (
    <Navbar className="sticky top-0 z-[1] h-max max-w-full rounded-none px-4 py-2 lg:px-8 lg:py-4">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography
          as={Link}
          to="/" // Navigate to the root path
          className="mr-4 cursor-pointer py-1.5 font-medium"
        >
          Along The Way
        </Typography>
        <div className="flex items-center gap-4">
          <div className="mr-4 hidden lg:block">{navList}</div>
          <div className="flex items-center gap-x-1">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="text"
                  size="sm"
                  className="hidden lg:inline-block"
                  onClick={() => navigate("/login")}
                >
                  <span>Log In</span>
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  className="hidden lg:inline-block"
                  onClick={() => navigate("/signup")}
                >
                  <span>Sign up</span>
                </Button>
              </>
            ) : (
              <Button
                variant="gradient"
                size="sm"
                className="hidden lg:inline-block"
                onClick={handleSignOut}
              >
                <span>Sign Out</span>
              </Button>
            )}
          </div>
          <IconButton
            variant="text"
            className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
            ripple={false}
            onClick={() => setOpenNav(!openNav)}
          >
            {openNav ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}
