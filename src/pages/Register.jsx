import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Coffee, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

// ✅ Service
import { registerUser, checkContactExists } from "../services/authService";

const Register = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(""); // username
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  //Phone OTP Verification states
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [showOtpField, setShowOtpField] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState(null);

  const [otpLoading, setOtpLoading] = useState(false);

  const verifyOtp = async () => {
    try {
      if (!phoneOtp) {
        return toast.error("Enter OTP");
      }

      if (!confirmationResult) {
        return toast.error("Send OTP first");
      }

      await confirmationResult.confirm(phoneOtp);

      setPhoneVerified(true);

      // Remove temporary phone auth session
      await auth.signOut();

      toast.success("Phone verified successfully");
    } catch (error) {
      toast.error("Invalid OTP");
    }
  };

  const sendPhoneOtp = async () => {
    try {
      if (!/^[6-9]\d{9}$/.test(contact)) {
        return toast.error("Invalid contact number");
      }

      const exists = await checkContactExists(contact);

      if (!exists) {
        setOtpLoading(false);
        return;
      }

      setOtpLoading(true);

      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          },
        );
      }

      const appVerifier = window.recaptchaVerifier;

      const result = await signInWithPhoneNumber(
        auth,
        `+91${contact}`,
        appVerifier,
      );

      setConfirmationResult(result);

      setShowOtpField(true);

      toast.success("OTP sent successfully");
    } catch (error) {
      console.log(error);

      toast.error(error.message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!phoneVerified) {
    //   return toast.error("Please verify phone number");
    // }

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    const isValid = await checkContactExists(contact);

    if (!isValid) return;

    // if (!agreed) {
    //   return toast.error("Please agree to terms");
    // }

    try {
      setLoading(true);

      await registerUser(name, email, contact, password);

      toast.success("Registered successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="font-serif text-2xl text-primary">Expresso</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start your diaryEntriesing journey.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in the details to get started
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter username"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>Contact</Label>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value);

                      // setPhoneVerified(false);

                      // setShowOtpField(false);

                      // setPhoneOtp("");
                    }}
                    // disabled={phoneVerified}
                  />
                </div>
              </div>

              {/* <Button
                    type="button"
                    onClick={sendPhoneOtp}
                    disabled={phoneVerified || otpLoading || showOtpField}
                  >
                    {phoneVerified
                      ? "Verified"
                      : otpLoading
                        ? "Sending..."
                        : "Verify"}
                  </Button>
                </div>

                {showOtpField && !phoneVerified && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter OTP"
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value)}
                    />

                    <Button type="button" onClick={verifyOtp}>
                      Submit OTP
                    </Button>
                  </div>
                )}
              </div> */}

              <div className="space-y-2">
                <div className="relative">
                  <Label>Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Label>Confirm Password</Label>
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* <div className="flex items-center gap-2">
                <Checkbox checked={agreed} onCheckedChange={setAgreed} />
                <Label>I agree to Terms</Label>
              </div> */}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </Button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default Register;
