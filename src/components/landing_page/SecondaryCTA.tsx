"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SecondaryCTA() {
  return (
    <section className="py-32 px-4 bg-gradient-to-t from-blue-900/10 to-transparent">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center -space-x-4 mb-8">
           {/* Mock Avatars */}
           {[1,2,3,4].map((i) => (
             <div key={i} className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center bg-gray-700 text-xs font-bold text-white relative z-${i * 10}`}>
                User
             </div>
           ))}
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold mb-8"
        >
          Ready to stop overpaying?
        </motion.h2>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
        >
          <Link href="/auth/signup">
            <Button className="h-14 px-10 text-lg rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xl shadow-blue-600/20">
              Yes, I'm In
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="mt-4 text-gray-400 text-sm">Join 2,000+ students on your campus.</p>
        </motion.div>
      </div>
    </section>
  );
}
