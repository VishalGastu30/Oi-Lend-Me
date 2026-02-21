"use client";

import { Item } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Zap } from "lucide-react";
import Link from "next/link";

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const owner = item.owner;

  const statusVariant =
    item.status === "AVAILABLE"
      ? "success"
      : item.status === "BORROWED"
      ? "secondary"
      : "warning";

  return (
    <Card className="overflow-hidden group hover:border-blue-500/50 transition-colors duration-300">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-700">
            <Zap className="w-12 h-12 opacity-20" />
          </div>
        )}
        <Badge variant={statusVariant} className="absolute top-3 left-3 bg-opacity-90 backdrop-blur-sm">
          {item.status}
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
           <div>
             <p className="text-xs text-blue-400 font-medium tracking-wider uppercase mb-1">{item.category}</p>
             <h3 className="font-semibold text-lg leading-tight line-clamp-1">{item.name}</h3>
           </div>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-4">
            {item.description}
          </p>
        )}

        {/* Removed mock location and 'Recently' status as we don't have real data for them yet */}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-white/5 bg-white/5 backdrop-blur-sm">
        {owner ? (
          <Link href={`/profile/${owner.id}`} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
              {owner.name.charAt(0)}
            </div>
            <span className="text-xs text-gray-300 truncate max-w-[80px]">{owner.name}</span>
          </Link>
        ) : (
          <div className="text-xs text-gray-500">Unknown owner</div>
        )}
        
        <Link href={`/items/${item.id}`}>
            <Button size="sm" variant="ghost" className="text-xs hover:bg-blue-500/10 hover:text-blue-400">
               View Details
            </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
