"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X, ShieldCheck, Loader2, Camera, Users, Package, Key, FileText, Handshake, ChevronRight, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Types
type Group = {
  id: string;
  name: string;
};


function LendItemForm() {
    const router = useRouter();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const repostId = searchParams.get('repost');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<Group[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
  
    // Form State
    const [formData, setFormData] = useState({
      name: "",
      category: "",
      description: "",
      images: [] as File[],
      imageUrl: "", // Legacy
      ownerType: "personal" as "personal" | "group",
      groupId: "",
      availability: "now",
      conditionNote: "",
      lendingperiod: "flexible",
      acceptTerms: false,
      conditionVerified: false,
    });
  
    // Fetch groups on mount
    useEffect(() => {
      async function fetchGroups() {
        try {
          const res = await fetch("/api/groups");
          if (res.ok) {
            const data = await res.json();
            setGroups(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch groups", err);
        }
      }
      fetchGroups();
    }, []);
  
    // Fetch Repost Data
    useEffect(() => {
        if (!repostId) return;

        async function fetchOriginalItem() {
            setLoading(true);
            try {
                const res = await fetch(`/api/items/${repostId}`);
                if (res.ok) {
                    const json = await res.json();
                    const item = json.data;
                    
                    // Pre-fill form
                    setFormData(prev => ({
                        ...prev,
                        name: item.name,
                        category: item.category,
                        description: item.description || "",
                        ownerType: item.groupId ? "group" : "personal",
                        groupId: item.groupId || "",
                        conditionNote: item.condition || "", 
                        lendingperiod: item.maxLendingDays ? "fixed" : "flexible",
                    }));
                }
            } catch (e) {
                console.error("Failed to fetch original item", e);
            } finally {
                setLoading(false);
            }
        }
        fetchOriginalItem();
    }, [repostId]);


  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ 
        ...prev, 
        images: [...prev.images, ...newFiles],
        imageUrl: URL.createObjectURL(newFiles[0]) 
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = "Item name is required";
      if (!formData.category) newErrors.category = "Category is required";
      if (!formData.description.trim()) newErrors.description = "Description is required";
    }

    if (currentStep === 2) {
      if (formData.images.length === 0) newErrors.images = "At least one image is required";
    }

    if (currentStep === 3) {
      if (formData.ownerType === "group" && !formData.groupId) {
        newErrors.groupId = "Please select a group";
      }
    }
    
    if (currentStep === 5) {
       if (!formData.conditionVerified) newErrors.conditionVerified = "Please confirm the condition";
       if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept the terms";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      if (formData.ownerType === "group" && formData.groupId) {
        formDataToSend.append("groupId", formData.groupId);
      }
      
      if (formData.conditionNote) formDataToSend.append("condition", formData.conditionNote);
      if (formData.lendingperiod === 'fixed') formDataToSend.append("maxLendingDays", "7");
      
      formData.images.forEach((file) => {
        formDataToSend.append("images", file);
      });

      const res = await fetch("/api/items", {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/items/${data.data.id}`);
      } else {
        const errData = await res.json();
        toast({
          title: "Creation Failed",
          description: errData.error || "Unknown error",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Submission failed", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { title: "Basics", icon: Package },
    { title: "Photos", icon: Camera },
    { title: "Ownership", icon: Key },
    { title: "Rules", icon: FileText },
    { title: "Trust", icon: Handshake },
  ];

  const stepTransition: any = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    })
  };

  const [direction, setDirection] = useState(0);

  const setStepWithDirection = (newStep: number) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  return (
    <div className="bg-[#0B0F1A] text-gray-200 pb-20 px-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Navigation */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
        >
          <Button 
            variant="ghost" 
            onClick={() => router.back()} 
            className="group text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl px-6 h-12 font-bold transition-all"
          >
            <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" /> 
            Back to Explore
          </Button>

          <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            {stepsList.map((s, i) => {
                const Icon = s.icon;
                const isActive = i + 1 === step;
                const isCompleted = i + 1 < step;
                return (
                    <div 
                        key={i} 
                        className={cn(
                            "relative size-12 rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden",
                            isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : 
                            isCompleted ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-gray-600"
                        )}
                    >
                        <Icon size={18} className={cn(isActive && "scale-110")} />
                        {isActive && (
                            <motion.div 
                                layoutId="step-glow"
                                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                        )}
                    </div>
                );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Content: Title & Context */}
            <div className="lg:col-span-4 space-y-6 pt-4">
                <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                >
                <Badge className="mb-4 bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                    Step {step} of 5
                </Badge>
                <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    {repostId ? "Finalize Your Repost" : "Share with Community"}
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                    {step === 1 && "Start with the basics. Give your item a clear name and description."}
                    {step === 2 && "A picture is worth a thousand words. High quality photos build trust."}
                    {step === 3 && "Is this yours or does it belong to a club? Choose the correct owner type."}
                    {step === 4 && "Set the ground rules for your item. How long and when can it be borrowed?"}
                    {step === 5 && "Final check! Certify your item and get ready to list."}
                </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600/5 to-transparent border border-white/5 hidden lg:block"
                >
                    <div className="size-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4">
                        <ShieldCheck size={20} />
                    </div>
                    <h4 className="text-white font-bold mb-2">Secure Lending</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        All items are tracked. You're in control of who borrows and for how long.
                    </p>
                </motion.div>
            </div>

            {/* Right Content: Form */}
            <div className="lg:col-span-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <Card className="bg-[#121726]/60 backdrop-blur-[32px] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                    <CardContent className="p-6 sm:p-10 flex-grow">
                        <AnimatePresence mode="wait" custom={direction}>
                        <motion.div 
                            key={step}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={stepTransition}
                            className="space-y-8"
                        >
                            {/* SECTION 1: BASICS */}
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Item Title</Label>
                                        <Input 
                                            placeholder="What are you lending?" 
                                            value={formData.name}
                                            onChange={(e) => handleChange("name", e.target.value)}
                                            className={cn(
                                                "h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-6 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700",
                                                errors.name && 'border-red-500/50 focus:ring-red-500/20'
                                            )}
                                        />
                                        {errors.name && <p className="text-xs font-bold text-red-500 pl-1">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Category</Label>
                                        <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                                            <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl px-6 text-lg font-bold hover:bg-white/10 transition-all">
                                                <SelectValue placeholder="Where does it belong?" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#121726]/95 backdrop-blur-2xl border-white/10 text-gray-200 rounded-2xl p-2 shadow-2xl">
                                                {["Electronics", "Books", "Lab", "Misc", "Chargers", "Class"].map(c => (
                                                    <SelectItem 
                                                        key={c} 
                                                        value={c}
                                                        className="h-12 rounded-xl focus:bg-blue-600 focus:text-white transition-colors font-bold cursor-pointer"
                                                    >
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category && <p className="text-xs font-bold text-red-500 pl-1">{errors.category}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Description</Label>
                                        <div className="relative group">
                                            <Textarea 
                                                placeholder="Describe its condition, quirks, and anything else the borrower should know..." 
                                                value={formData.description}
                                                onChange={(e) => handleChange("description", e.target.value)}
                                                maxLength={200}
                                                className="bg-white/5 border-white/10 rounded-2xl min-h-[160px] p-6 text-lg leading-relaxed focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 resize-none"
                                            />
                                            <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5 text-[10px] font-black text-gray-600 group-focus-within:text-blue-400 group-focus-within:border-blue-500/30 transition-all">
                                                {formData.description.length} / 200
                                            </div>
                                        </div>
                                        {errors.description && <p className="text-xs font-bold text-red-500 pl-1">{errors.description}</p>}
                                    </div>
                                </div>
                            )}

                            {/* SECTION 2: IMAGES */}
                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            multiple
                                            onChange={handleImageUpload}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="aspect-[2/1] bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center p-10 group-hover:bg-white/[0.07] group-hover:border-blue-500/50 transition-all duration-500">
                                            <motion.div 
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                className="size-20 rounded-3xl bg-blue-600/10 flex items-center justify-center mb-6 group-hover:bg-blue-600 text-blue-400 group-hover:text-white transition-all shadow-2xl"
                                            >
                                                <Upload size={32} />
                                            </motion.div>
                                            <h3 className="text-2xl font-black text-white mb-2">Capture the Details</h3>
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] text-center">Drag and drop or click to upload photos</p>
                                        </div>
                                    </div>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            {formData.images.map((file, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="relative group aspect-square rounded-3xl overflow-hidden border border-white/5 shadow-2xl"
                                                >
                                                    <img src={URL.createObjectURL(file)} alt={`Preview ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                            className="size-12 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                        >
                                                            <X size={20} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.images && <p className="text-xs font-bold text-red-500 text-center uppercase tracking-widest">{errors.images}</p>}
                                </div>
                            )}

                            {/* SECTION 3: OWNERSHIP */}
                            {step === 3 && (
                                <div className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <motion.button 
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleChange("ownerType", "personal")}
                                            className={cn(
                                                "relative p-6 sm:p-8 rounded-[2.5rem] border text-left transition-all overflow-hidden group/btn",
                                                formData.ownerType === 'personal' ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                                                formData.ownerType === 'personal' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'
                                            )}>
                                                <Package size={24} />
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2">Personal</h4>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                                This item belongs to you and will appear on your public profile.
                                            </p>
                                        </motion.button>

                                        <motion.button 
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleChange("ownerType", "group")}
                                            className={cn(
                                                "relative p-6 sm:p-8 rounded-[2.5rem] border text-left transition-all overflow-hidden group/btn",
                                                formData.ownerType === 'group' ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10' : 'bg-white/5 border-white/5 hover:border-white/10'
                                            )}
                                        >
                                            <div className={cn(
                                                "size-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                                                formData.ownerType === 'group' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'
                                            )}>
                                                <Users size={24} />
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2">A Group</h4>
                                            <p className="text-sm text-gray-400 font-medium leading-relaxed">
                                                List this on behalf of a club or research group you manage.
                                            </p>
                                        </motion.button>
                                    </div>

                                    <AnimatePresence>
                                        {formData.ownerType === 'group' && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-4 pt-4 border-t border-white/5 overflow-hidden"
                                            >
                                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Select Active Group</Label>
                                                <Select value={formData.groupId} onValueChange={(val) => handleChange("groupId", val)}>
                                                    <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl px-6 text-lg font-bold hover:bg-white/10 transition-all">
                                                        <SelectValue placeholder="Which circle owns this?" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#121726]/95 backdrop-blur-2xl border-white/10 text-gray-200 rounded-2xl p-2 shadow-2xl">
                                                        {groups.map(g => (
                                                            <SelectItem 
                                                                key={g.id} 
                                                                value={g.id}
                                                                className="h-12 rounded-xl focus:bg-blue-600 focus:text-white transition-colors font-bold cursor-pointer"
                                                            >
                                                                {g.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {groups.length === 0 && <p className="text-xs font-bold text-yellow-500 pl-1 uppercase tracking-tighter">You are not a verified member of any groups.</p>}
                                                {errors.groupId && <p className="text-xs font-bold text-red-500 pl-1 uppercase tracking-tighter">{errors.groupId}</p>}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* SECTION 4: RULES */}
                            {step === 4 && (
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Lending Strategy</Label>
                                        <div className="flex gap-4">
                                            {['flexible', 'fixed'].map((mode) => (
                                                <motion.button
                                                    key={mode}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleChange("lendingperiod", mode)}
                                                    className={cn(
                                                        "flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-widest border transition-all",
                                                        formData.lendingperiod === mode 
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' 
                                                            : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'
                                                    )}
                                                >
                                                    {mode === 'flexible' ? 'Flexible Duration' : '7 Day Maximum'}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-between group">
                                        <div>
                                            <h4 className="text-white font-bold mb-1">Immediate Availability</h4>
                                            <p className="text-sm text-gray-500 font-medium">Allow requests as soon as you list.</p>
                                        </div>
                                        <Switch 
                                            checked={formData.availability === 'now'}
                                            onCheckedChange={(c) => handleChange("availability", c ? 'now' : 'later')}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">Return Requirements</Label>
                                        <Input 
                                            placeholder="e.g. Return cleaned, battery fully charged" 
                                            value={formData.conditionNote}
                                            onChange={(e) => handleChange("conditionNote", e.target.value)}
                                            className="h-16 bg-white/5 border-white/10 rounded-2xl px-6 text-lg font-bold placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* SECTION 5: TRUST */}
                            {step === 5 && (
                                <div className="space-y-10">
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-blue-600/10 border border-blue-500/20 p-6 sm:p-8 rounded-[2rem] flex gap-4 sm:gap-6"
                                    >
                                        <div className="size-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xl">
                                            <ShieldCheck size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Trust Protocol</h4>
                                            <p className="text-sm text-blue-200/60 font-medium leading-relaxed">
                                                By listing this item, you agree to respond to requests within 24 hours. Reliable lending increases your Karma and standing in the community.
                                            </p>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-4">
                                        <motion.button 
                                            whileHover={{ x: 4 }}
                                            onClick={() => handleChange("conditionVerified", !formData.conditionVerified)}
                                            className="w-full flex items-center space-x-6 p-6 rounded-[1.5rem] bg-white/5 hover:bg-white/[0.08] transition-all text-left group"
                                        >
                                            <div className={cn(
                                                "size-8 rounded-lg border-2 flex items-center justify-center transition-all",
                                                formData.conditionVerified ? "bg-blue-600 border-blue-600" : "border-white/10"
                                            )}>
                                                {formData.conditionVerified && <ShieldCheck size={16} className="text-white" />}
                                            </div>
                                            <span className="text-white font-bold text-lg">I certify this item is fully functional.</span>
                                        </motion.button>
                                        {errors.conditionVerified && <p className="text-xs font-bold text-red-500 pl-14 uppercase tracking-tighter">{errors.conditionVerified}</p>}

                                        <motion.button 
                                            whileHover={{ x: 4 }}
                                            onClick={() => handleChange("acceptTerms", !formData.acceptTerms)}
                                            className="w-full flex items-center space-x-6 p-6 rounded-[1.5rem] bg-white/5 hover:bg-white/[0.08] transition-all text-left group"
                                        >
                                            <div className={cn(
                                                "size-8 rounded-lg border-2 flex items-center justify-center transition-all",
                                                formData.acceptTerms ? "bg-blue-600 border-blue-600 group-active:scale-90" : "border-white/10"
                                            )}>
                                                {formData.acceptTerms && <ShieldCheck size={16} className="text-white" />}
                                            </div>
                                            <span className="text-white font-bold text-lg">I accept the community guidelines.</span>
                                        </motion.button>
                                        {errors.acceptTerms && <p className="text-xs font-bold text-red-500 pl-14 uppercase tracking-tighter">{errors.acceptTerms}</p>}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                        </AnimatePresence>
                    </CardContent>

                    {/* Footer Actions */}
                    <div className="p-6 sm:p-8 pt-0 sm:pt-0 flex justify-between items-center bg-transparent">
                        <AnimatePresence>
                            {step > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                >
                                    <Button 
                                        onClick={handleBack} 
                                        variant="outline" 
                                        className="h-14 px-8 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Back
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-grow" />

                        {step < 5 ? (
                            <Button 
                                onClick={handleNext} 
                                className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Continue
                                <ChevronRight className="ml-2 w-4 h-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleSubmit} 
                                disabled={loading} 
                                className="h-16 px-6 sm:px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all min-w-[200px]"
                            >
                                {loading ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-3">
                                        {repostId ? "Confirm Repost" : "Publish to Community"}
                                        <Zap size={18} fill="currentColor" />
                                    </span>
                                )}
                            </Button>
                        )}
                    </div>
                    </Card>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default function LendItemPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-[calc(100vh-6rem)]"><Loader2 className="animate-spin text-blue-500" /></div>}>
            <LendItemForm />
        </Suspense>
    );
}
