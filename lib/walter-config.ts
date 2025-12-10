// lib/walter-config.ts

export type OpeningHour = {
  day: string;
  open: string;
  close: string;
  note?: string;
};

export type TicketCategory = {
  label: string;
  priceFrom: number;
  description?: string;
};

export type WalterConfig = {
  siteName: string;
  brandName: string;
  farmName: string;
  tagline: string;
  addressLine1: string;
  addressLine2: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  facebookPage: string;
  openingHours: OpeningHour[];
  ticketInfo: TicketCategory[];
};

export const walterConfig: WalterConfig = {
  siteName: 'Walters Farm Segamat',
  brandName: 'Walters Farm',
  farmName: 'Walters Farm Segamat',
  tagline: 'Family-friendly recreational farm in Segamat, Johor.',

  addressLine1: 'Lot 463 & 464, Batu 3, Jalan Segamat–Jementah',
  addressLine2: 'Mukim Gemereh',
  postcode: '85000',
  city: 'Segamat',
  state: 'Johor',
  country: 'Malaysia',

  coordinates: {
    lat: 1.85,
    lng: 102.82,
  },

  phone: '+60 16-613 6281',
  facebookPage: 'https://www.facebook.com/waltersfarmsegamat',

  openingHours: [
    {
      day: 'Monday',
      open: '10:00',
      close: '18:00',
    },
    {
      day: 'Tuesday',
      open: '10:00',
      close: '18:00',
    },
    {
      day: 'Wednesday',
      open: '10:00',
      close: '18:00',
    },
    {
      day: 'Thursday',
      open: '10:00',
      close: '18:00',
    },
    {
      day: 'Friday',
      open: '10:00',
      close: '18:00',
    },
    {
      day: 'Saturday',
      open: '10:00',
      close: '18:00',
      note: 'Peak day, expect higher crowd.',
    },
    {
      day: 'Sunday',
      open: '10:00',
      close: '18:00',
      note: 'Peak day, expect higher crowd.',
    },
  ],

  ticketInfo: [
    {
      label: 'Adult day pass',
      priceFrom: 15,
      description: 'Estimated RM15–20 per adult including basic farm entry.',
    },
    {
      label: 'Child & senior',
      priceFrom: 10,
      description:
        'Estimated RM10–15 per child or senior citizen for basic entry.',
    },
    {
      label: 'Combo: Mini Zoo + Water Park',
      priceFrom: 30,
      description: 'Indicative RM30 per person for both attractions.',
    },
    {
      label: 'Family package',
      priceFrom: 50,
      description: 'Indicative RM50+ per family (subject to on-site offer).',
    },
  ],
};
