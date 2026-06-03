"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, dispatch, cartSubtotal } = useCart();

  function updateQty(productId: string, quantity: number, stock: number) {
    if (quantity < 1) return;
    if (quantity * 6 > stock) return; // Note: stock logic
    dispatch({ type: "UPDATE_QUANTITY", productId, quantity });
  }

  function remove(productId: string) {
    dispatch({ type: "REMOVE_ITEM", productId });
  }

  return (
    <Transition.Root show={isCartOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeCart}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-400"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-400"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-surface shadow-float">
                    {/* Header */}
                    <div className="flex items-start justify-between px-6 py-5 border-b border-border-light bg-white">
                      <Dialog.Title className="font-heading text-xl font-bold text-ink">
                        Your Cart
                      </Dialog.Title>
                      <div className="ml-3 flex h-7 items-center">
                        <button
                          type="button"
                          className="relative -m-2 p-2 text-ink-secondary hover:text-ink transition-colors"
                          onClick={closeCart}
                        >
                          <span className="absolute -inset-0.5" />
                          <span className="sr-only">Close panel</span>
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-6">
                      {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                          <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-ink-muted" />
                          </div>
                          <div>
                            <p className="text-ink font-semibold">Your cart is empty</p>
                            <p className="text-ink-muted text-sm mt-1">
                              Looks like you haven&apos;t added any fabrics yet.
                            </p>
                          </div>
                          <button
                            onClick={closeCart}
                            className="btn-outline mt-2 text-sm px-6 py-2"
                          >
                            Continue Shopping
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {cart.items.map((item) => (
                            <div key={item.productId} className="flex gap-4 group">
                              {/* Image */}
                              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border-light bg-surface-muted">
                                <Image
                                  src={item.image || "/placeholder-fabric.jpg"}
                                  alt={item.name}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex flex-1 flex-col">
                                <div className="flex justify-between text-base font-medium text-ink">
                                  <h3 className="text-sm font-semibold truncate pr-4">
                                    <Link href={`/product/${item.slug}`} onClick={closeCart}>
                                      {item.name}
                                    </Link>
                                  </h3>
                                  <p className="ml-4 font-bold shrink-0">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-ink-muted">
                                  {formatCurrency(item.price)} / 6 yds
                                </p>

                                <div className="flex flex-1 items-end justify-between mt-2">
                                  {/* Qty Controls */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => updateQty(item.productId, item.quantity - 1, item.stock)}
                                      disabled={item.quantity <= 1}
                                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 transition-all text-ink"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="text-xs font-bold w-6 text-center text-ink">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() => updateQty(item.productId, item.quantity + 1, item.stock)}
                                      disabled={item.quantity >= Math.floor(item.stock / 6)}
                                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center hover:bg-surface-muted disabled:opacity-30 transition-all text-ink"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => remove(item.productId)}
                                      className="font-medium text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    {cart.items.length > 0 && (
                      <div className="border-t border-border-light px-6 py-6 bg-white">
                        <div className="flex justify-between text-base font-bold text-ink mb-4">
                          <p>Subtotal</p>
                          <p>{formatCurrency(cartSubtotal)}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-muted mb-4">
                          Shipping and taxes calculated at checkout.
                        </p>
                        <div className="space-y-3">
                          <Link
                            href="/checkout"
                            onClick={closeCart}
                            className="btn-primary w-full text-base py-3 gap-2 flex justify-center"
                          >
                            Checkout <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link
                            href="/cart"
                            onClick={closeCart}
                            className="btn-outline w-full text-sm py-3 flex justify-center"
                          >
                            View Full Cart
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
