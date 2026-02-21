"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProfileAboutProps {
  initialAbout: string | null;
  isOwnProfile: boolean;
  userRole: string; // "STUDENT" | "ADMIN"
  createdAt: string;
}

export function ProfileAbout({ initialAbout, isOwnProfile, userRole, createdAt }: ProfileAboutProps) {
  const [about, setAbout] = useState(initialAbout || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ about }),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const activeSinceYear = new Date(createdAt).getFullYear();
  const defaultText = `${userRole === 'ADMIN' ? 'Admin' : 'Student'} at Campus. Active since ${activeSinceYear}. Member of the Oi! Lend Me community.`;

  return (
    <div className="glass-card rounded-xl p-8 relative group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-white text-xl font-bold">About</h3>
        {isOwnProfile && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil size={16} />
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <Textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className="bg-white/5 border-white/10 text-white min-h-[120px] focus:ring-blue-500"
            placeholder="Tell us about yourself..."
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAbout(initialAbout || "");
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
          {about || defaultText}
        </p>
      )}
    </div>
  );
}
