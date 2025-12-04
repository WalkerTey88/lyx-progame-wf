// app/contact/page.tsx
"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [messageText, setMessageText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: messageText,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setFeedback("Message sent successfully. We will get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setMessageText("");
    } catch {
      setFeedback("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Have any questions about Walter Farm? Send us a message.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone (optional)</label>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-green-700 text-white py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>

        {feedback && (
          <p className="text-sm mt-2 text-gray-700">
            {feedback}
          </p>
        )}
      </form>
    </main>
  );
}
