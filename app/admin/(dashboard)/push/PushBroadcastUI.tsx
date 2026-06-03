"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";

interface PushBroadcastUIProps {
  subscriberCount: number;
}

export default function PushBroadcastUI({ subscriberCount }: PushBroadcastUIProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("/");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ successCount: number; failCount: number; deadRemoved: number } | null>(null);
  const [error, setError] = useState("");

  const handleBroadcast = async () => {
    setIsSending(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/admin/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to broadcast");
      }

      setResult(data.stats);
      setTitle("");
      setMessage("");
      setUrl("/");
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
      setIsModalOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscriberCount === 0) {
      setError("No customers are currently subscribed.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <form onSubmit={handleOpenModal} className="card p-6 space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-50 text-green-800 rounded-lg text-sm border border-green-100">
            <h4 className="font-bold mb-1 text-green-900">Broadcast Complete!</h4>
            <ul className="list-disc pl-5 space-y-0.5">
              <li>Successfully sent: {result.successCount}</li>
              <li>Failed: {result.failCount}</li>
              <li>Dead subscriptions removed: {result.deadRemoved}</li>
            </ul>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. Flash Sale: 20% Off All Kente!"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tap to claim your discount before midnight..."
            maxLength={150}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/150</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target URL (Optional)
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g. /shop/kente"
          />
          <p className="text-xs text-gray-400 mt-1">
            Where the user goes when they tap the notification.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSending || subscriberCount === 0}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSending ? "Sending..." : "Send Broadcast"}
        </button>
        <p className="text-center text-xs text-gray-500">
          Targeting {subscriberCount} subscribed customer{subscriberCount !== 1 ? 's' : ''}
        </p>
      </form>

      <Modal
        open={isModalOpen}
        onClose={() => {
          if (!isSending) setIsModalOpen(false);
        }}
        title="Confirm Broadcast"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            You are about to notify <strong>{subscriberCount} customer{subscriberCount !== 1 ? 's' : ''}</strong>. 
            This action cannot be undone. Are you sure you want to continue?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="font-bold text-gray-900 text-sm mb-1">{title}</p>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSending}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBroadcast}
              disabled={isSending}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSending ? "Sending..." : "Yes, send now"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
