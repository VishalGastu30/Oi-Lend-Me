"use client";

import { usePresence } from "@/hooks/usePresence";

export function PresenceListener() {
  usePresence();
  return null;
}
