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
// ✅ Services
import { loginUser, resetPassword } from "../services/authService";
import { getLogUser } from "../services/userService";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const user = await loginUser(email, password, rememberMe);
      const userData = await getLogUser(user.uid);

      toast.success("Login successful!");

      if (userData?.role === "Admin") {
        navigate("/Admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    try {
      const msg = await resetPassword(email);
      toast.success(msg);
    } catch (err) {
      toast.error(err.message);
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
            Welcome back — pour yourself in.
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                />
                <Label className="text-sm">Remember me</Label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Sign In"}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don’t have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
