"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, X, Check, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function GroupRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ name: string; type: string; url: string }[]>([]);

  const [formData, setFormData] = useState({
    groupName: "",
    category: "",
    shortDescription: "",
    facultyEmail: "",
    officialEmail: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Mock upload - in real app, upload to storage and get URL
      const mockUrl = `https://mock-storage.com/${file.name}`;
      setFiles([...files, { name: file.name, type: "DOCUMENT", url: mockUrl }]);
      toast.success("File uploaded successfully");
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/groups/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          proofs: files.map(f => ({ fileUrl: f.url, fileType: f.type })),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        // Response body not JSON
      }

      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit request");
      }

      toast.success("Request submitted successfully! Admins will review your proposal.");
      router.push("/groups");
    } catch (error: any) {
      console.error("Group request error:", error);
      toast.error(error.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] pt-24 px-4 pb-12 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl opacity-50" />
        </div>

      <motion.div 
        className="max-w-3xl mx-auto relative z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent mb-3">
            Establish Your Community
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
            Official groups are the heart of campus life. Submit your proposal for a new club, society, or department.
            </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">1</div>
                        <h2 className="text-xl font-semibold text-white/90">Core Information</h2>
                    </div>

                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="groupName" className="text-white/70">Group Name</Label>
                            <Input 
                                id="groupName" 
                                placeholder="e.g. Artificial Intelligence Society" 
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-blue-500/20 h-12 text-lg transition-all"
                                value={formData.groupName}
                                onChange={(e) => setFormData({...formData, groupName: e.target.value})}
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="category" className="text-white/70">Category</Label>
                                <Select onValueChange={(val) => setFormData({...formData, category: val})} value={formData.category}>
                                    <SelectTrigger className="bg-black/20 border-white/10 text-white h-12">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1A1F2E] border-white/10 text-white">
                                        <SelectItem value="ACADEMIC">Academic</SelectItem>
                                        <SelectItem value="HOSTEL">Hostel / Residence</SelectItem>
                                        <SelectItem value="CLUB">Club / Cultural</SelectItem>
                                        <SelectItem value="HOBBY">Hobby</SelectItem>
                                        <SelectItem value="EVENT">Event</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-white/70">Short Description</Label>
                            <Textarea 
                                id="description" 
                                placeholder="Briefly describe the purpose and goals of this group..." 
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 resize-none h-32 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all text-base container-field"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold border border-purple-500/30">2</div>
                        <h2 className="text-xl font-semibold text-white/90">Verification & Contact</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="facultyEmail" className="text-white/70">Faculty Email <span className="text-white/30 text-xs">(Optional)</span></Label>
                            <Input 
                                id="facultyEmail" 
                                type="email"
                                placeholder="faculty@university.edu" 
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-11"
                                value={formData.facultyEmail}
                                onChange={(e) => setFormData({...formData, facultyEmail: e.target.value})}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="officialEmail" className="text-white/70">Official Email <span className="text-white/30 text-xs">(Optional)</span></Label>
                            <Input 
                                id="officialEmail" 
                                type="email"
                                placeholder="club@university.edu" 
                                className="bg-black/20 border-white/10 text-white placeholder:text-white/20 h-11"
                                value={formData.officialEmail}
                                onChange={(e) => setFormData({...formData, officialEmail: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2 pt-2">
                        <Label className="text-white/70">Supporting Documents</Label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer relative bg-black/20 group">
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                onChange={handleFileChange}
                            />
                            <div className="p-4 bg-white/5 rounded-full text-white/50 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">
                                <Upload size={28} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white/80 font-medium group-hover:text-white transition-colors">Click to upload documents</p>
                                <p className="text-xs text-white/40 mt-1">Approval letters, posters, or proof of activity (Max 5MB)</p>
                            </div>
                        </div>

                        <AnimatePresence>
                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((file, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/20 rounded-md text-blue-400">
                                                    <FileText size={16} />
                                                </div>
                                                <span className="text-sm text-white/80 font-medium">{file.name}</span>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => removeFile(i)}
                                                className="text-white/40 hover:text-red-400 transition-colors p-1 hover:bg-white/5 rounded"
                                            >
                                                <X size={16} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4 flex justify-end gap-3 pb-20">
                <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-white/60 hover:text-white hover:bg-white/5"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-6 h-auto text-base font-semibold shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Group Proposal
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                    )}
                </Button>
            </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
