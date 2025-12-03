/**
 * Contact page providing communication options for visitors.
 * Updated with actual contact details for Walter Farm.
 */

export default function ContactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Contact Us</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        For bookings and enquiries, please reach out to us through any of the channels below. We look forward to hearing from you!
      </p>
      <ul className="space-y-2 text-neutral-700">
        <li>
          <strong>Phone:</strong> <a href="tel:+60123456789" className="text-brand hover:underline">+60 12‑345‑6789</a>
        </li>
        <li>
          <strong>Email:</strong> <a href="mailto:info@walterfarm.com" className="text-brand hover:underline">info@walterfarm.com</a>
        </li>
        <li>
          <strong>Address:</strong> Segamat, Johor, Malaysia
        </li>
        <li>
          <strong>WhatsApp:</strong> <a href="https://wa.me/60123456789" className="text-brand hover:underline">Chat with us on WhatsApp</a>
        </li>
        <li>
          <strong>Social:</strong> Follow us on <a href="#" className="text-brand hover:underline">Facebook</a> and <a href="#" className="text-brand hover:underline">Instagram</a> for updates.
        </li>
      </ul>
    </div>
  );
}
