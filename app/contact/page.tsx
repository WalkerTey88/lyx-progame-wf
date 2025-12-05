"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { ContactMessage } from "@/types/walter";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = { name, email, phone, message: msg };
      const res = await apiPost<ContactMessage>("/api/contact", payload);
      setFeedback(`Message sent successfully. Reference ID: ${res.id}.`);
      setName("");
      setEmail("");
      setPhone("");
      setMsg("");
    } catch {
      setFeedback("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Contact Walter Farm
          </h1>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Have any questions about stays, activities, or group bookings? Send us a message and we will get back to you.
          </p>
        </div>

        <div className="bg-white/90 rounded-2xl shadow-md border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm shadow-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>

            {feedback && (
              <p className="text-sm text-gray-700 mt-2 text-center">
                {feedback}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
