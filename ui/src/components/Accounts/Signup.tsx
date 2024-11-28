import { useState } from "react";
import { Typography, Input, Button, Dialog } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { auth } from "../../database/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export function Signup() {
  const [passwordShown, setPasswordShown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);  // To manage the popup state
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setPasswordShown((cur) => !cur);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setOpen(true);  // Open the popup on successful signup
      setTimeout(() => navigate("/login"), 2000);  // Redirect after 2 seconds
    } catch (error) {
      setError("Error signing up. Please try again.");
    }
  };

  return (
    <section className="grid text-center h-screen items-center p-8">
      <div>
        <Typography variant="h3" color="blue-gray" className="mb-2">
          Create Account
        </Typography>
        <Typography className="mb-16 text-gray-600 font-normal text-[18px]">
          Enter your details to create a new account
        </Typography>
        <form
          onSubmit={handleSignup}
          className="mx-auto max-w-[24rem] text-left"
        >
          <div className="mb-6">
            <label htmlFor="email">
              <Typography
                variant="small"
                className="mb-2 block font-medium text-gray-900"
              >
                Your Email
              </Typography>
            </label>
            <Input
              id="email"
              color="gray"
              size="lg"
              type="email"
              name="email"
              placeholder="name@mail.com"
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // controlled input
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password">
              <Typography
                variant="small"
                className="mb-2 block font-medium text-gray-900"
              >
                Password
              </Typography>
            </label>
            <Input
              size="lg"
              placeholder="********"
              className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
              type={passwordShown ? "text" : "password"}
              icon={
                <i onClick={togglePasswordVisibility}>
                  {passwordShown ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </i>
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)} // controlled input
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <Button
            type="submit"
            color="gray"
            size="lg"
            className="mt-6"
            fullWidth
          >
            Sign up
          </Button>
          <div className="!mt-4 flex justify-center">
            <Typography variant="small" color="gray" className="font-normal">
              Already have an account?{" "}
              <a
                href="#"
                className="font-medium text-gray-900"
                onClick={() => navigate("/login")}
              >
                Sign in
              </a>
            </Typography>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      <Dialog open={open} handler={() => setOpen(false)}>
        <div className="text-center p-8">
          <Typography variant="h5" color="green" className="mb-2">
            Account Created Successfully!
          </Typography>
          <Typography className="text-gray-600 font-normal text-[16px] mb-6">
            You are being redirected to the login page...
          </Typography>
        </div>
      </Dialog>
    </section>
  );
}

export default Signup;
