import { Navbar } from "@/components/layouts/Navbar";
import { EnforcementBarrier } from "@/components/auth/EnforcementBarrier";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EnforcementBarrier>
      <Navbar />
      {/* Ambient Background Glow for Users Only */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 opacity-50 pointer-events-none" />
       <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />
      <div className="pt-24 min-h-screen relative">{children}</div>
    </EnforcementBarrier>
  );
}
