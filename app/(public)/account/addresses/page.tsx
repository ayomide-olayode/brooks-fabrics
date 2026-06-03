"use client";

import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function AddressesPage() {
  const { isAuthenticated, customer } = useCustomerAuth();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    async function fetchData() {
      try {
        const [addrRes, locRes] = await Promise.all([
          fetch("/api/customers/addresses"),
          fetch("/api/delivery-locations?activeOnly=true")
        ]);

        if (addrRes.ok) {
          const addrData = await addrRes.json();
          setAddresses(addrData.addresses || []);
        }
        
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocations(locData.locations || []);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/customers/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: data.label || "Saved Address",
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          deliveryLocationId: data.deliveryLocationId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add address");
      }

      const { address } = await res.json();
      setAddresses([...addresses, address]);
      setIsAdding(false);
      reset();
      toast.success("Address added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add address");
    }
  };

  const deleteAddress = async (index: number) => {
    // Basic implementation - we don't have a specific DELETE route for single addresses yet,
    // but a proper implementation would call the backend to remove it.
    toast.error("Address deletion to be implemented");
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold text-ink">Saved Addresses</h2>
        
        {!isAdding && addresses.length < 5 && (
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {isAdding && (
            <div className="card p-6 border-2 border-primary-100">
              <h3 className="font-heading text-lg font-bold text-ink mb-4">Add New Address</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Address Label</label>
                    <input
                      {...register("label")}
                      className="input-field"
                      placeholder="e.g. Home, Office"
                    />
                  </div>
                  <div>
                    <label className="label">Full Name <span className="text-red-400">*</span></label>
                    <input
                      {...register("fullName", { required: "Name is required" })}
                      className={`input-field ${errors.fullName ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number <span className="text-red-400">*</span></label>
                    <input
                      {...register("phone", { required: "Phone is required" })}
                      className={`input-field ${errors.phone ? "border-red-500" : ""}`}
                    />
                  </div>
                  <div>
                    <label className="label">Delivery Area <span className="text-red-400">*</span></label>
                    <select
                      {...register("deliveryLocationId", { required: "Please select a delivery area" })}
                      className={`input-field ${errors.deliveryLocationId ? "border-red-500" : ""}`}
                      defaultValue=""
                    >
                      <option value="" disabled>Select your area...</option>
                      {locations.map((loc) => (
                        <option key={loc._id} value={loc._id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="label">Full Address <span className="text-red-400">*</span></label>
                  <textarea
                    {...register("address", { required: "Address is required" })}
                    className={`input-field min-h-[100px] ${errors.address ? "border-red-500" : ""}`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setIsAdding(false); reset(); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="btn-primary"
                  >
                    {isSubmitting ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address, index) => {
              const location = locations.find(l => l._id === address.deliveryLocationId);
              
              return (
                <div key={address._id || index} className="card p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-primary-600" />
                      </div>
                      <h3 className="font-bold text-ink">{address.label}</h3>
                    </div>
                    {/* Placeholder for delete button functionality */}
                  </div>
                  
                  <div className="flex-1 space-y-1 text-ink-secondary text-sm">
                    <p className="font-medium text-ink">{address.fullName}</p>
                    <p>{address.phone}</p>
                    <p className="mt-2 line-clamp-2">{address.address}</p>
                    {location && (
                      <p className="text-primary-700 font-medium mt-1">{location.name}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isAdding && addresses.length === 0 && (
            <div className="text-center py-12 bg-surface-muted rounded-2xl border border-dashed border-border">
              <MapPin className="w-12 h-12 text-ink-muted mx-auto mb-4 opacity-50" />
              <h3 className="font-heading text-lg font-bold text-ink">No saved addresses</h3>
              <p className="text-ink-secondary mt-1 mb-6">Add an address to speed up your checkout.</p>
              <button onClick={() => setIsAdding(true)} className="btn-primary">
                Add Address
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
