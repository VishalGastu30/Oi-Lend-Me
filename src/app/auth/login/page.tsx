"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Set auth cookie
      document.cookie = `auth-token=${data.data.token}; path=/; max-age=86400; SameSite=Strict; Secure`;
      
      toast({
        title: "Welcome back!",
        description: "Successfully authenticated.",
        variant: "success",
      });

      if (data.data.redirectTo) {
        router.push(data.data.redirectTo);
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 pt-24 bg-[#0B0F1A] selection:bg-blue-500/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent shadow-2xl"
      >
        <Card className="border-0 bg-[#121726]/80 backdrop-blur-xl shadow-inner shadow-white/5">
          <CardHeader className="space-y-2 text-center pb-8 pt-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <Lock className="w-8 h-8" />
            </motion.div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white py-2">Welcome back</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your college email to access the vault.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 ml-1">College Email</label>
                <div className="relative group">
                  <Input 
                    type="email" 
                    placeholder="you@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <Link href="#" className="text-xs text-blue-400/80 hover:text-blue-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  "Oi! Get Me In"
                )}
              </Button>
              <GoogleAuthButton />
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-gray-400 flex justify-center pb-10 pt-2">
            New here? 
            <Link href="/auth/signup" className="group text-blue-400 ml-2 hover:text-blue-300 transition-colors font-semibold inline-flex items-center">
               Join the crew 
               <motion.span
                 animate={{ x: [0, 4, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               >
                 <ArrowRight className="w-4 h-4 ml-1" />
               </motion.span>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

