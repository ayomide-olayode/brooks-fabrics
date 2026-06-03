"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
} from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image: string;
  slug: string;
}

export interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: "HYDRATE"; payload: CartState }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "CLEAR" };

interface CartContextValue {
  cart: CartState;
  dispatch: Dispatch<CartAction>;
  cartCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = "brooks_cart";

// ── Reducer ──────────────────────────────────────────────────────────────────

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_ITEM": {
      const { item } = action;
      const existing = state.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.productId === item.productId
              ? {
                  ...i,
                  quantity: Math.min(i.quantity + item.quantity, item.stock),
                }
              : i,
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, { ...item }],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.productId !== action.productId),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };

    // Both CLEAR and CLEAR_CART are handled — fixes the missing CLEAR_CART bug
    case "CLEAR":
    case "CLEAR_CART":
      return { items: [] };

    default:
      return state;
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const { isAuthenticated } = useCustomerAuth();
  const [synced, setSynced] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_KEY);
      if (saved) {
        dispatch({ type: "HYDRATE", payload: JSON.parse(saved) as CartState });
      }
    } catch {}
  }, []);

  // Sync with server on login
  useEffect(() => {
    if (isAuthenticated && !synced) {
      async function syncCart() {
        try {
          const res = await fetch("/api/customers/cart");
          if (res.ok) {
            const data = await res.json();
            const serverItems: CartItem[] = data.items || [];
            
            // Merge with local state
            const merged = [...state.items];
            let changed = false;

            for (const sItem of serverItems) {
              const existing = merged.find(i => i.productId === sItem.productId);
              if (existing) {
                // If it exists locally, combine quantities (capped at stock)
                const newQ = Math.min(existing.quantity + sItem.quantity, existing.stock);
                if (existing.quantity !== newQ) {
                  existing.quantity = newQ;
                  changed = true;
                }
              } else {
                merged.push(sItem);
                changed = true;
              }
            }
            
            if (changed || serverItems.length === 0) {
              dispatch({ type: "HYDRATE", payload: { items: merged } });
            }
            
            setSynced(true);
            
            // Push merged cart back to server
            if (changed || state.items.length > 0) {
              await fetch("/api/customers/cart", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                  cart: merged.map(i => ({ productId: i.productId, quantity: i.quantity })) 
                })
              });
            }
          }
        } catch (e) {
          console.error("Cart sync failed", e);
        }
      }
      syncCart();
    }
  }, [isAuthenticated, synced, state.items]);

  // Reset sync state when logged out
  useEffect(() => {
    if (!isAuthenticated) {
      setSynced(false);
    }
  }, [isAuthenticated]);

  // Persist to localStorage AND server on every change
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(state));

      // Only push to server if we've already synced
      if (isAuthenticated && synced) {
        fetch("/api/customers/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cart: state.items.map(i => ({ productId: i.productId, quantity: i.quantity }))
          })
        }).catch(e => console.error("Cart push failed", e));
      }
    } catch {}
  }, [state, isAuthenticated, synced]);

  const cartCount = state.items.reduce(
    (sum: number, i: CartItem) => sum + i.quantity,
    0,
  );
  const cartSubtotal = state.items.reduce(
    (sum: number, i: CartItem) => sum + i.price * i.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{ 
        cart: state, 
        dispatch, 
        cartCount, 
        cartSubtotal,
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
