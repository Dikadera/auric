export const SERVICES = [
  {
    id: 'acrylic-fullset',
    name: 'Bespoke Acrylic Full Set',
    tagline: 'High-durability sculpted extension tailored to your natural nail bed.',
    price: 35000,
    duration: '120 mins',
    popular: true,
    description: 'Includes full manicuring prep, tip extension or hand-sculpted form, precision shaping, and high-shine gel topcoat.',
    category: 'Extensions',
    imageUrl: '/images/hero.png',
    images: ['/images/hero.png', '/images/chrome.png', '/images/charms.png']
  },
  {
    id: 'gelx-extensions',
    name: 'Gel-X Soft Gel Extensions',
    tagline: 'Lightweight, natural feel with zero damage and 4+ week retention.',
    price: 30000,
    duration: '90 mins',
    popular: false,
    description: '100% full-coverage soft gel tips infused with keratin builder gel for strong, flexible, and ultra-sleek length.',
    category: 'Extensions',
    imageUrl: '/images/chrome.png',
    images: ['/images/chrome.png', '/images/charms.png', '/images/hero.png']
  },
  {
    id: 'biab-overlay',
    name: 'BIAB Builder Gel Overlay',
    tagline: 'Strengthening treatment to grow your natural nails long and healthy.',
    price: 25000,
    duration: '75 mins',
    popular: true,
    description: 'Rich structured builder gel applied over natural nails to prevent breakage, reinforce strength, and encourage length.',
    category: 'Natural Nails',
    imageUrl: '/images/charms.png',
    images: ['/images/charms.png', '/images/hero.png', '/images/chrome.png']
  },
  {
    id: 'custom-pressons',
    name: 'Custom Luxury Press-On Set',
    tagline: 'Reusable custom hand-painted press-on nails created to your exact sizes.',
    price: 20000,
    duration: 'Consultation & Fit',
    popular: false,
    description: 'Includes custom sizing kit, application adhesive tabs & glue, cuticle pusher, and custom hand-painted luxury design.',
    category: 'Press-Ons',
    imageUrl: '/images/hero.png',
    images: ['/images/hero.png', '/images/charms.png']
  },
  {
    id: 'spa-manicure',
    name: 'Deluxe Spa Manicure & Gel',
    tagline: 'Nourishing cuticle rehab, exfoliative scrub, massage & gel polish.',
    price: 15000,
    duration: '60 mins',
    popular: false,
    description: 'Warm essential oil soak, meticulous e-file cuticle care, organic scrub, hot towel treat, and long-wear gel polish.',
    category: 'Natural Nails',
    imageUrl: '/images/chrome.png',
    images: ['/images/chrome.png', '/images/hero.png']
  }
];

export const NAIL_SHAPES = [
  { id: 'almond', name: 'Almond', icon: '✨', desc: 'Tapered sides meeting at a curved point. Elegant & lengthening.' },
  { id: 'coffin', name: 'Coffin / Ballerina', icon: '📐', desc: 'Tapered sides ending in a crisp square flat tip. Modern classic.' },
  { id: 'stiletto', name: 'Stiletto', icon: '🗡️', desc: 'Sharp, dramatic pointed tip. Fierce & high-fashion aesthetic.' },
  { id: 'square', name: 'Sharp Square', icon: '⬛', desc: 'Straight sidewalls with sharp 90-degree corners. Clean & bold.' },
  { id: 'duck', name: 'Duck / Flare', icon: '🪶', desc: 'Flared outwards at the tips. Y2K iconic retro silhouette.' },
  { id: 'oval', name: 'Natural Oval', icon: '⭕', desc: 'Soft rounded contour mirroring natural nail matrix.' }
];

export const NAIL_LENGTHS = [
  { id: 'short', name: 'Short / Natural', extra: 0, badge: 'Standard' },
  { id: 'medium', name: 'Medium Length', extra: 3000, badge: 'Most Popular' },
  { id: 'long', name: 'Long Statement', extra: 5000, badge: 'Glam' },
  { id: 'xl', name: 'Extra Long (XL)', extra: 8000, badge: 'Dramatic' },
  { id: 'xxl', name: 'Extravaganza (XXL)', extra: 12000, badge: 'Showstopper' }
];

export const ART_TIERS = [
  {
    id: 'minimalist',
    name: 'Minimalist & Clean Girl',
    price: 5000,
    desc: 'French tips, subtle chrome dusting, glazed donut finish, or delicate micro dots.',
    tag: 'Tier 1'
  },
  {
    id: 'signature',
    name: 'Signature Auric Art',
    price: 10000,
    desc: 'Abstract line art, blooming gel, foil accents, ombré gradients, or aura airbrushing.',
    tag: 'Tier 2'
  },
  {
    id: 'opulence',
    name: '3D Opulence & Charms',
    price: 18000,
    desc: 'Hand-sculpted 3D textures, metallic chrome swirls, gemstone clusters & pearl accents.',
    tag: 'Tier 3'
  },
  {
    id: 'masterpiece',
    name: 'Auric Masterpiece Set',
    price: 25000,
    desc: 'Full junk nail art, custom 3D sculpted bows/bears, Swarovski full coverage & multi-tier art.',
    tag: 'Masterpiece'
  }
];

export const ADD_ONS = [
  { id: 'soakoff', name: 'Gentle Soak-Off Removal', price: 5000, desc: 'Safe non-damaging removal of previous set.' },
  { id: 'swarovski', name: 'Swarovski Crystal Accent Finger', price: 4000, desc: 'Full coverage genuine crystal placement on 2 accent nails.' },
  { id: 'cuticle-kit', name: 'Auric Gold Cuticle Elixir Oil (15ml)', price: 3500, desc: 'Take-home jojoba & vitamin E cuticle hydration oil.' },
  { id: 'gel-change', name: 'Gel Polish Color Change', price: 5000, desc: 'Fresh new gel color coat over existing set.' }
];

export const GALLERY_LOOKS = [
  {
    id: 1,
    title: 'Champagne Gold Liquid Chrome',
    category: 'Chrome',
    shape: 'Almond',
    tier: 'Opulence',
    image: '/images/hero.png',
    tags: ['#LiquidGold', '#ChromeObsession', '#AlmondShape'],
    likes: 428
  },
  {
    id: 2,
    title: '3D Metallic Gold Drips & Nude',
    category: '3D Art',
    shape: 'Coffin',
    tier: 'Opulence',
    image: '/images/chrome.png',
    tags: ['#3DNailArt', '#GoldDrip', '#MilkyNude'],
    likes: 512
  },
  {
    id: 3,
    title: 'Golden Bow & Swarovski Cluster',
    category: 'Charms',
    shape: 'Stiletto',
    tier: 'Masterpiece',
    image: '/images/charms.png',
    tags: ['#JunkNails', '#3DBow', '#Swarovski'],
    likes: 689
  },
  {
    id: 4,
    title: 'Glazed Donut & Micro French',
    category: 'Minimalist',
    shape: 'Almond',
    tier: 'Minimalist',
    image: '/images/hero.png',
    tags: ['#CleanGirl', '#MicroFrench', '#PearlShimmer'],
    likes: 340
  }
];

export const POLICIES = [
  {
    title: 'Deposit & Payment Policy',
    content: 'A non-refundable ₦10,000 deposit is required to secure every appointment slot. The remaining balance is payable upon completion via Cash, Bank Transfer, or POS.'
  },
  {
    title: 'Grace Period & Late Arrivals',
    content: 'Please arrive on time. We offer a 10-minute grace period. Arrivals past 15 minutes will incur a ₦5,000 late fee or require rescheduling to preserve quality.'
  },
  {
    title: 'Cancellations & Rescheduling',
    content: 'Rescheduling requires at least 48 hours notice to transfer your deposit to a future date. Cancellations within 24 hours forfeit the deposit.'
  },
  {
    title: 'Soak-Off & Foreign Work Policy',
    content: 'We do NOT work over or refill foreign nail sets from other salons to maintain health standards. Please add "Gentle Soak-Off Removal" if you currently have nails on.'
  },
  {
    title: 'Retention Guarantee',
    content: 'All Auric Sets come with a 7-day nail guarantee. If any lifting or embellishment loss occurs within 7 days, we repair it free of charge.'
  }
];

export const REVIEWS = [
  {
    name: 'Sophia M.',
    handle: '@sophiam_style',
    rating: 5,
    text: 'Auric Nails is hands down the best nail experience! My Gel-X set lasted over 5 weeks with zero lifting. The gold chrome details are perfection!',
    service: 'Gel-X + 3D Gold Chrome'
  },
  {
    name: 'Elena R.',
    handle: '@elena.vibe',
    rating: 5,
    text: 'The booking process was so smooth and the virtual customizer helped me preview my exact shape before arriving. 10/10 master technician!',
    service: 'BIAB Overlay + Minimalist French'
  },
  {
    name: 'Camila K.',
    handle: '@camila_k',
    rating: 5,
    text: 'The 3D charms set I got for my birthday blew everyone away! The studio atmosphere is super luxury and clean. Will never go anywhere else!',
    service: 'Acrylic Full Set + Tier 3 Masterpiece'
  }
];
