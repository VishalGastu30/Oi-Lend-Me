"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Lock, Mail, Rocket } from "lucide-react";
import Link from "next/link";

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
           <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
             Oi! Join the smartest lending <br/> network on campus. 🚀
           </h1>
           <p className="text-blue-400/80 font-medium">Verified student community only.</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
           <div className="flex justify-between text-xs font-semibold uppercase tracking-wider mb-2">
             <span className="text-white flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">1</span> 
               Step 1: Verification
             </span>
             <span className="text-gray-500">33%</span>
           </div>
           <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
             <div className="h-full w-1/3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
           </div>
           <p className="text-xs text-gray-500 mt-2">Almost there! Just need your campus email.</p>
        </div>

        {/* Main Card */}
        <Card className="border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-2">
               <h2 className="text-xl font-semibold">Create Your Account</h2>
               <p className="text-sm text-gray-400">Join thousands of students sharing tools, tech, and textbooks.</p>
            </div>

            <div className="space-y-5">
               <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-300 uppercase tracking-wide ml-1">Campus Email</label>
                   <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <Input 
                        placeholder="yourname@university.edu" 
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      />
                   </div>
                   <p className="text-[10px] text-gray-500 ml-1">We only accept official .edu or university-affiliated emails for safety.</p>
               </div>

               <div className="space-y-1.5">
                   <label className="text-xs font-bold text-gray-300 uppercase tracking-wide ml-1">Set a Secret Password</label>
                   <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                      <Input 
                        type="password"
                        placeholder="Minimum 8 characters" 
                        className="pl-10 h-12 bg-white/5 border-white/10 focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                      />
                   </div>
               </div>
            </div>

            <Button className="w-full h-12 text-base font-semibold bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all">
               Verify Email & Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0b0e14] px-2 text-gray-500 font-bold tracking-widest">Or Social Sign Up</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Button variant="outline" className="h-11 border-white/10 hover:bg-white/5 bg-transparent font-medium text-gray-300">
                  Google
               </Button>
               <Button variant="outline" className="h-11 border-white/10 hover:bg-white/5 bg-transparent font-medium text-gray-300">
                  Apple
               </Button>
            </div>

          </CardContent>
        </Card>

        {/* Footer Logos */}
        <div className="text-center pt-8 opacity-60">
           <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Trusted by students at</p>
           <div className="flex justify-center gap-8 text-gray-400 text-xs font-semibold">
              <span className="flex items-center gap-1"><span className="text-lg">🎓</span> Stanford</span>
              <span className="flex items-center gap-1"><span className="text-lg">🏛️</span> MIT</span>
              <span className="flex items-center gap-1"><span className="text-lg">🏰</span> Harvard</span>
              <span className="flex items-center gap-1"><span className="text-lg">🦁</span> Oxford</span>
           </div>
        </div>

      </div>
    </div>
  );
}
