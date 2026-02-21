"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ItemCard, ItemCardProps } from "./ItemCard";
import { RequirementCard } from "@/components/requirements/RequirementCard";
import { RespondToRequirementModal } from "@/components/requirements/RespondToRequirementModal";
import { Sidebar } from "./Sidebar";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search as SearchIcon, X, Package, MessageSquarePlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "items" | "requests";

export function BrowseItems() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || "items");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const [items, setItems] = useState<ItemCardProps[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [respondModal, setRespondModal] = useState<{ isOpen: boolean; requirement: any | null }>({
    isOpen: false,
    requirement: null,
  });

  // Fetch current user
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.data?.id || null);
        }
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    }
    fetchUser();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === "items") {
        if (searchQuery.trim()) {
          performItemSearch(searchQuery, page);
        } else {
          fetchItems(page);
        }
      } else {
        fetchRequirements(page);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, category, page, activeTab]);

  async function fetchItems(currentPage: number = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "All Items") params.append("category", category);
      params.append("status", "AVAILABLE");
      params.append("page", currentPage.toString());
      params.append("limit", "3");

      const res = await fetch(`/api/items?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data && Array.isArray(data.data.items)) {
          setItems(data.data.items);
          setTotalPages(data.data.pagination?.totalPages || 1);
        } else if (Array.isArray(data)) {
          setItems(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch items", e);
    } finally {
      setLoading(false);
    }
  }

  async function performItemSearch(query: string, currentPage: number = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("q", query);
      if (category !== "All Items") params.append("category", category);
      params.append("status", "AVAILABLE");
      params.append("page", currentPage.toString());
      params.append("limit", "3");

      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setItems(data.data.items || []);
          setTotalPages(data.data.pagination?.totalPages || 1);
        }
      }
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequirements(currentPage: number = 1) {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("status", "OPEN");
      if (category !== "All Items") params.append("category", category);
      params.append("page", currentPage.toString());
      params.append("limit", "3");

      const res = await fetch(`/api/requirements?${params}`);
      if (res.ok) {
        const data = await res.json();
        setRequirements(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error("Failed to fetch requirements", e);
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  const handleRespond = (requirementId: string) => {
    const req = requirements.find((r) => r.id === requirementId);
    if (req) {
      setRespondModal({ isOpen: true, requirement: req });
    }
  };

  return (
    <>
      <div className="flex max-w-[1400px] mx-auto w-full px-6 lg:px-20 py-8 gap-10">
        <Sidebar
          activeCategory={category}
          onCategoryChange={(cat) => {
            setCategory(cat);
            setPage(1);
          }}
        />

        <section className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {activeTab === "items" ? "Available for Borrowing" : "Campus Requests"}
                </h1>
                <p className="text-gray-400 mt-1">
                  {activeTab === "items"
                    ? "Discover what your fellow students are sharing today."
                    : "See what your peers need and help them out."}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 bg-white/5 p-2 rounded-2xl border border-white/5 w-fit">
              <button
                onClick={() => handleTabChange("items")}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                  activeTab === "items"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Package size={18} />
                Items
              </button>
              <button
                onClick={() => handleTabChange("requests")}
                className={cn(
                  "px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2",
                  activeTab === "requests"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <MessageSquarePlus size={18} />
                Requests
              </button>
            </div>

            {/* Search Bar (Items only) */}
            {activeTab === "items" && (
              <div className="relative group/search">
                <motion.div
                  initial={false}
                  animate={{
                    borderColor: searchQuery ? "rgba(79, 157, 255, 0.4)" : "rgba(255, 255, 255, 0.1)",
                    backgroundColor: searchQuery ? "rgba(18, 23, 38, 0.8)" : "rgba(255, 255, 255, 0.03)",
                  }}
                  className="flex items-center backdrop-blur-xl border rounded-2xl px-5 py-4 transition-all duration-300 shadow-lg focus-within:shadow-blue-500/10 focus-within:border-blue-500/50"
                >
                  <SearchIcon className="text-gray-500 mr-4 transition-colors group-focus-within/search:text-blue-400" size={22} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="What are you looking for today? (e.g., 'MacBook', 'Guitar')..."
                    className="bg-transparent border-none focus:outline-none text-base text-white placeholder:text-gray-600 w-full font-medium"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => {
                          setSearchQuery("");
                          setPage(1);
                        }}
                        className="text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-all"
                      >
                        <X size={16} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-20 flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="size-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
                  />
                  <p className="text-gray-500 text-sm animate-pulse">
                    {activeTab === "items" ? "Scanning the vault..." : "Loading requests..."}
                  </p>
                </div>
              ) : activeTab === "items" ? (
                items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/5"
                  >
                    <p className="text-gray-400 text-lg mb-4">
                      {searchQuery ? `No results found for "${searchQuery}"` : "No items available yet"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {searchQuery ? "Try a different search term" : "Be the first to list an item!"}
                    </p>
                  </motion.div>
                ) : (
                  items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ItemCard {...item} />
                    </motion.div>
                  ))
                )
              ) : requirements.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/5"
                >
                  <p className="text-gray-400 text-lg mb-4">No open requests yet</p>
                  <p className="text-gray-500 text-sm">Be the first to ask the campus for what you need!</p>
                </motion.div>
              ) : (
                requirements.map((req, index) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <RequirementCard
                    requirement={req}
                    onRespond={handleRespond}
                    currentUserId={currentUserId || undefined}
                  />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="size-10 flex items-center justify-center rounded-xl glass-card text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
              >
                <ChevronsLeft size={18} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="size-10 flex items-center justify-center rounded-xl glass-card text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Page Numbers Window */}
              <div className="flex gap-2 mx-2">
                {(() => {
                  // Logic: Show window of 5 pages centered if possible, otherwise shift
                  let startPage = Math.max(1, page - 2);
                  let endPage = Math.min(totalPages, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`size-10 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-300 ${
                        page === pageNum 
                          ? "bg-[#4F9DFF] text-white shadow-lg shadow-blue-500/25 scale-110" 
                          : "glass-card text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ));
                })()}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="size-10 flex items-center justify-center rounded-xl glass-card text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
              >
                <ChevronRight size={18} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="size-10 flex items-center justify-center rounded-xl glass-card text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Respond Modal */}
      {respondModal.requirement && (
        <RespondToRequirementModal
          isOpen={respondModal.isOpen}
          onClose={() => setRespondModal({ isOpen: false, requirement: null })}
          requirement={respondModal.requirement}
          onSuccess={() => {
            fetchRequirements(page);
          }}
        />
      )}
    </>
  );
}
