"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCustomerAuth } from "./CustomerAuthContext";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlistIds: string[]; // List of product IDs in the wishlist
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { customer, isAuthenticated, isLoading: authLoading } = useCustomerAuth();

  // Fetch wishlist when user logs in
  useEffect(() => {
    async function fetchWishlist() {
      if (!isAuthenticated && !authLoading) {
        setWishlistIds([]);
        setIsLoading(false);
        return;
      }

      if (authLoading || !customer) return;

      try {
        setIsLoading(true);
        const res = await fetch("/api/customers/wishlist");
        if (res.ok) {
          const data = await res.json();
          // Extract just the IDs from the populated wishlist or array of ObjectIds
          const ids = data.wishlist.map((item: any) => 
            typeof item === "string" ? item : item._id
          );
          setWishlistIds(ids);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWishlist();
  }, [customer, isAuthenticated, authLoading]);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!customer) {
      toast.error("Please sign in to save items to your wishlist.");
      return;
    }

    const currentlySaved = isInWishlist(productId);
    
    // Optimistic UI update
    if (currentlySaved) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
    } else {
      setWishlistIds((prev) => [...prev, productId]);
    }

    try {
      const res = await fetch("/api/customers/wishlist", {
        method: currentlySaved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        throw new Error("Failed to update wishlist");
      }
      
      const data = await res.json();
      if (!currentlySaved) {
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update wishlist. Please try again.");
      // Revert optimistic update
      if (currentlySaved) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, isLoading, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
