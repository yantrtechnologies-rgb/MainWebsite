import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/context/contexts";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}`);
      navigate(user.role === "admin" || user.role === "staff" ? "/admin" : "/");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Login failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0B0F19] text-white relative overflow-hidden px-4">
      <div className="absolute inset-0 grid-lines opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#2563EB]/20 blur-[130px]" />
      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/xolnet.png" alt="XOLNET Technologies logo" className="w-12 h-12 rounded-lg object-contain" />
          <span className="font-display font-extrabold text-2xl">XOLNET</span>
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8">
          <div className="flex items-center gap-2 text-[#84CC16] mb-1"><Lock className="w-4 h-4" /><span className="eyebrow">Admin & Staff Login</span></div>
          <h1 className="font-display text-2xl font-extrabold">Sign in to your dashboard</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label className="text-slate-300">Email</Label>
              <Input data-testid="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 bg-white/5 border-white/10 text-white" />
            </div>
            <div>
              <Label className="text-slate-300">Password</Label>
              <Input data-testid="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5 bg-white/5 border-white/10 text-white" />
            </div>
            <Button data-testid="login-submit" type="submit" disabled={loading} className="w-full bg-[#84CC16] text-[#0B0F19] hover:bg-white font-semibold rounded-full h-11">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…</> : "Sign In"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">Protected area. Unauthorized access is prohibited.</p>
      </div>
    </div>
  );
}
