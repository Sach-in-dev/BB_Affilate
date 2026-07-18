import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { api } from "@/lib/axios";

export default function SignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValid = Boolean(form.first_name && form.last_name && form.email && form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setLoading(true);
      setError(null);
      await api.post("/auth/signup", form);
      navigate("/login", { state: { justRegistered: true, email: form.email } });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Card className="relative w-full max-w-[440px] rounded-2xl bg-card shadow-2xl border border-border">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
          <h2 className="text-xl font-semibold text-foreground">Sign Up</h2>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground">First Name *</Label>
                <Input name="first_name" placeholder="First Name" onChange={handleChange} className="h-11" />
              </div>
              <div>
                <Label className="text-foreground">Last Name *</Label>
                <Input name="last_name" placeholder="Last Name" onChange={handleChange} className="h-11" />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Phone</Label>
              <Input name="phone" placeholder="Phone" onChange={handleChange} className="h-11" />
            </div>

            <div>
              <Label className="text-foreground">Email *</Label>
              <Input name="email" placeholder="Email" onChange={handleChange} className="h-11" />
            </div>

            <div className="relative">
              <Label className="text-foreground">Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={!isValid || loading}
              className="h-12 w-full rounded-full bg-[#962E3C] text-white hover:bg-[#7f2632] disabled:bg-gray-200 disabled:text-[#962E3C] disabled:opacity-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#7D1F35] hover:underline">
              Sign In
            </Link>
          </div>

          <p className="px-8 text-center text-[10px] leading-relaxed text-slate-400">
            By continuing, you agree to Beauty Barn&apos;s{" "}
            <a href="#" className="text-[#7D1F35] underline underline-offset-2">Terms of Use</a>{" "}
            and{" "}
            <a href="#" className="text-[#7D1F35] underline underline-offset-2">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
