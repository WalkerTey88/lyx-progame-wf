"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { ContactMessage } from "@/types/walter";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    const payload = { name, email, phone, message: msg };
    const res = await apiPost<ContactMessage>("/api/contact", payload);
    alert("Message sent! ID: " + res.id);
  }

  return (
    <section className="p-6">
      <form onSubmit={submit} className="space-y-4 max-w-md">
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <textarea className="input" placeholder="Message" value={msg} onChange={e => setMsg(e.target.value)} />

        <button className="bg-black text-white px-4 py-2 rounded">Send</button>
      </form>
    </section>
  );
}
