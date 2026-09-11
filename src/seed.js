import { db } from './firebase/config.js';
import { collection, setDoc, doc } from 'firebase/firestore';
import { SERVICES, NAIL_SHAPES, NAIL_LENGTHS, ART_TIERS, ADD_ONS, POLICIES, REVIEWS, GALLERY_LOOKS } from './data/servicesData.js';

export const seedDatabase = async () => {
  try {
    console.log("Seeding database...");
    
    // Seed Services
    for (const service of SERVICES) {
      await setDoc(doc(db, 'services', service.id), service);
    }
    
    // Seed Shapes
    for (const shape of NAIL_SHAPES) {
      await setDoc(doc(db, 'shapes', shape.id), shape);
    }
    
    // Seed Lengths
    for (const length of NAIL_LENGTHS) {
      await setDoc(doc(db, 'lengths', length.id), length);
    }
    
    // Seed Art Tiers
    for (const tier of ART_TIERS) {
      await setDoc(doc(db, 'artTiers', tier.id), tier);
    }
    
    // Seed Add-ons
    for (const addon of ADD_ONS) {
      await setDoc(doc(db, 'addons', addon.id), addon);
    }

    // Seed Studio Settings
    await setDoc(doc(db, 'settings', 'studioConfig'), {
      depositAmount: 10000,
      timeSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM'],
      studioPhone: '+234 800 123 4567',
      studioEmail: 'hello@auricnails.com',
      studioInstagram: '@auricc_nails',
      studioAddress: 'Lekki Phase 1, Lagos, Nigeria',
      studioHours: 'Opens today at 10:00 AM'
    }, { merge: true });

    console.log("Database seeding completed successfully.");
    return true;
  } catch (error) {
    console.error("Error seeding database: ", error);
    throw error;
  }
};
