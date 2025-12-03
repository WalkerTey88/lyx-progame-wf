/**
 * Location page with address and map for Walter Farm.
 */

export default function LocationPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-semibold">Location</h1>
      <p className="text-sm md:text-base text-neutral-700 max-w-2xl">
        Walter Farm is located in Segamat, Johor, Malaysia. Use the map below to find directions to our farm. We look forward to welcoming you!
      </p>
      <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15926.315321843685!2d102.8531145!3d2.5134062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d1582af086e189%3A0xa0eb5b8672b5b08f!2sSegamat%2C%20Johor!5e0!3m2!1sen!2smy!4v1701619041000!5m2!1sen!2smy"
          width="100%"
          height="100%"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        ></iframe>
      </div>
      <p className="text-sm text-neutral-700">
        Address: Segamat, Johor, Malaysia
      </p>
    </div>
  );
}
