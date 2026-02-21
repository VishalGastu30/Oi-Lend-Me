"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AddItemPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/home" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Cancel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 w-fit">
          List an Item
        </h1>
        <p className="text-gray-400 mt-2">Help a friend out. Earn campus karma.</p>
      </div>

      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Image Upload Placeholder */}
          <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
               <UploadCloud className="w-6 h-6 text-blue-400" />
            </div>
            <p className="font-medium text-gray-200">Click to upload image</p>
            <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Item Name</label>
            <Input placeholder="e.g. MacBook Pro Charger" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass">
              <option value="" disabled selected>Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Books">Books</option>
              <option value="Chargers">Chargers</option>
              <option value="Lab">Lab Equipment</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

           <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea 
               className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 glass"
               placeholder="Describe the condition, return policy, or specifics..."
            ></textarea>
          </div>

          <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold shadow-lg">
            Post Item
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
