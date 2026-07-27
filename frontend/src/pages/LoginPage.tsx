import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean((location.state as { justRegistered?: boolean } | null)?.justRegistered);
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: prefillEmail, password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValid = Boolean(form.email && form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/auth/login", form);
      if (res.data?.data?.token) {
        localStorage.setItem("token", res.data.data.token);
      }
      const u = res.data?.data?.user;
      navigate(u?.user_type === "admin" ? "/admin" : "/dashboard");
      window.location.reload();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-4">
      <Card className="relative w-full max-w-[440px] rounded-2xl bg-neutral-900 shadow-2xl border border-white/10">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white mb-2">
            <span className="text-primary">26</span>ritual
          </Link>
          <h2 className="text-xl font-semibold text-white">Login</h2>
          <p className="text-center text-sm text-neutral-400 max-w-xs">
            Enter your details to continue.
          </p>
        </CardHeader>

        <CardContent className="space-y-5 px-6 pb-6">
          {justRegistered && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-center text-sm font-medium text-primary">
              Account created! Sign in to continue.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-neutral-300">Email *</Label>
              <Input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="h-11 bg-neutral-800/50 border-white/10 text-white placeholder:text-neutral-500"
              />
            </div>

            <div className="relative">
              <Label className="text-neutral-300">Password *</Label>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="h-11 pr-10 bg-neutral-800/50 border-white/10 text-white placeholder:text-neutral-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-neutral-500 hover:text-white"
              >
                {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox />
              <span className="text-sm text-neutral-400">Remember me</span>
            </div>

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <Button
              type="submit"
              disabled={!isValid || loading}
              className="h-12 w-full rounded-full bg-white text-neutral-950 font-semibold hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:opacity-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="font-bold text-primary hover:underline">
              Register
            </Link>
          </div>

          <p className="px-8 text-center text-[10px] leading-relaxed text-neutral-500">
            By continuing, you agree to 26 Ritual&apos;s{" "}
            <a href="#" className="text-primary underline underline-offset-2">Terms of Use</a>{" "}
            and{" "}
            <a href="#" className="text-primary underline underline-offset-2">Privacy Policy</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
