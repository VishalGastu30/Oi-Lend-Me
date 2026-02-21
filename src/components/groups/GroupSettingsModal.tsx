"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    visibility?: string;
    category?: string;
  };
}

export function GroupSettingsModal({ isOpen, onClose, group }: GroupSettingsModalProps) {
  const [description, setDescription] = useState(group.description || "");
  const [imageUrl, setImageUrl] = useState(group.imageUrl || "");
  const [visibility, setVisibility] = useState(group.visibility || "PUBLIC");
  const [category, setCategory] = useState(group.category || "CLUB");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, imageUrl, visibility, category }),
      });

      if (!res.ok) throw new Error("Failed to update group");

      toast.success("Group settings updated");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-white">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="PRIVATE">Private</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label className="text-white">Category</Label>
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                    <SelectItem value="HOSTEL">Hostel</SelectItem>
                    <SelectItem value="CLUB">Club</SelectItem>
                    <SelectItem value="HOBBY">Hobby</SelectItem>
                    <SelectItem value="EVENT">Event</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image" className="text-white">Group Image URL</Label>
            <Input
              id="image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-32 resize-none"
              placeholder="Describe your group..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading} className="text-white/60 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
