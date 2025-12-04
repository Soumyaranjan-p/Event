"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function SyncUser() {
  const { isSignedIn } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!isSignedIn) return;
    storeUser(); // Sync Clerk user to Convex
  }, [isSignedIn, storeUser]);

  return null;
}
