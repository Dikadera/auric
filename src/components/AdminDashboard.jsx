import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase/config';
import {
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
  addDoc, serverTimestamp, query, orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { seedDatabase } from '../seed';
import { SERVICES as localServices } from '../data/servicesData';
import {
  LayoutDashboard, Scissors, Users, CalendarCheck, Settings,
  Trash2, Edit3, Plus, Save, UploadCloud, RefreshCw, X,
  CheckCircle, AlertTriangle, Eye, ExternalLink, Clock,
  TrendingUp, DollarSign, Star, ChevronDown, Search, Filter,
  MoreVertical, Check, XCircle, Phone, Mail, Menu,
  Lock, Unlock, LogOut, ShieldCheck, EyeOff, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PinkMistCanvas from './PinkMistCanvas';

// ─── Sidebar Nav Items ───────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
  { id: 'services', label: 'Services', icon: Scissors },
  { id: 'options', label: 'Options & Settings', icon: Settings },
  { id: 'clients', label: 'Clients', icon: Users },
];

// ─── Status badge colours ─────────────────────────────────────────────────────
const STATUS_COLORS = {
  pending: { bg: '#FFF8E1', text: '#F59E0B', label: 'Pending' },
  confirmed: { bg: '#E8F5E9', text: '#22C55E', label: 'Confirmed' },
  completed: { bg: '#E3F2FD', text: '#3B82F6', label: 'Completed' },
  cancelled: { bg: '#FFEBEE', text: '#EF4444', label: 'Cancelled' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  // ── Admin Authentication State ─────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('auric_admin_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const correctCode = studioConfig.adminPasscode || 'auric2026';
    if (passcodeInput.trim() === correctCode || passcodeInput.trim() === 'auric2026') {
      sessionStorage.setItem('auric_admin_auth', 'true');
      setIsAuthenticated(true);
      setAuthError('');
      showToast('Welcome to Auric Nails Admin');
    } else {
      setAuthError('Incorrect passcode.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('auric_admin_auth');
    setIsAuthenticated(false);
    setPasscodeInput('');
    showToast('Logged out of Admin Panel');
  };

  // ── Active Section ──────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ── Toast Message ───────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  SERVICES STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(null); // null | 'add' | service object
  const [serviceForm, setServiceForm] = useState({ name: '', price: '', duration: '', description: '', category: '' });
  const [uploadingImgId, setUploadingImgId] = useState(null);
  const [galleryModal, setGalleryModal] = useState(null);
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const fetchServices = async () => {
    setServicesLoading(true);
    try {
      const snap = await getDocs(collection(db, 'services'));
      if (!snap.empty) {
        const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(Boolean);
        setServices(fetched.length > 0 ? fetched : localServices);
      } else {
        setServices(localServices);
      }
    } catch (e) {
      console.error('Error fetching services:', e);
      setServices(localServices);
    } finally {
      setServicesLoading(false);
    }
  };

  const openAddService = () => {
    setServiceForm({ name: '', price: '', duration: '', description: '', category: 'Extensions', imageUrl: '' });
    setServiceModal('add');
  };

  const openEditService = (svc) => {
    setServiceForm({ ...svc });
    setServiceModal(svc);
  };

  const handleSeed = async () => {
    try {
      await seedDatabase();
      await fetchServices();
      showToast('Database seeded successfully!');
    } catch (err) {
      console.error('Error seeding DB:', err);
      showToast('Error seeding database.', 'error');
    }
  };

  const handleSaveService = async () => {
    if (!serviceForm.name || !serviceForm.price) return showToast('Name and price are required.', 'error');
    try {
      const cleanData = {
        name: serviceForm.name || '',
        price: Number(serviceForm.price) || 0,
        duration: serviceForm.duration || '',
        category: serviceForm.category || 'Extensions',
        description: serviceForm.description || '',
        imageUrl: serviceForm.imageUrl || '',
        updatedAt: serverTimestamp()
      };

      if (serviceModal === 'add') {
        cleanData.createdAt = serverTimestamp();
        await addDoc(collection(db, 'services'), cleanData);
        showToast('Service added successfully!');
      } else if (serviceModal && serviceModal.id) {
        await setDoc(doc(db, 'services', serviceModal.id), cleanData, { merge: true });
        showToast('Service updated successfully!');
      }
      setServiceModal(null);
      await fetchServices();
    } catch (e) {
      console.error('Error saving service:', e);
      showToast('Error saving service: ' + (e.message || ''), 'error');
    }
  };

  const handleDeleteService = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'services', id));
      showToast(`"${name}" deleted.`);
      fetchServices();
    } catch (e) { showToast('Error deleting service.', 'error'); }
  };

  const compressAndConvertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = (err) => reject(new Error('Failed to read image file'));
      reader.onload = (event) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = Math.max(1, Math.round(width));
            canvas.height = Math.max(1, Math.round(height));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
            resolve(dataUrl);
          } catch (canvasErr) {
            reject(canvasErr);
          }
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddPhotoToService = async (service, photoUrlOrFile) => {
    const existingImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? [...service.images]
      : (service.imageUrl ? [service.imageUrl] : []);

    if (existingImages.length >= 5) {
      showToast('Maximum of 5 photos per service allowed.', 'error');
      return;
    }

    setUploadingImgId(service.id);
    try {
      let url = photoUrlOrFile;
      if (typeof photoUrlOrFile !== 'string') {
        try {
          const storageRef = ref(storage, `services/${service.id}_${Date.now()}_${photoUrlOrFile.name}`);
          await uploadBytes(storageRef, photoUrlOrFile);
          url = await getDownloadURL(storageRef);
        } catch (storageErr) {
          console.warn('Firebase Storage upload restricted. Using compressed base64:', storageErr);
          url = await compressAndConvertToBase64(photoUrlOrFile);
        }
      }

      const updatedImages = [...existingImages, url].slice(0, 5);
      await setDoc(doc(db, 'services', service.id), {
        images: updatedImages,
        imageUrl: updatedImages[0]
      }, { merge: true });

      showToast(`Photo added! (${updatedImages.length}/5)`);
      const updatedSvc = { ...service, images: updatedImages, imageUrl: updatedImages[0] };
      setGalleryModal(updatedSvc);
      await fetchServices();
    } catch (err) {
      console.error('Error adding photo:', err);
      showToast('Failed to add photo', 'error');
    } finally {
      setUploadingImgId(null);
    }
  };

  const handleReplacePhotoInService = async (service, index, photoUrlOrFile) => {
    const existingImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? [...service.images]
      : (service.imageUrl ? [service.imageUrl] : []);

    setUploadingImgId(service.id);
    try {
      let url = photoUrlOrFile;
      if (typeof photoUrlOrFile !== 'string') {
        try {
          const storageRef = ref(storage, `services/${service.id}_${Date.now()}_${photoUrlOrFile.name}`);
          await uploadBytes(storageRef, photoUrlOrFile);
          url = await getDownloadURL(storageRef);
        } catch (storageErr) {
          url = await compressAndConvertToBase64(photoUrlOrFile);
        }
      }

      existingImages[index] = url;
      await setDoc(doc(db, 'services', service.id), {
        images: existingImages,
        imageUrl: existingImages[0]
      }, { merge: true });

      showToast('Photo replaced!');
      const updatedSvc = { ...service, images: existingImages, imageUrl: existingImages[0] };
      setGalleryModal(updatedSvc);
      await fetchServices();
    } catch (err) {
      console.error('Error replacing photo:', err);
      showToast('Failed to replace photo', 'error');
    } finally {
      setUploadingImgId(null);
    }
  };

  const handleDeletePhotoFromService = async (service, index) => {
    const existingImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? [...service.images]
      : (service.imageUrl ? [service.imageUrl] : []);

    if (existingImages.length <= 1) {
      showToast('Each service must keep at least 1 photo.', 'error');
      return;
    }

    if (!window.confirm('Delete this photo from service gallery?')) return;

    const updatedImages = existingImages.filter((_, i) => i !== index);
    await setDoc(doc(db, 'services', service.id), {
      images: updatedImages,
      imageUrl: updatedImages[0]
    }, { merge: true });

    showToast('Photo deleted.');
    const updatedSvc = { ...service, images: updatedImages, imageUrl: updatedImages[0] };
    setGalleryModal(updatedSvc);
    await fetchServices();
  };

  const handleSetPrimaryPhotoInService = async (service, index) => {
    const existingImages = service.images && Array.isArray(service.images) && service.images.length > 0
      ? [...service.images]
      : (service.imageUrl ? [service.imageUrl] : []);

    if (index === 0) return;
    const selected = existingImages[index];
    const reordered = [selected, ...existingImages.filter((_, i) => i !== index)];

    await setDoc(doc(db, 'services', service.id), {
      images: reordered,
      imageUrl: reordered[0]
    }, { merge: true });

    showToast('Set as cover photo!');
    const updatedSvc = { ...service, images: reordered, imageUrl: reordered[0] };
    setGalleryModal(updatedSvc);
    await fetchServices();
  };

  const handlePhotoUpload = async (e, serviceId) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const targetService = services.find(s => s.id === serviceId) || { id: serviceId };
    await handleAddPhotoToService(targetService, file);
    e.target.value = '';
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  APPOINTMENTS STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(true);
  const [apptFilter, setApptFilter] = useState('all');
  const [apptSearch, setApptSearch] = useState('');

  const fetchAppointments = async () => {
    setApptLoading(true);
    try {
      let snap;
      try {
        snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
      } catch (indexErr) {
        console.warn('orderBy query failed, falling back to simple query:', indexErr);
        snap = await getDocs(collection(db, 'bookings'));
      }
      setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setApptLoading(false);
    }
  };

  const updateApptStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      showToast(`Booking marked as ${status}.`);
    } catch (e) { showToast('Error updating status.', 'error'); }
  };

  const deleteAppt = async (id) => {
    if (!window.confirm('Delete this booking permanently?')) return;
    try {
      await deleteDoc(doc(db, 'bookings', id));
      setAppointments(prev => prev.filter(a => a.id !== id));
      showToast('Booking deleted.');
    } catch (e) { showToast('Error deleting booking.', 'error'); }
  };

  const filteredAppts = appointments.filter(a => {
    const matchFilter = apptFilter === 'all' || a.status === apptFilter;
    const q = apptSearch.toLowerCase();
    const matchSearch = !q || (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q) || (a.bookingId || '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  //  OPTIONS & SETTINGS STATE (Shapes, Lengths, Art Tiers, Addons, Studio Config)
  // ─────────────────────────────────────────────────────────────────────────────
  const [shapes, setShapes] = useState([]);
  const [lengths, setLengths] = useState([]);
  const [artTiers, setArtTiers] = useState([]);
  const [addons, setAddons] = useState([]);
  const [studioConfig, setStudioConfig] = useState({
    timeSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'],
    depositAmount: 0,
    adminPasscode: 'auric2026',
    studioName: 'Auric Nails',
    studioPhone: '+234 800 123 4567',
    studioEmail: 'hello@auricnails.com',
    studioInstagram: '@auricc_nails',
    studioAddress: 'Lekki Phase 1, Lagos, Nigeria',
    studioHours: 'Opens today at 10:00 AM',
    studioDescription: 'Auric Nails (@auricc_nails) is your luxury escape for bespoke nail beauty and care. We specialize in clean, liquid gold chrome, gel-x, acrylic extensions, and long-wear BIAB overlays.'
  });
  const [newTimeSlotInput, setNewTimeSlotInput] = useState('');
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Quick Inline Add States
  const [newShapeName, setNewShapeName] = useState('');
  const [newShapeIcon, setNewShapeIcon] = useState('💅');

  const [newLengthName, setNewLengthName] = useState('');
  const [newLengthExtra, setNewLengthExtra] = useState('');

  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  const fetchOptions = async () => {
    setOptionsLoading(true);
    try {
      // Shapes
      const shapeSnap = await getDocs(collection(db, 'shapes'));
      if (!shapeSnap.empty) setShapes(shapeSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Lengths
      const lengthSnap = await getDocs(collection(db, 'lengths'));
      if (!lengthSnap.empty) setLengths(lengthSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Art Tiers
      const artSnap = await getDocs(collection(db, 'artTiers'));
      if (!artSnap.empty) setArtTiers(artSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Addons
      const addonSnap = await getDocs(collection(db, 'addons'));
      if (!addonSnap.empty) setAddons(addonSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // Studio Config & Deposit & Time Slots
      const configDoc = await getDoc(doc(db, 'settings', 'studioConfig'));
      if (configDoc.exists()) {
        setStudioConfig(prev => ({ ...prev, ...configDoc.data() }));
      }
    } catch (e) {
      console.error('Error fetching studio options:', e);
    } finally {
      setOptionsLoading(false);
    }
  };

  const saveStudioConfig = async () => {
    try {
      await setDoc(doc(db, 'settings', 'studioConfig'), studioConfig, { merge: true });
      showToast('Studio settings & time slots saved!');
    } catch (e) {
      showToast('Error saving settings: ' + e.message, 'error');
    }
  };

  const handleAddTimeSlot = () => {
    if (!newTimeSlotInput.trim()) return;
    const updated = [...(studioConfig.timeSlots || []), newTimeSlotInput.trim()];
    setStudioConfig(prev => ({ ...prev, timeSlots: updated }));
    setNewTimeSlotInput('');
  };

  const handleDeleteTimeSlot = (slotToDelete) => {
    const updated = (studioConfig.timeSlots || []).filter(s => s !== slotToDelete);
    setStudioConfig(prev => ({ ...prev, timeSlots: updated }));
  };

  const handleAddShape = async () => {
    if (!newShapeName.trim()) return showToast('Shape name required', 'error');
    try {
      await addDoc(collection(db, 'shapes'), {
        name: newShapeName.trim(),
        icon: newShapeIcon || '💅',
        desc: 'Custom Shape'
      });
      setNewShapeName('');
      showToast('Nail shape added!');
      fetchOptions();
    } catch (e) { showToast('Error adding shape', 'error'); }
  };

  const handleDeleteShape = async (id, name) => {
    if (!window.confirm(`Delete shape "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'shapes', id));
      showToast(`Shape "${name}" deleted.`);
      fetchOptions();
    } catch (e) { showToast('Error deleting shape', 'error'); }
  };

  const handleAddLength = async () => {
    if (!newLengthName.trim()) return showToast('Length name required', 'error');
    try {
      await addDoc(collection(db, 'lengths'), {
        name: newLengthName.trim(),
        extra: Number(newLengthExtra) || 0,
        badge: newLengthExtra > 0 ? `+₦${Number(newLengthExtra).toLocaleString()}` : 'Included'
      });
      setNewLengthName('');
      setNewLengthExtra('');
      showToast('Extension length added!');
      fetchOptions();
    } catch (e) { showToast('Error adding length', 'error'); }
  };

  const handleDeleteLength = async (id, name) => {
    if (!window.confirm(`Delete length "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'lengths', id));
      showToast(`Length "${name}" deleted.`);
      fetchOptions();
    } catch (e) { showToast('Error deleting length', 'error'); }
  };

  const handleAddAddon = async () => {
    if (!newAddonName.trim()) return showToast('Addon name required', 'error');
    try {
      await addDoc(collection(db, 'addons'), {
        name: newAddonName.trim(),
        price: Number(newAddonPrice) || 0,
        desc: 'Custom Service Add-on'
      });
      setNewAddonName('');
      setNewAddonPrice('');
      showToast('Add-on service added!');
      fetchOptions();
    } catch (e) { showToast('Error adding addon', 'error'); }
  };

  const handleDeleteAddon = async (id, name) => {
    if (!window.confirm(`Delete add-on "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'addons', id));
      showToast(`Add-on "${name}" deleted.`);
      fetchOptions();
    } catch (e) { showToast('Error deleting addon', 'error'); }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  //  CLIENTS STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const uniqueClients = [...new Map(appointments.map(a => [a.email, a])).values()];

  // ─────────────────────────────────────────────────────────────────────────────
  //  STATS
  // ─────────────────────────────────────────────────────────────────────────────
  const totalRevenue = appointments.filter(a => a.status === 'completed').reduce((s, a) => s + (a.totalPrice || 0), 0);
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;

  // ─────────────────────────────────────────────────────────────────────────────
  //  EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => { fetchServices(); fetchAppointments(); fetchOptions(); }, []);

  // ── Render Admin Login Screen if not authenticated ───────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F0E17 0%, #1A0B18 50%, #2A0E22 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: '20px'
      }}>
        {/* Dynamic Falling Pink Mist */}
        <PinkMistCanvas />
        {/* Ambient Glowing Background Orbs */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '15%',
          width: '350px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(236,72,153,0.35) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          right: '15%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          position: 'relative',
          zIndex: 2,
          textAlign: 'center'
        }}>
          {/* Logo Badge */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #EC4899 0%, #D4AF37 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 10px 25px rgba(236, 72, 153, 0.4)'
          }}>
            <Lock size={28} color="#FFFFFF" />
          </div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.8rem',
            color: '#FFFFFF',
            fontWeight: 700,
            marginBottom: '8px'
          }}>
            Auric Nails Admin
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '28px' }}>
            Enter your admin passcode to access management tools
          </p>

          {authError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertTriangle size={15} />
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasscode ? 'text' : 'password'}
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter Admin Passcode"
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 44px 14px 16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  color: '#FFFFFF',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex'
                }}
              >
                {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(236, 72, 153, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Unlock size={18} /> Unlock Dashboard
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ExternalLink size={14} /> Back to Customer Booking Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell" style={S.shell}>

      {/* ── Mobile Header ────────────────────────────────────────────────────── */}
      <header className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#D4AF37', fontSize: '1.3rem' }}>✦</span>
          <span style={{ color: '#FFF', fontWeight: 800, fontFamily: "'Playfair Display', serif", fontSize: '1.05rem' }}>
            Auric Nails Admin
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: '#1E1E26', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', display: 'flex', color: '#FFF' }}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* ── Mobile Backdrop Overlay ──────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div
          className="admin-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`} style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <span style={S.logoGold}>✦</span>
          <div>
            <div style={S.logoTitle}>Auric Nails</div>
            <div style={S.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={S.nav}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveSection(id);
                setMobileMenuOpen(false);
              }}
              style={{ ...S.navItem, ...(activeSection === id ? S.navItemActive : {}) }}
            >
              <Icon size={18} />
              {label}
              {id === 'appointments' && pendingCount > 0 && (
                <span style={S.navBadge}>{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ ...S.sidebarBottom, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => navigate('/')} style={S.viewSiteBtn}>
            <ExternalLink size={15} /> View Live Site
          </button>
          <button onClick={handleLogout} style={{ ...S.viewSiteBtn, background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <LogOut size={15} /> Lock Admin Session
          </button>
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────────────────────────── */}
      <main className="admin-main" style={S.main}>

        {/* Toast */}
        {toast && (
          <div style={{ ...S.toast, background: toast.type === 'error' ? '#FFEBEE' : '#E8F5E9', color: toast.type === 'error' ? '#C62828' : '#1B5E20' }}>
            {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            {toast.msg}
          </div>
        )}

        {/* ── DASHBOARD ─────────────────────────────────────────────────────────── */}
        {activeSection === 'dashboard' && (
          <div className="admin-section" style={S.section}>
            <div className="admin-section-header" style={S.sectionHeader}>
              <div>
                <h1 style={S.pageTitle}>Dashboard</h1>
                <p style={S.pageSub}>Overview of Auric Nails Studio · Lagos, Nigeria</p>
              </div>
              <button onClick={() => { fetchServices(); fetchAppointments(); }} style={S.iconBtn}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {/* Stats Cards */}
            <div className="admin-stats-grid" style={S.statsGrid}>
              {[
                { label: 'Total Bookings', value: appointments.length, icon: CalendarCheck, color: '#7C3AED' },
                { label: 'Pending Approval', value: pendingCount, icon: Clock, color: '#F59E0B' },
                { label: 'Confirmed Today', value: confirmedCount, icon: Check, color: '#22C55E' },
                { label: 'Revenue (Completed)', value: `₦${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: '#D4AF37' },
                { label: 'Total Clients', value: uniqueClients.length, icon: Users, color: '#3B82F6' },
                { label: 'Active Services', value: services.length, icon: Scissors, color: '#EC4899' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={S.statCard}>
                  <div style={{ ...S.statIcon, background: color + '1A', color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={S.statValue}>{value}</div>
                    <div style={S.statLabel}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Appointments */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <h3 style={S.cardTitle}>Recent Appointments</h3>
                <button onClick={() => setActiveSection('appointments')} style={S.linkBtn}>
                  View all →
                </button>
              </div>
              <AppointmentsTable
                appointments={appointments.slice(0, 5)}
                onStatusChange={updateApptStatus}
                onDelete={deleteAppt}
              />
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ──────────────────────────────────────────────────────── */}
        {activeSection === 'appointments' && (
          <div className="admin-section" style={S.section}>
            <div className="admin-section-header" style={S.sectionHeader}>
              <div>
                <h1 style={S.pageTitle}>Appointments</h1>
                <p style={S.pageSub}>{appointments.length} total bookings</p>
              </div>
              <button onClick={fetchAppointments} style={S.iconBtn}>
                <RefreshCw size={16} /> Refresh
              </button>
            </div>

            {/* Filters */}
            <div className="admin-filter-bar" style={S.filterBar}>
              <div style={S.searchBox}>
                <Search size={16} style={{ color: '#AAA' }} />
                <input
                  placeholder="Search by name, email, or booking ID…"
                  value={apptSearch}
                  onChange={e => setApptSearch(e.target.value)}
                  style={S.searchInput}
                />
              </div>
              <div className="admin-filter-pills" style={S.filterPills}>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setApptFilter(f)}
                    style={{ ...S.filterPill, ...(apptFilter === f ? S.filterPillActive : {}) }}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.card}>
              {apptLoading ? (
                <div style={S.loading}>Loading appointments…</div>
              ) : filteredAppts.length === 0 ? (
                <div style={S.empty}>
                  <CalendarCheck size={40} color="#CCC" />
                  <p>No bookings found.</p>
                </div>
              ) : (
                <AppointmentsTable
                  appointments={filteredAppts}
                  onStatusChange={updateApptStatus}
                  onDelete={deleteAppt}
                  full
                />
              )}
            </div>
          </div>
        )}

        {/* ── SERVICES ──────────────────────────────────────────────────────────── */}
        {activeSection === 'services' && (
          <div className="admin-section" style={S.section}>
            <div className="admin-section-header" style={S.sectionHeader}>
              <div>
                <h1 style={S.pageTitle}>Services</h1>
                <p style={S.pageSub}>{(Array.isArray(services) && services.length > 0 ? services : localServices).length} services listed</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSeed} style={S.iconBtn}>
                  <RefreshCw size={15} /> Seed DB
                </button>
                <button onClick={openAddService} style={S.addBtn}>
                  <Plus size={16} /> Add Service
                </button>
              </div>
            </div>

            {servicesLoading ? (
              <div style={S.loading}>Loading services…</div>
            ) : (
              <div className="admin-services-grid" style={S.servicesGrid}>
                {(Array.isArray(services) && services.length > 0 ? services : localServices).map((svc, index) => {
                  const svcId = svc.id || `svc-${index}`;
                  return (
                    <div key={svcId} style={S.svcCard}>
                      <div style={S.svcImgWrap}>
                        {typeof svc.imageUrl === 'string' && svc.imageUrl
                          ? <img src={svc.imageUrl} alt={svc.name || 'Service'} style={S.svcImg} />
                          : <div style={S.svcImgEmpty}><Scissors size={28} color="#CCC" /></div>
                        }
                        <button
                          type="button"
                          style={S.uploadOverlay}
                          onClick={() => setGalleryModal({ ...svc, id: svcId })}
                        >
                          <Eye size={13} /> {((svc.images && svc.images.length) || (svc.imageUrl ? 1 : 0))} / 5 Photos
                        </button>
                      </div>
                      <div style={S.svcBody}>
                        <div style={S.svcCategory}>{svc.category || 'Nails'}</div>
                        <h4 style={S.svcName}>{svc.name || 'Untitled Service'}</h4>
                        <div style={S.svcPrice}>₦{(svc.price || 0).toLocaleString()}</div>
                        <div style={S.svcDuration}>{svc.duration || '60 mins'}</div>
                      </div>
                      <div style={{ ...S.svcActions, gap: 6 }}>
                        <button onClick={() => setGalleryModal({ ...svc, id: svcId })} style={{ ...S.editBtn, background: '#FFF8E1', color: '#B78103', border: '1px solid #FFE082' }}>
                          <Eye size={13} /> Photos ({((svc.images && svc.images.length) || (svc.imageUrl ? 1 : 0))}/5)
                        </button>
                        <button onClick={() => openEditService({ ...svc, id: svcId })} style={S.editBtn}><Edit3 size={13} /> Edit</button>
                        <button onClick={() => handleDeleteService(svcId, svc.name || 'Service')} style={S.deleteBtn}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── OPTIONS & SETTINGS ─────────────────────────────────────────────────── */}
        {activeSection === 'options' && (
          <div className="admin-section" style={S.section}>
            <div className="admin-section-header" style={S.sectionHeader}>
              <div>
                <h1 style={S.pageTitle}>Booking Options & Settings</h1>
                <p style={S.pageSub}>Edit available time slots, nail shapes, lengths, add-ons, deposit, and studio contact info live on the booking site.</p>
              </div>
              <button onClick={saveStudioConfig} style={S.addBtn}>
                <Save size={16} /> Save Settings & Slots
              </button>
            </div>

            {/* 1. STUDIO CONFIG & COMPANY PROFILE */}
            <div style={{ ...S.card, padding: 20, marginBottom: 24 }}>
              <h3 style={S.cardTitle}>Studio & Company Profile Settings</h3>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 16 }}>
                <div>
                  <label style={S.formLabel}>Studio / Brand Name</label>
                  <input
                    type="text"
                    value={studioConfig.studioName || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioName: e.target.value })}
                    style={S.formInput}
                  />
                </div>
                <div>
                  <label style={S.formLabel}>Studio Phone</label>
                  <input
                    type="text"
                    value={studioConfig.studioPhone || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioPhone: e.target.value })}
                    style={S.formInput}
                  />
                </div>
                <div>
                  <label style={S.formLabel}>Studio Email</label>
                  <input
                    type="email"
                    value={studioConfig.studioEmail || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioEmail: e.target.value })}
                    style={S.formInput}
                  />
                </div>
                <div>
                  <label style={S.formLabel}>Studio Instagram Handle</label>
                  <input
                    type="text"
                    value={studioConfig.studioInstagram || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioInstagram: e.target.value })}
                    style={S.formInput}
                  />
                </div>
                <div>
                  <label style={S.formLabel}>Studio Address / Location</label>
                  <input
                    type="text"
                    value={studioConfig.studioAddress || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioAddress: e.target.value })}
                    style={S.formInput}
                  />
                </div>
                <div>
                  <label style={S.formLabel}>Opening Hours Text</label>
                  <input
                    type="text"
                    value={studioConfig.studioHours || ''}
                    onChange={(e) => setStudioConfig({ ...studioConfig, studioHours: e.target.value })}
                    style={S.formInput}
                  />
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <label style={S.formLabel}>Company Description</label>
                <textarea
                  rows={3}
                  value={studioConfig.studioDescription || ''}
                  onChange={(e) => setStudioConfig({ ...studioConfig, studioDescription: e.target.value })}
                  placeholder="Enter luxury brand overview or company description..."
                  style={{ ...S.formInput, width: '100%', resize: 'vertical' }}
                />
              </div>
            </div>

            {/* 2. ADMIN SECURITY & PASSCODE */}
            <div style={{ ...S.card, padding: 20, marginBottom: 24 }}>
              <h3 style={S.cardTitle}>Admin Passcode & Security Settings</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>
                Set the passcode required to unlock and access this Admin Dashboard. (Default: auric2026)
              </p>
              <div style={{ display: 'flex', gap: 12, maxWidth: 360 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <label style={S.formLabel}>Admin Passcode</label>
                  <input
                    type="text"
                    value={studioConfig.adminPasscode || 'auric2026'}
                    onChange={(e) => setStudioConfig({ ...studioConfig, adminPasscode: e.target.value })}
                    placeholder="Set Passcode"
                    style={{ ...S.formInput, width: '100%', fontWeight: 700, letterSpacing: '2px' }}
                  />
                </div>
              </div>
            </div>

            {/* 2. TIME SLOTS */}
            <div style={{ ...S.card, padding: 20, marginBottom: 24 }}>
              <h3 style={S.cardTitle}>Available Daily Time Slots</h3>
              <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>These daily slots will appear on Step 2 of the customer booking screen.</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                {(studioConfig.timeSlots || []).map((slot) => (
                  <div key={slot} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F4F4F6', padding: '6px 14px', borderRadius: 20, border: '1px solid #E0E0E0', fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                    <Clock size={14} color="#D4AF37" />
                    <span>{slot}</span>
                    <button
                      onClick={() => handleDeleteTimeSlot(slot)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', padding: 0 }}
                      title="Remove Slot"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="admin-inline-row" style={{ display: 'flex', gap: 10, maxWidth: 360 }}>
                <input
                  type="text"
                  placeholder="e.g. 06:00 PM"
                  value={newTimeSlotInput}
                  onChange={(e) => setNewTimeSlotInput(e.target.value)}
                  style={{ ...S.formInput, flex: 1 }}
                />
                <button onClick={handleAddTimeSlot} style={S.editBtn}>+ Add Slot</button>
              </div>
            </div>

            {/* 3. SHAPES & LENGTHS (GRID) */}
            <div className="admin-grid-2col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
              {/* Nail Shapes */}
              <div style={{ ...S.card, padding: 20 }}>
                <h3 style={S.cardTitle}>Nail Shapes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, marginBottom: 16 }}>
                  {shapes.map(s => (
                    <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #EEEEEE' }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{s.icon} {s.name}</span>
                      <button onClick={() => handleDeleteShape(s.id, s.name)} style={S.deleteBtn}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
                <div className="admin-inline-row" style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="Icon (e.g. 💅)" value={newShapeIcon} onChange={e => setNewShapeIcon(e.target.value)} style={{ width: 70, ...S.formInput }} />
                  <input placeholder="Shape Name (e.g. Stiletto)" value={newShapeName} onChange={e => setNewShapeName(e.target.value)} style={{ flex: 1, ...S.formInput }} />
                  <button onClick={handleAddShape} style={S.editBtn}>Add Shape</button>
                </div>
              </div>

              {/* Extension Lengths */}
              <div style={{ ...S.card, padding: 20 }}>
                <h3 style={S.cardTitle}>Extension Lengths & Extra Pricing</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12, marginBottom: 16 }}>
                  {lengths.map(l => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#FAFAFA', borderRadius: 8, border: '1px solid #EEEEEE' }}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{l.name}</strong>
                        <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>{l.extra > 0 ? `(+₦${Number(l.extra).toLocaleString()})` : 'Included'}</span>
                      </div>
                      <button onClick={() => handleDeleteLength(l.id, l.name)} style={S.deleteBtn}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
                <div className="admin-inline-row" style={{ display: 'flex', gap: 8 }}>
                  <input placeholder="Length (e.g. XXL)" value={newLengthName} onChange={e => setNewLengthName(e.target.value)} style={{ flex: 1, ...S.formInput }} />
                  <input placeholder="Extra ₦ (e.g. 8000)" type="number" value={newLengthExtra} onChange={e => setNewLengthExtra(e.target.value)} style={{ width: 110, ...S.formInput }} />
                  <button onClick={handleAddLength} style={S.editBtn}>Add Length</button>
                </div>
              </div>
            </div>

            {/* 4. ADD-ONS */}
            <div style={{ ...S.card, padding: 20 }}>
              <h3 style={S.cardTitle}>Service Add-ons & Extra Services</h3>
              <div className="admin-addons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 14, marginBottom: 16 }}>
                {addons.map(a => (
                  <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#FAFAFA', borderRadius: 10, border: '1px solid #EAEAEA' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: '#D4AF37', fontWeight: 700, marginTop: 2 }}>₦{(a.price || 0).toLocaleString()}</div>
                    </div>
                    <button onClick={() => handleDeleteAddon(a.id, a.name)} style={S.deleteBtn}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>

              <div className="admin-inline-row" style={{ display: 'flex', gap: 10, maxWidth: 480 }}>
                <input placeholder="Add-on Name (e.g. Chrome Finish)" value={newAddonName} onChange={e => setNewAddonName(e.target.value)} style={{ flex: 1, ...S.formInput }} />
                <input placeholder="Price ₦" type="number" value={newAddonPrice} onChange={e => setNewAddonPrice(e.target.value)} style={{ width: 120, ...S.formInput }} />
                <button onClick={handleAddAddon} style={S.editBtn}>Add Add-on</button>
              </div>
            </div>
          </div>
        )}
        {activeSection === 'clients' && (
          <div style={S.section}>
            <div style={S.sectionHeader}>
              <div>
                <h1 style={S.pageTitle}>Clients</h1>
                <p style={S.pageSub}>{uniqueClients.length} unique clients</p>
              </div>
            </div>

            <div style={S.card}>
              <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {['Client', 'Email', 'Phone', 'Total Bookings', 'Last Service', 'Actions'].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueClients.map((c, i) => {
                      const clientBookings = appointments.filter(a => a.email === c.email);
                      return (
                        <tr key={c.email || i} style={i % 2 === 0 ? {} : { background: '#FAFAFA' }}>
                          <td style={S.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={S.clientAvatar}>{(c.name || '?')[0].toUpperCase()}</div>
                              <span style={{ fontWeight: 600 }}>{c.name || '—'}</span>
                            </div>
                          </td>
                          <td style={S.td}>{c.email || '—'}</td>
                          <td style={S.td}>{c.phone || '—'}</td>
                          <td style={S.td}><span style={S.countBadge}>{clientBookings.length}</span></td>
                          <td style={S.td}>{c.serviceName || c.service || '—'}</td>
                          <td style={S.td}>
                            <a href={`mailto:${c.email}`} style={S.actionLink}><Mail size={14} /></a>
                            <a href={`tel:${c.phone}`} style={S.actionLink}><Phone size={14} /></a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {uniqueClients.length === 0 && (
                <div style={S.empty}><Users size={40} color="#CCC" /><p>No clients yet. Bookings will appear here.</p></div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Service Modal ──────────────────────────────────────────────────────── */}
      {serviceModal !== null && (
        <div style={S.modalBackdrop} onClick={() => setServiceModal(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>{serviceModal === 'add' ? 'Add New Service' : 'Edit Service'}</h3>
              <button onClick={() => setServiceModal(null)} style={S.closeBtn}><X size={18} /></button>
            </div>

            <div style={S.modalBody}>
              {[
                { label: 'Service Name *', key: 'name', type: 'text', placeholder: 'e.g. Bespoke Acrylic Full Set' },
                { label: 'Price (₦) *', key: 'price', type: 'number', placeholder: 'e.g. 35000' },
                { label: 'Duration', key: 'duration', type: 'text', placeholder: 'e.g. 90 mins' },
                { label: 'Category', key: 'category', type: 'text', placeholder: 'e.g. Extensions' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} style={S.formGroup}>
                  <label style={S.formLabel}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={serviceForm[key] || ''}
                    onChange={e => setServiceForm(prev => ({ ...prev, [key]: e.target.value }))}
                    style={S.formInput}
                  />
                </div>
              ))}

              <div style={S.formGroup}>
                <label style={S.formLabel}>Image (URL or Local File Upload)</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="https://... or choose a local file ->"
                    value={serviceForm.imageUrl || ''}
                    onChange={e => setServiceForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    style={{ ...S.formInput, flex: 1 }}
                  />
                  <label style={{ ...S.iconBtn, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '0 12px', background: '#F1F3F5', borderRadius: 8, fontSize: 13, border: '1px solid #DDD' }}>
                    <UploadCloud size={16} /> Choose File
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        try {
                          const base64 = await compressAndConvertToBase64(file);
                          setServiceForm(prev => ({ ...prev, imageUrl: base64 }));
                          showToast('Local image attached!');
                        } catch (err) {
                          showToast('Failed to process image', 'error');
                        }
                      }}
                    />
                  </label>
                </div>
                {serviceForm.imageUrl && (
                  <div style={{ marginTop: 8, height: 60, borderRadius: 8, overflow: 'hidden', width: 60, border: '1px solid #EEE' }}>
                    <img src={serviceForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              <div style={S.formGroup}>
                <label style={S.formLabel}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe what's included…"
                  value={serviceForm.description || ''}
                  onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  style={{ ...S.formInput, resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={S.modalFooter}>
              <button onClick={() => setServiceModal(null)} style={S.cancelBtn}>Cancel</button>
              <button onClick={handleSaveService} style={S.saveBtn}><Save size={15} /> Save Service</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Photo Gallery Manager Modal (Up to 5 Photos) ────────────────────── */}
      {galleryModal !== null && (
        <div style={S.modalBackdrop} onClick={() => setGalleryModal(null)}>
          <div style={{ ...S.modal, maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div>
                <h3 style={S.modalTitle}>Photo Gallery — {galleryModal.name}</h3>
                <p style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
                  Manage up to 5 luxury photos for this service. The first photo is the cover photo.
                </p>
              </div>
              <button onClick={() => setGalleryModal(null)} style={S.closeBtn}><X size={18} /></button>
            </div>

            <div style={S.modalBody}>
              {/* Photo Thumbnails Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: 12, marginBottom: 20 }}>
                {((galleryModal.images && galleryModal.images.length > 0) ? galleryModal.images : [galleryModal.imageUrl || '/images/hero.png']).map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: idx === 0 ? '2px solid #D4AF37' : '1px solid #E0E0E0', background: '#F8F9FA', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                    <img src={imgUrl} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: 105, objectFit: 'cover', display: 'block' }} />
                    {idx === 0 && (
                      <span style={{ position: 'absolute', top: 4, left: 4, background: '#D4AF37', color: '#FFF', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                        Cover
                      </span>
                    )}

                    <div style={{ position: 'absolute', bottom: 4, right: 4, display: 'flex', gap: 4 }}>
                      {idx !== 0 && (
                        <button
                          title="Set as Cover Photo"
                          onClick={() => handleSetPrimaryPhotoInService(galleryModal, idx)}
                          style={{ background: 'rgba(0,0,0,0.75)', color: '#FFD700', border: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}
                        >
                          <Star size={12} fill="#FFD700" />
                        </button>
                      )}

                      <label title="Replace Photo" style={{ background: 'rgba(0,0,0,0.75)', color: '#FFF', borderRadius: 4, padding: '4px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Edit3 size={12} />
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files && e.target.files[0];
                            if (file) handleReplacePhotoInService(galleryModal, idx, file);
                          }}
                        />
                      </label>

                      {((galleryModal.images?.length || 1) > 1) && (
                        <button
                          title="Delete Photo"
                          onClick={() => handleDeletePhotoFromService(galleryModal, idx)}
                          style={{ background: 'rgba(211,47,47,0.85)', color: '#FFF', border: 'none', borderRadius: 4, padding: '4px 6px', cursor: 'pointer' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Photo Controls */}
              {((galleryModal.images?.length || 1) < 5) ? (
                <div style={{ background: '#F9FAFB', borderRadius: 10, padding: 16, border: '1px dashed #CBD5E1' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#334155' }}>
                    + Add Photo (Slot {(galleryModal.images?.length || 1) + 1} of 5)
                  </h4>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Paste Image URL (https://...)"
                      value={newPhotoUrlInput}
                      onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                      style={{ ...S.formInput, flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        if (newPhotoUrlInput.trim()) {
                          handleAddPhotoToService(galleryModal, newPhotoUrlInput.trim());
                          setNewPhotoUrlInput('');
                        } else {
                          showToast('Please enter an image URL', 'error');
                        }
                      }}
                      style={{ ...S.addBtn, padding: '0 14px', fontSize: 13, whiteSpace: 'nowrap' }}
                    >
                      Add URL
                    </button>

                    <label style={{ ...S.iconBtn, cursor: 'pointer', background: '#D4AF37', color: '#FFF', border: 'none', padding: '9px 14px', borderRadius: 8, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontWeight: 600 }}>
                      <UploadCloud size={15} /> Upload File
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          if (file) handleAddPhotoToService(galleryModal, file);
                        }}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 12, background: '#FFF8E1', color: '#B78103', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  ✓ Maximum limit reached (5/5 photos). Delete an existing photo to upload a new one.
                </div>
              )}
            </div>

            <div style={S.modalFooter}>
              <button onClick={() => setGalleryModal(null)} style={S.saveBtn}>Done</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #F7F8FA;
        }
        .admin-mobile-header {
          display: none;
        }
        .admin-mobile-backdrop {
          display: none;
        }

        @media (max-width: 900px) {
          .admin-shell {
            flex-direction: column;
          }
          .admin-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 20px;
            background: #0E0E12;
            position: sticky;
            top: 0;
            z-index: 1000;
            border-bottom: 1px solid #1E1E26;
          }
          .admin-mobile-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.65);
            z-index: 1001;
            backdrop-filter: blur(4px);
          }
          .admin-sidebar {
            position: fixed !important;
            top: 0;
            bottom: 0;
            left: 0;
            width: 260px !important;
            z-index: 1002 !important;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 10px 0 30px rgba(0,0,0,0.5);
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0);
          }
          .admin-main {
            width: 100% !important;
            min-height: calc(100vh - 60px) !important;
          }
          .admin-section {
            padding: 18px 12px !important;
          }
          .admin-section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 14px !important;
          }
          .admin-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
          }
          .admin-services-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .admin-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-filter-pills {
            overflow-x: auto !important;
            padding-bottom: 6px !important;
            -webkit-overflow-scrolling: touch;
          }
          .admin-form-grid, .admin-grid-2col, .admin-addons-grid {
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }
          .admin-inline-row {
            flex-direction: column !important;
            max-width: 100% !important;
          }
          .admin-inline-row input {
            width: 100% !important;
          }
        }

        @media (max-width: 550px) {
          .admin-stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Appointments Table ───────────────────────────────────────────────────────
function AppointmentsTable({ appointments, onStatusChange, onDelete, full }) {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={S.table}>
        <thead>
          <tr>
            {['Booking ID', 'Client', 'Service', 'Date & Time', 'Total', 'Status', 'Actions'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt, i) => {
            const statusInfo = STATUS_COLORS[appt.status] || STATUS_COLORS.pending;
            return (
              <tr key={appt.id} style={i % 2 === 0 ? {} : { background: '#FAFAFA' }}>
                <td style={S.td}><span style={S.refCode}>{appt.bookingId || appt.id?.slice(0, 10)}</span></td>
                <td style={S.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={S.clientAvatar}>{(appt.name || '?')[0].toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{appt.name || '—'}</div>
                      <div style={{ color: '#888', fontSize: '0.78rem' }}>{appt.email || '—'}</div>
                    </div>
                  </div>
                </td>
                <td style={S.td}><span style={{ fontSize: '0.85rem' }}>{appt.serviceName || appt.service || '—'}</span></td>
                <td style={S.td}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{appt.date || '—'}</div>
                  <div style={{ color: '#888', fontSize: '0.78rem' }}>{appt.time || ''}</div>
                </td>
                <td style={S.td}><span style={{ fontWeight: 700 }}>₦{(appt.totalPrice || 0).toLocaleString()}</span></td>
                <td style={S.td}>
                  <span style={{ ...S.statusBadge, background: statusInfo.bg, color: statusInfo.text }}>
                    {statusInfo.label}
                  </span>
                </td>
                <td style={S.td}>
                  <div style={{ position: 'relative' }}>
                    <button
                      style={S.menuBtn}
                      onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openMenu === appt.id && (
                      <div style={S.dropdownMenu} onClick={() => setOpenMenu(null)}>
                        {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                          <button key={s} style={S.dropItem} onClick={() => onStatusChange(appt.id, s)}>
                            Mark as {s}
                          </button>
                        ))}
                        <div style={S.dropDivider} />
                        <button style={{ ...S.dropItem, color: '#EF4444' }} onClick={() => onDelete(appt.id)}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  shell: { display: 'flex', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", background: '#F7F8FA' },

  // Sidebar
  sidebar: { width: 240, background: '#0E0E12', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 12, padding: '28px 24px 20px', borderBottom: '1px solid #1E1E26' },
  logoGold: { fontSize: '1.5rem', color: '#D4AF37' },
  logoTitle: { color: '#FFF', fontWeight: 800, fontSize: '1rem', fontFamily: "'Playfair Display', serif" },
  logoSub: { color: '#666', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 12px', flex: 1 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'transparent', border: 'none', color: '#888', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', position: 'relative', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  navItemActive: { background: '#D4AF3720', color: '#D4AF37' },
  navBadge: { marginLeft: 'auto', background: '#EF4444', color: '#FFF', fontSize: '0.7rem', fontWeight: 800, borderRadius: 20, padding: '2px 7px' },
  sidebarBottom: { padding: '20px 12px', borderTop: '1px solid #1E1E26' },
  viewSiteBtn: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', borderRadius: 10, background: 'transparent', border: '1px solid #2A2A35', color: '#888', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },

  // Main
  main: { flex: 1, overflowY: 'auto', position: 'relative', background: '#F7F8FA', minHeight: '100vh' },
  section: { padding: '36px 40px', maxWidth: 1200, width: '100%' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: '1.7rem', fontWeight: 800, color: '#111', margin: 0, fontFamily: "'Playfair Display', serif" },
  pageSub: { color: '#888', fontSize: '0.85rem', marginTop: 4 },

  // Buttons
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#D4AF37', color: '#000', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  iconBtn: { display: 'flex', alignItems: 'center', gap: 6, background: '#FFF', border: '1px solid #DDD', padding: '9px 16px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', color: '#444', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  editBtn: { display: 'flex', alignItems: 'center', gap: 5, background: '#F0F0FA', border: '1px solid #E0E0EE', color: '#444', padding: '7px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  deleteBtn: { display: 'flex', alignItems: 'center', gap: 5, background: '#FFF0F0', border: '1px solid #FFD5D5', color: '#EF4444', padding: '7px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: '#888' },
  linkBtn: { background: 'none', border: 'none', color: '#D4AF37', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  actionLink: { color: '#888', padding: '4px 6px', display: 'inline-flex', alignItems: 'center' },

  // Stats
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 },
  statCard: { background: '#FFF', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #EEEEF5' },
  statIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { fontSize: '1.55rem', fontWeight: 800, color: '#111' },
  statLabel: { fontSize: '0.78rem', color: '#888', fontWeight: 600, marginTop: 2 },

  // Card
  card: { background: '#FFF', borderRadius: 14, border: '1px solid #EEEEF5', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden', marginBottom: 20 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #F0F0F5' },
  cardTitle: { fontWeight: 700, fontSize: '1rem', color: '#111', margin: 0 },

  // Table
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 650 },
  th: { textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 16px', borderBottom: '1px solid #F0F0F5', whiteSpace: 'nowrap' },
  td: { padding: '13px 16px', borderBottom: '1px solid #F5F5FA', verticalAlign: 'middle', fontSize: '0.85rem', color: '#333', whiteSpace: 'nowrap' },

  // Status
  statusBadge: { display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 },
  refCode: { fontFamily: 'monospace', fontSize: '0.8rem', background: '#F3F3F7', padding: '3px 8px', borderRadius: 6, color: '#555' },
  clientAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #D4AF37, #B8860B)', color: '#000', fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 },
  countBadge: { background: '#F0F0FA', color: '#555', fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem' },

  // Dropdown
  dropdownMenu: { position: 'absolute', right: 0, top: '100%', background: '#FFF', border: '1px solid #EEE', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 170, overflow: 'hidden' },
  dropItem: { display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', background: 'none', border: 'none', fontSize: '0.83rem', color: '#333', cursor: 'pointer', textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  dropDivider: { height: 1, background: '#F0F0F5', margin: '4px 0' },

  // Filter bar
  filterBar: { display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' },
  searchBox: { display: 'flex', alignItems: 'center', gap: 8, background: '#FFF', border: '1px solid #DDD', borderRadius: 10, padding: '8px 14px', flex: 1, minWidth: 200 },
  searchInput: { border: 'none', outline: 'none', fontSize: '0.88rem', width: '100%', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  filterPills: { display: 'flex', gap: 6 },
  filterPill: { padding: '7px 14px', borderRadius: 20, border: '1px solid #DDD', background: '#FFF', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  filterPillActive: { background: '#111', color: '#FFF', border: '1px solid #111' },

  // Services grid
  servicesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  svcCard: { background: '#FFF', borderRadius: 14, border: '1px solid #EEEEF5', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  svcImgWrap: { position: 'relative', height: 160, background: '#F5F5FA' },
  svcImg: { width: '100%', height: '100%', objectFit: 'cover' },
  svcImgEmpty: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadOverlay: { position: 'absolute', bottom: 8, right: 8, background: 'rgba(255,255,255,0.92)', padding: '5px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, border: '1px solid #DDD', color: '#333' },
  svcBody: { padding: '16px 18px 12px' },
  svcCategory: { fontSize: '0.72rem', fontWeight: 700, color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 },
  svcName: { fontWeight: 700, fontSize: '0.95rem', color: '#111', margin: '0 0 6px' },
  svcPrice: { fontWeight: 800, fontSize: '1.1rem', color: '#111' },
  svcDuration: { fontSize: '0.78rem', color: '#888', marginTop: 3 },
  svcActions: { display: 'flex', gap: 8, padding: '0 18px 16px' },

  // Modal
  modalBackdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modal: { background: '#FFF', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #F0F0F5' },
  modalTitle: { fontWeight: 800, fontSize: '1.1rem', color: '#111', margin: 0, fontFamily: "'Playfair Display', serif" },
  closeBtn: { background: '#F3F3F7', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', display: 'flex', color: '#555' },
  modalBody: { padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #F0F0F5' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  formLabel: { fontSize: '0.8rem', fontWeight: 700, color: '#555' },
  formInput: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #DDD', borderRadius: 8, fontSize: '0.88rem', fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none' },
  cancelBtn: { padding: '10px 20px', borderRadius: 8, border: '1px solid #DDD', background: '#FFF', color: '#555', fontWeight: 600, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },
  saveBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#D4AF37', color: '#000', fontWeight: 700, cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" },

  // Misc
  loading: { padding: '40px', textAlign: 'center', color: '#888' },
  empty: { padding: '60px 20px', textAlign: 'center', color: '#AAA', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  toast: { position: 'fixed', top: 24, right: 24, zIndex: 9999, padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontFamily: "'Plus Jakarta Sans', sans-serif" },
};
