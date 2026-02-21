"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, ArrowRight, User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Check password strength
  useEffect(() => {
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    setStrength(Math.min(score, 3));
  }, [password]);

  // Check match
  useEffect(() => {
    setPasswordsMatch(password === confirmPassword || confirmPassword === "");
  }, [password, confirmPassword]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (strength < 1) {
      toast({
        title: "Weak Password",
        description: "Please create a stronger password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phoneNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // Set auth cookie
      document.cookie = `auth-token=${data.data.token}; path=/; max-age=86400; SameSite=Strict; Secure`;
      
      toast({
        title: "Account Created!",
        description: "Welcome to the Oi! Lend Me community.",
        variant: "success",
      });

      router.push("/home");
    } catch (err: any) {
      toast({
        title: "Signup Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 pt-24 pb-12 bg-[#0B0F1A] selection:bg-blue-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg p-1 rounded-3xl bg-gradient-to-br from-white/10 via-transparent to-blue-500/5 shadow-2xl"
      >
        <Card className="border-0 bg-[#121726]/85 backdrop-blur-2xl shadow-inner shadow-white/5 rounded-[1.4rem]">
          <CardHeader className="space-y-2 text-center pb-6 pt-10">
            <motion.div 
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-blue-600/15 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white py-1">Join the inner circle</CardTitle>
            <CardDescription className="text-gray-400">
              Create an account to start lending and borrowing.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-10">
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1 ml-1">
                    <User className="w-3 h-3 text-blue-400" /> Full Name
                  </label>
                  <Input 
                    type="text" 
                    placeholder="Alex River"
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-11 transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1 ml-1">
                    <Mail className="w-3 h-3 text-blue-400" /> College Email
                  </label>
                  <Input 
                    type="email" 
                    placeholder="you@college.edu"
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-11 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center justify-between mb-1 ml-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-blue-400" /> Phone Number
                  </div>
                  <span className="text-[10px] text-gray-600 normal-case font-normal">(Optional)</span>
                </label>
                <Input 
                  type="tel" 
                  placeholder="+1 234 567 8900"
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-11 transition-all"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Password */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1 ml-1">
                    <Lock className="w-3 h-3 text-blue-400" /> Password
                  </label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 h-11 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Strength Indicator */}
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5 mt-2">
                    <motion.div 
                      animate={{ opacity: strength >= 1 ? 1 : 0.2 }}
                      className={`h-full flex-1 transition-colors duration-300 ${strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : strength === 3 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`} 
                    />
                    <motion.div 
                      animate={{ opacity: strength >= 2 ? 1 : 0.2 }}
                      className={`h-full flex-1 transition-colors duration-300 ${strength === 2 ? 'bg-yellow-500' : strength === 3 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`} 
                    />
                    <motion.div 
                      animate={{ opacity: strength >= 3 ? 1 : 0.2 }}
                      className={`h-full flex-1 transition-colors duration-300 ${strength === 3 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`} 
                    />
                  </div>
                  <p className="text-[9px] text-right text-gray-500 font-bold uppercase tracking-tighter">
                    {strength === 0 ? "Too weak" : strength === 1 ? "Weak" : strength === 2 ? "Medium" : "Secure"}
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1 ml-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" /> Confirm
                  </label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    className={`bg-black/20 border-white/10 text-white placeholder:text-gray-600 h-11 transition-all ${!passwordsMatch && confirmPassword ? 'border-red-500/50 focus-visible:ring-red-500/30' : 'focus-visible:ring-blue-500/50'}`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  {!passwordsMatch && confirmPassword && (
                    <p className="text-[10px] text-red-400/80 font-medium ml-1">Passwords mismatch</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-4 h-12"
                disabled={loading || !passwordsMatch || strength < 1}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
              <GoogleAuthButton />
            </form>
          </CardContent>

          <CardFooter className="text-center text-sm text-gray-500 flex justify-center pb-10 pt-2">
            Already have an account? 
            <Link href="/auth/login" className="text-blue-400/90 ml-2 hover:text-blue-300 transition-colors font-bold flex items-center group">
               Log in
               <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

