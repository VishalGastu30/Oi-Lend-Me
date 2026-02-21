"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

interface ProfileEditModalProps {
  user: User;
}

export function ProfileEditModal({ user }: ProfileEditModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
      try {
          setLoading(true);
          const res = await fetch('/api/me', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, role, avatarUrl })
          });
          
          if (res.ok) {
              setOpen(false);
              router.refresh(); // Refresh server components
              // Force full reload if needed to update client cache effectively
               window.location.reload();
          }
      } catch (e) {
          console.error("Failed to update profile", e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-white/5 hover:bg-white/10 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-all border border-white/10">
            <Pencil className="mr-2 size-4" /> Edit Profile
        </button>
      </DialogTrigger>
      <DialogContent className="bg-[#1b2431] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input 
                id="name" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="col-span-3 bg-white/5 border-white/10 text-white" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Status/Role
            </Label>
            <Input 
                id="role" 
                value={role} 
                onChange={e => setRole(e.target.value)} 
                className="col-span-3 bg-white/5 border-white/10 text-white" 
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              Avatar URL
            </Label>
             <Input 
                id="avatar" 
                value={avatarUrl} 
                onChange={e => setAvatarUrl(e.target.value)} 
                className="col-span-3 bg-white/5 border-white/10 text-white" 
                placeholder="https://..."
             />
          </div>
        </div>
        <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-white hover:text-white/80">Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-[#4F9DFF] text-white hover:bg-[#4F9DFF]/90">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Save Changes"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
