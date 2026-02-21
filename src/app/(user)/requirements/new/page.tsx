"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Zap, Users, Globe, Loader2, ChevronRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TimePicker } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";

type Group = {
  id: string;
  name: string;
};

export default function AskCampusPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    urgency: "NORMAL" as "NORMAL" | "URGENT",
    description: "",
    visibility: "CAMPUS" as "CAMPUS" | "GROUP",
    groupId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch groups
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

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (formData.title.length < 5) newErrors.title = "Title must be at least 5 characters";
      if (!formData.category) newErrors.category = "Category is required";
    }

    if (currentStep === 2) {
      if (!formData.startDate) newErrors.durationStart = "Start date is required";
      if (!formData.startTime) newErrors.durationStart = "Start time is required";
      if (!formData.endDate) newErrors.durationEnd = "End date is required";
      if (!formData.endTime) newErrors.durationEnd = "End time is required";

      if (formData.startDate && formData.startTime && formData.endDate && formData.endTime) {
        const start = new Date(`${formData.startDate}T${formData.startTime}`);
        const end = new Date(`${formData.endDate}T${formData.endTime}`);
        if (end <= start) {
          newErrors.durationEnd = "End must be after start";
        }
      }
    }

    if (currentStep === 3) {
      if (formData.visibility === "GROUP" && !formData.groupId) {
        newErrors.groupId = "Please select a group";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          durationStart: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
          durationEnd: new Date(`${formData.endDate}T${formData.endTime}`).toISOString(),
          urgency: formData.urgency,
          description: formData.description || undefined,
          visibility: formData.visibility,
          groupId: formData.visibility === "GROUP" ? formData.groupId : undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast({
          title: "Request Posted!",
          description: "Your requirement has been shared with the campus.",
        });
        router.push(`/home?tab=requests`);
      } else {
        const errData = await res.json();
        toast({
          title: "Failed to Post",
          description: errData.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Submission failed", err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [direction, setDirection] = useState(0);
  const stepTransition: any = { duration: 0.5, ease: [0.22, 1, 0.36, 1] };
  const stepVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 }),
  };

  return (
    <div className="bg-[#0B0F1A] text-gray-200 pb-20 px-6 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
            Back
          </Button>

          <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center font-black text-sm transition-all duration-500",
                  s === step
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : s < step
                    ? "bg-blue-600/20 text-blue-400"
                    : "bg-white/5 text-gray-600"
                )}
              >
                {s}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Context */}
          <div className="lg:col-span-4 space-y-6 pt-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <Badge className="mb-4 bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-[10px]">
                Step {step} of 3
              </Badge>
              <h1 className="text-5xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Ask the Campus
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed font-medium">
                {step === 1 && "Tell us what you need. Be specific to get better responses."}
                {step === 2 && "When do you need it? Set your timeline."}
                {step === 3 && "Choose who can see your request and add any extra details."}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-600/5 to-transparent border border-white/5 hidden lg:block"
            >
              <div className="size-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 mb-4">
                <Users size={20} />
              </div>
              <h4 className="text-white font-bold mb-2">Community Powered</h4>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Your peers will see your request and can offer to lend you what you need.
              </p>
            </motion.div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <Card className="bg-[#121726]/60 backdrop-blur-[32px] border-white/10 rounded-[3rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
                <CardContent className="p-10 flex-grow">
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
                      {/* STEP 1: What & Category */}
                      {step === 1 && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                              What do you need?
                            </Label>
                            <Input
                              placeholder="e.g. DSLR camera for 2 days"
                              value={formData.title}
                              onChange={(e) => handleChange("title", e.target.value)}
                              className={cn(
                                "h-16 bg-white/5 border-white/10 rounded-2xl text-xl font-bold px-6 focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700",
                                errors.title && "border-red-500/50 focus:ring-red-500/20"
                              )}
                            />
                            {errors.title && <p className="text-xs font-bold text-red-500 pl-1">{errors.title}</p>}
                          </div>

                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                              Category
                            </Label>
                            <Select value={formData.category} onValueChange={(val) => handleChange("category", val)}>
                              <SelectTrigger className="h-16 bg-white/5 border-white/10 rounded-2xl px-6 text-lg font-bold hover:bg-white/10 transition-all">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#121726]/95 backdrop-blur-2xl border-white/10 text-gray-200 rounded-2xl p-2 shadow-2xl">
                                {["Electronics", "Books", "Lab", "Misc", "Chargers", "Class"].map((c) => (
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
                        </div>
                      )}

                      {/* STEP 2: Duration & Urgency */}
                      {step === 2 && (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start */}
                            <div className="space-y-4">
                              <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                                Start Date & Time
                              </Label>
                              <div className="grid grid-cols-1 gap-3">
                                <Input
                                  type="date"
                                  value={formData.startDate}
                                  onChange={(e) => handleChange("startDate", e.target.value)}
                                  className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 font-bold w-full"
                                />
                                <TimePicker
                                  value={formData.startTime}
                                  onChange={(val) => handleChange("startTime", val)}
                                  className="h-14 w-full"
                                />
                              </div>
                              {errors.durationStart && (
                                <p className="text-xs font-bold text-red-500 pl-1">{errors.durationStart}</p>
                              )}
                            </div>

                            {/* End */}
                            <div className="space-y-4">
                              <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                                End Date & Time
                              </Label>
                              <div className="grid grid-cols-1 gap-3">
                                <Input
                                  type="date"
                                  value={formData.endDate}
                                  onChange={(e) => handleChange("endDate", e.target.value)}
                                  className="h-14 bg-white/5 border-white/10 rounded-2xl px-4 font-bold w-full"
                                />
                                <TimePicker
                                  value={formData.endTime}
                                  onChange={(val) => handleChange("endTime", val)}
                                  className="h-14 w-full"
                                />
                              </div>
                              {errors.durationEnd && (
                                <p className="text-xs font-bold text-red-500 pl-1">{errors.durationEnd}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                              Urgency
                            </Label>
                            <div className="flex gap-4">
                              {["NORMAL", "URGENT"].map((mode) => (
                                <motion.button
                                  key={mode}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleChange("urgency", mode)}
                                  className={cn(
                                    "flex-1 h-14 rounded-2xl text-sm font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2",
                                    formData.urgency === mode
                                      ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20"
                                      : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                                  )}
                                >
                                  {mode === "URGENT" && <AlertCircle size={18} />}
                                  {mode}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Details & Visibility */}
                      {step === 3 && (
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                              Additional Details (Optional)
                            </Label>
                            <Textarea
                              placeholder="Any specific requirements or preferences..."
                              value={formData.description}
                              onChange={(e) => handleChange("description", e.target.value)}
                              maxLength={500}
                              className="bg-white/5 border-white/10 rounded-2xl min-h-[120px] p-6 text-lg leading-relaxed focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-700 resize-none"
                            />
                          </div>

                          <div className="space-y-4">
                            <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                              Who can see this?
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                              <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChange("visibility", "CAMPUS")}
                                className={cn(
                                  "p-6 rounded-[2rem] border text-left transition-all",
                                  formData.visibility === "CAMPUS"
                                    ? "bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                              >
                                <Globe size={24} className="mb-4 text-blue-400" />
                                <h4 className="text-lg font-black text-white mb-1">Campus-wide</h4>
                                <p className="text-xs text-gray-400 font-medium">Everyone can see</p>
                              </motion.button>

                              <motion.button
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChange("visibility", "GROUP")}
                                className={cn(
                                  "p-6 rounded-[2rem] border text-left transition-all",
                                  formData.visibility === "GROUP"
                                    ? "bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-500/10"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                )}
                              >
                                <Users size={24} className="mb-4 text-blue-400" />
                                <h4 className="text-lg font-black text-white mb-1">Group Only</h4>
                                <p className="text-xs text-gray-400 font-medium">Members only</p>
                              </motion.button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {formData.visibility === "GROUP" && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 overflow-hidden"
                              >
                                <Label className="text-xs font-black uppercase tracking-widest text-gray-500 pl-1">
                                  Select Group
                                </Label>
                                <Select value={formData.groupId} onValueChange={(val) => handleChange("groupId", val)}>
                                  <SelectTrigger className="h-14 bg-white/5 border-white/10 rounded-2xl px-6 text-lg font-bold hover:bg-white/10 transition-all">
                                    <SelectValue placeholder="Choose a group" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#121726]/95 backdrop-blur-2xl border-white/10 text-gray-200 rounded-2xl p-2 shadow-2xl">
                                    {groups.map((g) => (
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
                                {groups.length === 0 && (
                                  <p className="text-xs font-bold text-yellow-500 pl-1 uppercase tracking-tighter">
                                    You are not a member of any groups.
                                  </p>
                                )}
                                {errors.groupId && (
                                  <p className="text-xs font-bold text-red-500 pl-1 uppercase tracking-tighter">
                                    {errors.groupId}
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                {/* Footer Actions */}
                <div className="p-8 pt-0 flex justify-between items-center">
                  <AnimatePresence>
                    {step > 1 && (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
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

                  {step < 3 ? (
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
                      className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-all min-w-[200px]"
                    >
                      {loading ? (
                        <Loader2 className="size-6 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-3">
                          Post Request
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
