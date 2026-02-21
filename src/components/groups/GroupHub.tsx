"use client";

import { useState } from "react";
import { GroupSidebar } from "./GroupSidebar";
import { GroupHeader } from "./GroupHeader";
import { GroupInventory } from "./GroupInventory";

export function GroupHub() {
  const [activeView, setActiveView] = useState("inventory");

  // Mock group data for UI development/preview
  const group = {
    id: "mock-group-id",
    name: "Photography Club",
    description: "The best place for campus photographers to share gear and tips.",
    imageUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80",
    memberCount: 24,
    itemCount: 12,
    isVerified: true
  };

  return (
    <div className="max-w-[1440px] mx-auto flex gap-6 p-6">
        <GroupSidebar 
          groupName={group.name} 
          activeView={activeView} 
          onViewChange={setActiveView} 
          isAdmin={true} 
        />
        <div className="flex-1 space-y-6">
            <GroupHeader 
              group={group} 
              isMember={true} 
              onJoin={() => {}} 
            />
            <GroupInventory 
              items={[]} 
              isAdmin={true} 
              onAddItem={() => {}} 
            />
        </div>
    </div>
  );
}
