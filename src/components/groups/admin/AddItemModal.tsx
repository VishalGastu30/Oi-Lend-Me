"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

export function AddItemModal({ isOpen, onClose, groupId, onSuccess }: AddItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    condition: "Good",
    imageUrl: "", 
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      const data = new FormData();
      data.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });
        const json = await res.json();
        if (res.ok) {
          setFormData({ ...formData, imageUrl: json.url });
        } else {
          alert("Upload failed");
        }
      } catch (err) {
        console.error(err);
        alert("Upload error");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/groups/${groupId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...formData,
            imageUrls: formData.imageUrl ? [formData.imageUrl] : []
        }),
      });

      if (!res.ok) throw new Error("Failed to add item");

      onSuccess();
      onClose();
      setFormData({ name: "", description: "", category: "", condition: "GOOD", imageUrl: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1A1F2E] border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g. Sony A7 III"
              className="bg-white/5 border-white/10 text-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
             <Select onValueChange={(val) => setFormData({...formData, category: val})} value={formData.category}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Lab">Lab Equipment</SelectItem>
                    <SelectItem value="Chargers">Chargers</SelectItem>
                    <SelectItem value="Class">Class Materials</SelectItem>
                    <SelectItem value="Misc">Miscellaneous</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
             <Select onValueChange={(val) => setFormData({...formData, condition: val})} value={formData.condition}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Fair">Fair</SelectItem>
                    <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Details about the item..."
              className="bg-white/5 border-white/10 text-white resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

           <div className="grid gap-2">
            <Label>Item Image</Label>
            {!formData.imageUrl ? (
                <div className="border-2 border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-colors cursor-pointer relative bg-white/5">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    {uploading ? (
                        <Loader2 className="animate-spin text-white/40" />
                    ) : (
                        <>
                            <Upload size={20} className="text-white/40" />
                            <span className="text-xs text-white/40">Click to upload</span>
                        </>
                    )}
                </div>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-white/10 group h-32 w-full">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: ""})}
                        className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/60 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={loading || uploading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
