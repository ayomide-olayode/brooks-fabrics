"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { CartItem } from "@/context/CartContext";

interface UseStockCheckResult {
  checking: boolean;
  validate: (items: CartItem[]) => Promise<boolean>;
}

/**
 * Hook to validate cart items against current DB stock before checkout.
 * Returns { checking, validate } where validate(items) resolves to boolean.
 */
export function useStockCheck(): UseStockCheckResult {
  const [checking, setChecking] = useState(false);

  const validate = useCallback(async (items: CartItem[]): Promise<boolean> => {
    if (!items?.length) return true;

    setChecking(true);
    try {
      const res = await fetch("/api/stock-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (!data.valid) {
        data.errors.forEach((err: { message: string }) =>
          toast.error(err.message),
        );
        return false;
      }

      return true;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not validate stock. Please try again.";
      toast.error(message);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  return { checking, validate };
}
