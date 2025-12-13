// app/contact/page.tsx
import { walterConfig } from "@/walter-config";

export const metadata = {
  title: "Contact | Walters Farm Segamat",
  description:
    "Contact details for Walters Farm Segamat – phone, Facebook and booking enquiries.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-2 text-3xl font-bold">Contact &amp; Enquiries</h1>
      <p className="mb-6 text-gray-700">
        For the latest ticketing information, promotions and booking
        confirmations, please contact the farm directly.
      </p>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Contact Details</h2>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>
            <strong>Manager phone (WhatsApp):</strong>{" "}
            {walterConfig.contact.phoneManager}
          </li>
          <li>
            <strong>Facebook:</strong> {walterConfig.contact.facebook}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Booking Notes</h2>
        <ul className="list-disc space-y-2 pl-6 text-gray-700">
          <li>
            Day tickets and activities can usually be purchased on-site, but
            peak weekends and public holidays may be crowded.
          </li>
          <li>
            Farmstay bookings should be made in advance via Facebook Messenger
            or phone to avoid disappointment.
          </li>
          <li>{walterConfig.ticketingNote}</li>
        </ul>
      </section>
    </main>
  );
}
