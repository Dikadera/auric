import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Mail,
  CheckCircle2,
  ChevronLeft,
  User,
  FileText,
  Download,
  AlertCircle,
  X
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import Preloader from './Preloader';

export default function SimpleBookingWidget() {
  const [step, setStep] = useState('services'); // 'services' | 'datetime' | 'details' | 'confirmation'
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Customization Collections from Firestore
  const [shapesList, setShapesList] = useState([]);
  const [lengthsList, setLengthsList] = useState([]);
  const [artTiersList, setArtTiersList] = useState([]);
  const [addonsList, setAddonsList] = useState([]);
  const [timeSlotsList, setTimeSlotsList] = useState(['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM']);
  const [depositAmount, setDepositAmount] = useState(10000);
  const [studioConfig, setStudioConfig] = useState({
    studioName: 'Auric Nails',
    studioPhone: '+234 800 123 4567',
    studioEmail: 'hello@auricnails.com',
    studioInstagram: '@auricc_nails',
    studioAddress: 'Lekki Phase 1, Lagos, Nigeria',
    studioHours: 'Opens today at 10:00 AM',
    studioDescription: 'Auric Nails (@auricc_nails) is your luxury escape for bespoke nail beauty and care. We specialize in clean, liquid gold chrome, gel-x, acrylic extensions, and long-wear BIAB overlays.'
  });

  // Selected Options
  const [selectedService, setSelectedService] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  const [selectedLength, setSelectedLength] = useState(null);
  const [selectedArtTier, setSelectedArtTier] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);


  // Automatic Price & Discount Calculations
  const subtotalPrice = (selectedService ? Number(selectedService.price) || 0 : 0) +
    (selectedShape ? Number(selectedShape.price) || 0 : 0) +
    (selectedLength ? Number(selectedLength.extra || selectedLength.price) || 0 : 0) +
    (selectedArtTier ? Number(selectedArtTier.price) || 0 : 0) +
    selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0);

  const discountDeduction = studioConfig.discountEnabled
    ? (studioConfig.discountType === 'fixed'
      ? Math.min(subtotalPrice, Number(studioConfig.discountValue) || 0)
      : Math.round((subtotalPrice * (Number(studioConfig.discountValue) || 0)) / 100))
    : 0;

  const totalPrice = Math.max(0, subtotalPrice - discountDeduction);

  // Dynamic Upcoming Dates Generator
  const getDynamicUpcomingDates = () => {
    const dates = [];
    const today = new Date();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = daysOfWeek[d.getDay()];
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const iso = d.toISOString().split('T')[0];
      dates.push({
        day: dayName,
        date: dayNum,
        month: monthName,
        full: iso,
        label: `${dayName}, ${monthName} ${dayNum}, ${year}`
      });
    }
    return dates;
  };

  // WhatsApp and Phone Helper Generators
  const getFormattedWhatsAppUrl = (phoneInput) => {
    const defaultNum = '2347087490482';
    if (!phoneInput) return `https://wa.me/${defaultNum}`;
    let digits = String(phoneInput).replace(/@/g, '').replace(/[^0-9]/g, '');
    if (digits.startsWith('0') && digits.length === 11) {
      digits = '234' + digits.slice(1);
    } else if (digits.startsWith('0') && digits.length === 10) {
      digits = '234' + digits;
    }
    if (!digits || digits.length < 5) {
      digits = defaultNum;
    }
    return `https://wa.me/${digits}`;
  };

  const getFormattedTelUrl = (phoneInput) => {
    if (!phoneInput) return 'tel:+2347087490482';
    let clean = String(phoneInput).replace(/@/g, '').trim();
    if (!clean.startsWith('+') && clean.startsWith('0') && clean.length === 11) {
      clean = '+234' + clean.slice(1);
    }
    return `tel:${clean.replace(/\s+/g, '')}`;
  };

  const dynamicDates = getDynamicUpcomingDates();
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(dynamicDates[0]?.full || todayISO);
  const [selectedTime, setSelectedTime] = useState(timeSlotsList[0] || '10:30 AM');

  // Real-time Firestore Listeners for Services, Shapes, Lengths, Art Tiers, Addons & Studio Config
  useEffect(() => {
    // Services Listener
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (!snap.empty) {
        const srvs = snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Nail Service',
            price: Number(data.price) || 0,
            duration: data.duration || '60 mins',
            description: data.description || '',
            category: data.category || 'Nails',
            imageUrl: data.imageUrl || '/images/hero.png',
            ...data
          };
        });
        if (srvs.length > 0) setServices(srvs);
      }
      setLoadingServices(false);
    }, (err) => console.warn('Services listener err:', err));

    // Shapes Listener
    const unsubShapes = onSnapshot(collection(db, 'shapes'), (snap) => {
      if (!snap.empty) {
        const shapes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setShapesList(shapes);
      }
    }, (err) => console.warn('Shapes listener err:', err));

    // Lengths Listener
    const unsubLengths = onSnapshot(collection(db, 'lengths'), (snap) => {
      if (!snap.empty) {
        const lengths = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLengthsList(lengths);
      }
    }, (err) => console.warn('Lengths listener err:', err));

    // Art Tiers Listener
    const unsubArt = onSnapshot(collection(db, 'artTiers'), (snap) => {
      if (!snap.empty) {
        const tiers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setArtTiersList(tiers);
      }
    }, (err) => console.warn('Art Tiers listener err:', err));

    // Addons Listener
    const unsubAddons = onSnapshot(collection(db, 'addons'), (snap) => {
      if (!snap.empty) {
        const addons = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (addons.length > 0) {
          setAddonsList(addons);
        }
      }
    }, (err) => console.warn('Addons listener err:', err));

    // Studio Config Listener
    const unsubConfig = onSnapshot(doc(db, 'settings', 'studioConfig'), (snap) => {
      if (snap.exists()) {
        const cData = snap.data();
        if (cData.shapesList && Array.isArray(cData.shapesList) && cData.shapesList.length > 0) {
          setShapesList(cData.shapesList);
        }
        if (cData.lengthsList && Array.isArray(cData.lengthsList) && cData.lengthsList.length > 0) {
          setLengthsList(cData.lengthsList);
        }
        if (cData.artTiersList && Array.isArray(cData.artTiersList) && cData.artTiersList.length > 0) {
          setArtTiersList(cData.artTiersList);
        }
        if (cData.addonsList && Array.isArray(cData.addonsList) && cData.addonsList.length > 0) {
          setAddonsList(cData.addonsList);
        }
        if (cData.timeSlots && cData.timeSlots.length > 0) {
          setTimeSlotsList(cData.timeSlots);
        }
        if (cData.depositAmount !== undefined) {
          setDepositAmount(Number(cData.depositAmount));
        }
        setStudioConfig(prev => ({ ...prev, ...cData }));
      }
    }, (err) => console.warn('Studio Config listener err:', err));

    return () => {
      unsubServices();
      unsubShapes();
      unsubLengths();
      unsubArt();
      unsubAddons();
      unsubConfig();
    };
  }, []);

  // Client Intake Form
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const [bookingId, setBookingId] = useState('');

  const availableDates = [
    { day: 'Tue', date: '15', full: '2026-09-15' },
    { day: 'Wed', date: '16', full: '2026-09-16' },
    { day: 'Thu', date: '17', full: '2026-09-17' },
    { day: 'Fri', date: '18', full: '2026-09-18' },
    { day: 'Sat', date: '19', full: '2026-09-19' }
  ];

  const availableTimeSlots = [
    '09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'
  ];

  const handleSelectService = (service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleProceedToDetails = () => {
    setStep('details');
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      alert('Please complete all required fields.');
      return;
    }
    const newId = `AURIC-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(newId);

    // Save booking to Firestore
    try {
      await addDoc(collection(db, 'bookings'), {
        bookingId: newId,
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
        notes: clientInfo.notes,
        date: selectedDate,
        time: selectedTime,
        serviceName: selectedService?.name,
        serviceId: selectedService?.id,
        shape: selectedShape?.name || 'None / Natural',
        length: selectedLength?.name || 'None / Natural',
        artTier: selectedArtTier?.name || 'None / Plain',
        addons: selectedAddons.map(a => a.name),
        subtotalPrice: subtotalPrice,
        discountApplied: studioConfig.discountEnabled || false,
        discountDeduction: discountDeduction,
        totalPrice: totalPrice,
        deposit: 0,
        paymentStatus: 'pay_at_studio',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to save booking:', err);
    }

    setStep('confirmation');
  };

  const downloadReceipt = () => {
    const content = `
==============================================
          AURIC NAILS (@auricc_nails)
         APPOINTMENT BOOKING SLIP
==============================================
Ref ID:         ${bookingId}
Client:         ${clientInfo.name}
Email:          ${clientInfo.email}
Phone:          ${clientInfo.phone}

Date:           ${selectedDate}
Time:           ${selectedTime}

Service:        ${selectedService?.name} (₦${(selectedService?.price || 0).toLocaleString()})
Shape:          ${selectedShape?.name || 'None / Natural'}
Length:         ${selectedLength?.name || 'None / Natural'} (+₦${(selectedLength?.extra || 0).toLocaleString()})
Art Level:      ${selectedArtTier?.name || 'None / Plain'} (+₦${(selectedArtTier?.price || 0).toLocaleString()})
Add-ons:        ${selectedAddons.map(a => a.name).join(', ') || 'None'}

Subtotal:       ₦${subtotalPrice.toLocaleString()}
${appliedPromo ? `Discount:       -₦${discountDeduction.toLocaleString()} (Promo: ${appliedPromo.code})\n` : ''}Total Amount:   ₦${totalPrice.toLocaleString()}
Payment Terms:  Pay at Studio after appointment (No Deposit Required)

Location: ${studioConfig.studioAddress || 'Lekki Phase 1, Lagos, Nigeria'}
Instagram: ${studioConfig.studioInstagram || '@auricc_nails'}
==============================================
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `AuricNails_Receipt_${bookingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  if (loadingServices) {
    return <Preloader />;
  }

  return (
    <div className="widget-wrapper">
      {/* Top Navbar */}
      <header className="app-navbar">
        <a href="/" className="nav-brand">
          <div className="nav-logo-circle">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="nav-brand-title">AURIC NAILS</div>
            <div className="nav-brand-sub">BESPOKE STUDIO</div>
          </div>
        </a>

        <nav className="nav-links">
          <button
            onClick={() => setStep('services')}
            className={`nav-item-link ${step === 'services' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Sparkles size={15} />
            <span className="nav-item-text">Services</span>
          </button>
          <a
            href={`https://instagram.com/${(studioConfig.studioInstagram || '@auricc_nails').replace('@', '').trim()}`}
            target="_blank"
            rel="noreferrer"
            className="nav-item-link"
          >
            <Instagram size={15} />
            <span className="nav-item-text">{studioConfig.studioInstagram || '@auricc_nails'}</span>
          </a>
          <a
            href={getFormattedWhatsAppUrl(studioConfig.studioPhone)}
            target="_blank"
            rel="noreferrer"
            className="nav-item-link"
          >
            <MessageCircle size={15} />
            <span className="nav-item-text">WhatsApp</span>
          </a>
        </nav>
      </header>

      {/* ── TOP PROMO ANNOUNCEMENT BANNER ───────────────────────────────────── */}
      {studioConfig.discountEnabled && (
        <div style={{
          background: 'linear-gradient(90deg, #9F1239 0%, #BE185D 40%, #EC4899 75%, #D4AF37 100%)',
          color: '#FFFFFF',
          padding: '11px 18px',
          borderRadius: 14,
          marginBottom: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 4px 16px rgba(236,72,153,0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={16} color="#FFF" />
            </div>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              🎉 SPECIAL PROMO ACTIVE: Save {studioConfig.discountType === 'fixed' ? `₦${(studioConfig.discountValue || 0).toLocaleString()} OFF` : `${studioConfig.discountValue || 0}% OFF`} your entire booking! {studioConfig.discountDescription && `— ${studioConfig.discountDescription}`}
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: 20, fontWeight: 800, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}>

          </span>
        </div>
      )}

      <div className="booking-widget-card">
        {/* LEFT COLUMN: BOOKING FLOW */}
        <div className="widget-left-pane">
          {/* Header Bar */}
          <div className="widget-header">
            {step !== 'services' && step !== 'confirmation' && (
              <button
                onClick={() => setStep(step === 'details' ? 'datetime' : 'services')}
                className="widget-back-btn"
              >
                <ChevronLeft size={18} /> Back
              </button>
            )}
            <h2 className="widget-title">
              {step === 'services' && 'Book Your Appointment'}
              {step === 'datetime' && 'Select Date & Customization'}
              {step === 'details' && 'Enter Client Details'}
              {step === 'confirmation' && 'Booking Confirmed!'}
            </h2>
          </div>

          {/* STEP 1: SERVICES LIST */}
          {step === 'services' && (
            <div>
              {loadingServices ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 14 }}>
                  <div style={{ width: 36, height: 36, border: '3px solid rgba(212,175,55,0.2)', borderTop: '3px solid #D4AF37', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <span style={{ color: '#475569', fontSize: '0.88rem', fontWeight: 600 }}>Loading Auric Studio Services…</span>
                </div>
              ) : services.length > 0 ? (
                <div>
                  {/* Step 1 Promo Discount Notice */}
                  {studioConfig.discountEnabled && (
                    <div style={{
                      background: 'linear-gradient(135deg, #FFF1F2 0%, #FDF2F8 100%)',
                      border: '1.5px solid #F472B6',
                      borderRadius: 14,
                      padding: '12px 16px',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 2px 10px rgba(244,114,182,0.12)'
                    }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #EC4899, #BE185D)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                        %
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '0.88rem', color: '#BE185D', display: 'block', fontWeight: 800 }}>
                          ✨ Studio Promotion ({studioConfig.discountType === 'fixed' ? `₦${(studioConfig.discountValue || 0).toLocaleString()} OFF` : `${studioConfig.discountValue || 0}% OFF`})
                        </strong>
                        <p style={{ fontSize: '0.78rem', color: '#9F1239', margin: '1px 0 0 0' }}>
                          {studioConfig.discountDescription || 'Discount will automatically be deducted from your total checkout!'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="services-list">
                    {services.map((srv) => {
                      const serviceDiscount = studioConfig.discountEnabled
                        ? (studioConfig.discountType === 'fixed'
                          ? Math.min(srv.price || 0, studioConfig.discountValue || 0)
                          : Math.round((srv.price || 0) * ((studioConfig.discountValue || 0) / 100)))
                        : 0;
                      const discountedPrice = Math.max(0, (srv.price || 0) - serviceDiscount);

                      return (
                        <div key={srv.id} className="service-row-item">
                          <div
                            className="srv-img-box"
                            onClick={() => { setPreviewPhotos(srv); setActivePhotoIdx(0); }}
                            title="Click to view all photos for this set"
                            style={{ cursor: 'pointer', position: 'relative' }}
                          >
                            <img
                              src={srv.imageUrl || (srv.id.includes('acrylic') ? '/images/hero.png' : srv.id.includes('gelx') ? '/images/chrome.png' : '/images/charms.png')}
                              alt={srv.name}
                            />
                            {((srv.images?.length || 1) > 1) && (
                              <span style={{ position: 'absolute', bottom: 4, right: 4, background: 'rgba(0,0,0,0.7)', color: '#FFF', fontSize: 10, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>
                                📷 {srv.images.length}
                              </span>
                            )}
                          </div>

                          <div className="srv-info">
                            <h3 className="srv-title">{srv.name}</h3>
                            <p className="srv-desc">{srv.description}</p>
                            <div className="srv-meta">
                              {studioConfig.discountEnabled && serviceDiscount > 0 ? (
                                <span className="meta-price" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <s style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>₦{(srv.price || 0).toLocaleString()}</s>
                                  <span style={{ color: '#BE185D', fontWeight: 800 }}>₦{discountedPrice.toLocaleString()}</span>
                                  <span style={{ fontSize: '0.68rem', background: '#FCE7F3', color: '#BE185D', padding: '2px 6px', borderRadius: 10, fontWeight: 800 }}>
                                    {studioConfig.discountType === 'fixed' ? `-₦${serviceDiscount.toLocaleString()}` : `-${studioConfig.discountValue}%`}
                                  </span>
                                </span>
                              ) : (
                                <span className="meta-price">₦{(srv.price || 0).toLocaleString()}</span>
                              )}
                              <span className="meta-dot">•</span>
                              <span className="meta-time">{srv.duration}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectService(srv)}
                            className="btn-book-pill"
                          >
                            Book
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748B' }}>
                  <p>No services currently listed. Check back soon!</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DATE & CUSTOMIZATION */}
          {step === 'datetime' && selectedService && (
            <div className="datetime-pane">
              <div className="selected-srv-summary">
                <span className="summary-tag">Selected Service:</span>
                <strong>{selectedService.name} (₦{selectedService.price.toLocaleString()})</strong>
              </div>

              {/* Date Selection */}
              <div className="widget-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="section-label" style={{ margin: 0 }}><CalendarIcon size={14} /> Select Date</label>
                  <input
                    type="date"
                    min={todayISO}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                      border: '1px solid #D1D5DB',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      color: '#1F2937',
                      background: '#F9FAFB'
                    }}
                  />
                </div>
                <div className="dates-pill-row">
                  {dynamicDates.slice(0, 5).map((d) => (
                    <button
                      key={d.full}
                      onClick={() => setSelectedDate(d.full)}
                      className={`date-chip ${selectedDate === d.full ? 'active' : ''}`}
                    >
                      <span className="chip-day">{d.day}</span>
                      <span className="chip-num">{d.date}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="widget-section">
                <label className="section-label"><Clock size={14} /> Select Time Slot</label>
                <div className="time-slots-row">
                  {(timeSlotsList && timeSlotsList.length > 0 ? timeSlotsList : ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM']).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTime(t)}
                      className={`time-chip ${selectedTime === t ? 'active' : ''}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shape Selection */}
              {shapesList && shapesList.length > 0 && (
                <div className="widget-section">
                  <label className="section-label">Select Nail Shape (Optional)</label>
                  <div className="mini-chips-grid">
                    <button
                      onClick={() => setSelectedShape(null)}
                      className={`mini-chip ${!selectedShape ? 'active' : ''}`}
                    >
                      🚫 None / Natural
                    </button>
                    {shapesList.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedShape(selectedShape?.id === s.id ? null : s)}
                        className={`mini-chip ${selectedShape?.id === s.id ? 'active' : ''}`}
                      >
                        {s.icon} {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Length Selection */}
              {lengthsList && lengthsList.length > 0 && (
                <div className="widget-section">
                  <label className="section-label">Select Extension Length (Optional)</label>
                  <div className="mini-chips-grid">
                    <button
                      onClick={() => setSelectedLength(null)}
                      className={`mini-chip ${!selectedLength ? 'active' : ''}`}
                    >
                      🚫 None / Natural Length
                    </button>
                    {lengthsList.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setSelectedLength(selectedLength?.id === l.id ? null : l)}
                        className={`mini-chip ${selectedLength?.id === l.id ? 'active' : ''}`}
                      >
                        {l.name} {l.extra > 0 ? `(+₦${Number(l.extra).toLocaleString()})` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Nail Art Tiers */}
              {artTiersList && artTiersList.length > 0 && (
                <div className="widget-section">
                  <label className="section-label">Select Nail Art Level (Optional)</label>
                  <div className="mini-chips-grid">
                    <button
                      onClick={() => setSelectedArtTier(null)}
                      className={`mini-chip ${!selectedArtTier ? 'active' : ''}`}
                    >
                      🚫 None / Plain (No Art)
                    </button>
                    {artTiersList.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setSelectedArtTier(selectedArtTier?.id === tier.id ? null : tier)}
                        className={`mini-chip ${selectedArtTier?.id === tier.id ? 'active' : ''}`}
                      >
                        {tier.name} {tier.price > 0 ? `(+₦${Number(tier.price).toLocaleString()})` : '(Included)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {addonsList && addonsList.length > 0 && (
                <div className="widget-section">
                  <label className="section-label">Select Add-ons (Optional)</label>
                  <div className="mini-chips-grid">
                    {addonsList.map((addon) => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`mini-chip ${isSelected ? 'active' : ''}`}
                        >
                          {isSelected ? '✓ ' : '+ '}{addon.name} (+₦{Number(addon.price).toLocaleString()})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AUTOMATIC DISCOUNT BANNER */}
              {studioConfig.discountEnabled && (
                <div style={{ background: 'linear-gradient(135deg, #FFF1F2 0%, #FDF2F8 100%)', border: '1px solid #F472B6', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EC4899', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                      %
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: '#BE185D', display: 'block' }}>
                        ✨ Special Discount Applied ({studioConfig.discountType === 'fixed' ? `₦${(studioConfig.discountValue || 0).toLocaleString()} OFF` : `${studioConfig.discountValue || 0}% OFF`})
                      </strong>
                      <p style={{ fontSize: '0.78rem', color: '#9F1239', margin: '2px 0 0 0' }}>
                        {studioConfig.discountDescription || 'Discount will automatically be deducted from your total checkout!'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="widget-footer-actions">
                <div className="price-preview">
                  <span>Pay at studio after service (No upfront deposit)</span>
                  <div className="detail-value highlight">
                    {discountDeduction > 0 ? (
                      <span>
                        <s style={{ fontSize: '0.8rem', color: '#94A3B8', marginRight: 6 }}>₦{subtotalPrice.toLocaleString()}</s>
                        ₦{totalPrice.toLocaleString()}
                      </span>
                    ) : (
                      <span>₦{totalPrice.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <button onClick={handleProceedToDetails} className="btn-book-pill action-btn">
                  Continue to Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CLIENT DETAILS FORM */}
          {step === 'details' && (
            <form onSubmit={handleConfirmBooking} className="details-pane">
              <div className="widget-section">
                <label className="section-label"><User size={14} /> Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amber Rose"
                  className="widget-input"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                />
              </div>

              <div className="widget-section">
                <label className="section-label"><Mail size={14} /> Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="amber@example.com"
                  className="widget-input"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                />
              </div>

              <div className="widget-section">
                <label className="section-label"><Phone size={14} /> Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 019-2831"
                  className="widget-input"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                />
              </div>

              <div className="widget-section">
                <label className="section-label"><FileText size={14} /> Inspiration / Special Requests</label>
                <textarea
                  rows="2"
                  placeholder="Reference colors, nail art notes..."
                  className="widget-input"
                  value={clientInfo.notes}
                  onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="booking-breakdown-box">
                <p><strong>Appointment:</strong> {selectedDate} at {selectedTime}</p>
                <p><strong>Subtotal:</strong> ₦{subtotalPrice.toLocaleString()}</p>
                {discountDeduction > 0 && (
                  <p><strong style={{ color: '#BE185D' }}>Automatic Discount:</strong> <span style={{ color: '#BE185D', fontWeight: 700 }}>-₦{discountDeduction.toLocaleString()}</span></p>
                )}
                <p><strong>Final Total:</strong> <strong style={{ color: '#EC4899', fontSize: '1.05rem' }}>₦{totalPrice.toLocaleString()}</strong></p>
                <p><strong>Payment Terms:</strong> Pay at studio after appointment (No deposit required)</p>
              </div>

              <button type="submit" className="btn-book-pill action-btn full-btn">
                Confirm & Reserve Appointment
              </button>
            </form>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === 'confirmation' && (
            <div className="confirmation-pane">
              <div className="conf-icon-circle">
                <CheckCircle2 size={42} color="#EC4899" />
              </div>
              <h3>Appointment Reserved!</h3>
              <p className="conf-ref">Booking Ref: <strong>{bookingId}</strong></p>

              <div className="conf-summary-card">
                <p><strong>Client:</strong> {clientInfo.name}</p>
                <p><strong>Date & Time:</strong> {selectedDate} @ {selectedTime}</p>
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Shape & Length:</strong> {selectedShape?.name || 'Standard'}, {selectedLength?.name || 'Standard'}</p>
                <p><strong>Studio Location:</strong> 104 Auric Studio Lane, Suite 4B</p>
              </div>

              <div className="conf-btns">
                <button onClick={downloadReceipt} className="btn-book-pill">
                  <Download size={14} /> Download Slip
                </button>
                <button
                  onClick={() => {
                    setStep('services');
                    setSelectedService(null);
                  }}
                  className="btn-outline-pill"
                >
                  Book Another Set
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STUDIO PROFILE CARD (Matches Screenshot) */}
        <div className="widget-right-pane">
          <div className="studio-card-banner">
            <img src={studioConfig.studioCoverUrl || "/images/hero.png"} alt="Auric Nails Studio" className="banner-img" />
            <div className="studio-avatar-badge" style={{ overflow: 'hidden', padding: studioConfig.studioLogoUrl ? 0 : undefined }}>
              {studioConfig.studioLogoUrl ? (
                <img src={studioConfig.studioLogoUrl} alt="Studio Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Sparkles size={22} color="#EC4899" />
              )}
            </div>
          </div>

          <div className="studio-card-content">
            <h3 className="studio-name">{studioConfig.studioName || 'Auric Nails'}</h3>
            <p className="studio-desc">
              {studioConfig.studioDescription || 'Auric Nails (@auricc_nails) is your luxury escape for bespoke nail beauty and care. We specialize in clean, liquid gold chrome, gel-x, acrylic extensions, and long-wear BIAB overlays.'}
            </p>

            {/* Contact Items List matching Screenshot */}
            <div className="contact-list">
              <a
                href={getFormattedTelUrl(studioConfig.studioPhone)}
                className="contact-item link-item"
              >
                <Phone size={16} className="item-icon" />
                <span>{studioConfig.studioPhone || '+234 708 749 0482'}</span>
              </a>

              <a
                href={getFormattedWhatsAppUrl(studioConfig.studioPhone)}
                target="_blank"
                rel="noreferrer"
                className="contact-item link-item"
              >
                <MessageCircle size={16} className="item-icon" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={`https://instagram.com/${(studioConfig.studioInstagram || '@auricc_nails').replace('@', '').trim()}`}
                target="_blank"
                rel="noreferrer"
                className="contact-item link-item"
              >
                <Instagram size={16} className="item-icon" />
                <span>{studioConfig.studioInstagram || '@auricc_nails'}</span>
              </a>

              <div className="contact-item">
                <MapPin size={16} className="item-icon" />
                <span>{studioConfig.studioAddress || 'Lekki Phase 1, Lagos, Nigeria'}</span>
              </div>

              <a
                href={`mailto:${studioConfig.studioEmail || 'hello@auricnails.com'}`}
                className="contact-item link-item"
              >
                <Mail size={16} className="item-icon" />
                <span>{studioConfig.studioEmail || 'hello@auricnails.com'}</span>
              </a>

              <div className="contact-item hours-item">
                <Clock size={16} className="item-icon" />
                <span>{studioConfig.studioHours || 'Opens today at 10:00 AM'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Preview Lightbox Modal */}
      {previewPhotos && (
        <div
          onClick={() => setPreviewPhotos(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, padding: 20
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFF', borderRadius: 20, maxWidth: 600, width: '100%',
              overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #EEE' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, fontFamily: "'Playfair Display', serif" }}>{previewPhotos.name}</h3>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  Photo {activePhotoIdx + 1} of {((previewPhotos.images && previewPhotos.images.length) || 1)}
                </span>
              </div>
              <button
                onClick={() => setPreviewPhotos(null)}
                style={{ background: '#F1F3F5', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            </div>

            {/* Main Active Image */}
            <div style={{ background: '#000', height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img
                src={((previewPhotos.images && previewPhotos.images.length > 0) ? previewPhotos.images[activePhotoIdx] : (previewPhotos.imageUrl || '/images/hero.png'))}
                alt={previewPhotos.name}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            </div>

            {/* Thumbnail Navigation Row */}
            {((previewPhotos.images && previewPhotos.images.length > 1)) && (
              <div style={{ display: 'flex', gap: 10, padding: 16, overflowX: 'auto', background: '#FAFAFA', justifyContent: 'center' }}>
                {previewPhotos.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    onClick={() => setActivePhotoIdx(i)}
                    style={{
                      width: 60, height: 60, borderRadius: 8, objectFit: 'cover', cursor: 'pointer',
                      border: activePhotoIdx === i ? '3px solid #D4AF37' : '2px solid transparent',
                      opacity: activePhotoIdx === i ? 1 : 0.65, transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        /* Dynamic Ambient Glass Background */
        .widget-wrapper {
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          background: radial-gradient(circle at 50% 15%, #4A0E32 0%, #25061A 50%, #0D0209 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 24px 20px 40px 20px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        /* Floating Glass Orbs — subtle decorative only, no pointer events */
        .bg-orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none !important;
          touch-action: none !important;
          z-index: 0;
        }
        .orb-pink-1 {
          top: -100px;
          left: 5%;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(219, 39, 119, 0) 70%);
          filter: blur(60px);
          animation: floatOrb1 14s infinite alternate ease-in-out;
        }
        .orb-pink-2 {
          bottom: -50px;
          right: 5%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(244, 114, 182, 0.35) 0%, rgba(157, 23, 77, 0) 70%);
          filter: blur(80px);
          animation: floatOrb2 18s infinite alternate ease-in-out;
        }
        .orb-pink-3 {
          top: 35%;
          right: 30%;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(251, 207, 232, 0.25) 0%, rgba(236, 72, 153, 0) 70%);
          filter: blur(50px);
          animation: floatOrb3 12s infinite alternate ease-in-out;
        }

        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(50px, 40px) scale(1.15); }
          100% { transform: translate(-30px, 60px) scale(0.95); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-60px, -50px) scale(1.1); }
          100% { transform: translate(40px, -30px) scale(0.9); }
        }
        @keyframes floatOrb3 {
          0% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(30px, -30px) rotate(180deg); }
          100% { transform: translate(-40px, 30px) rotate(360deg); }
        }

        /* Top Navbar - Glassy Pink */
        .app-navbar {
          width: 100%;
          max-width: 1100px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(244, 114, 182, 0.35);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(236, 72, 153, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          position: relative;
          z-index: 10;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .nav-logo-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F472B6 0%, #DB2777 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          box-shadow: 0 0 16px rgba(244, 114, 182, 0.6);
        }
        .nav-brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 1.5px;
          line-height: 1;
        }
        .nav-brand-sub {
          font-size: 0.62rem;
          color: #F472B6;
          letter-spacing: 2px;
          font-weight: 700;
          margin-top: 3px;
          text-transform: uppercase;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav-item-link {
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.25s ease;
          padding: 8px 14px;
          border-radius: 20px;
        }
        .nav-item-link:hover, .nav-item-link.active {
          color: #F472B6;
          background: rgba(244, 114, 182, 0.2);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.25);
        }

        /* Glassy Pink Card Container */
        .booking-widget-card {
          width: 100%;
          max-width: 1100px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 24px;
          border: 1px solid rgba(244, 114, 182, 0.4);
          box-shadow: 0 30px 80px rgba(236, 72, 153, 0.25), 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.8);
          display: grid;
          grid-template-columns: 1fr 380px;
          border-radius: 24px;
          color: #1A1A1A;
          position: relative;
          z-index: 10;
        }

        /* LEFT PANE */
        .widget-left-pane {
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .widget-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .widget-back-btn {
          background: #FFF0F5;
          border: 1px solid #FCE7F3;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          color: #DB2777;
          transition: all 0.2s;
        }
        .widget-back-btn:hover {
          background: #FCE7F3;
        }
        .widget-title {
          font-family: 'Playfair Display', 'Cormorant Garamond', serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #111;
        }

        /* Services List with Hover Dynamics */
        .services-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .service-row-item {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 14px;
          border-radius: 16px;
          border-bottom: 1px solid #FCE7F3;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .service-row-item:hover {
          background: rgba(253, 242, 248, 0.75);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(236, 72, 153, 0.12);
        }
        .service-row-item:last-child {
          border-bottom: none;
        }
        .srv-img-box {
          width: 70px;
          height: 70px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
          transition: transform 0.3s ease;
        }
        .service-row-item:hover .srv-img-box {
          transform: scale(1.05);
        }
        .srv-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .srv-info {
          flex: 1;
        }
        .srv-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 4px;
        }
        .srv-desc {
          font-size: 0.83rem;
          color: #666;
          line-height: 1.4;
          margin-bottom: 6px;
        }
        .srv-meta {
          font-size: 0.85rem;
          font-weight: 600;
          color: #444;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .meta-price {
          color: #DB2777;
          font-weight: 800;
        }
        .meta-dot {
          color: #F472B6;
        }

        /* Pill Button (Dynamic Glassy Pink Accent & Pulse Effect) */
        .btn-book-pill {
          background: linear-gradient(135deg, #EC4899 0%, #DB2777 50%, #BE185D 100%);
          color: #FFF;
          border: none;
          padding: 10px 24px;
          border-radius: 25px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 18px rgba(236, 72, 153, 0.4);
          position: relative;
          overflow: hidden;
        }
        .btn-book-pill:hover {
          background: linear-gradient(135deg, #F472B6 0%, #EC4899 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 25px rgba(236, 72, 153, 0.55);
        }
        .btn-book-pill:active {
          transform: translateY(0) scale(0.97);
        }
        .btn-outline-pill {
          background: transparent;
          border: 1px solid #F472B6;
          padding: 10px 20px;
          border-radius: 25px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          color: #DB2777;
          transition: all 0.2s;
        }
        .btn-outline-pill:hover {
          background: #FFF0F5;
        }

        /* Datetime Pane */
        .datetime-pane, .details-pane, .confirmation-pane {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .selected-srv-summary {
          background: #FFF0F5;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.88rem;
          display: flex;
          justify-content: space-between;
          border: 1px solid #FCE7F3;
          color: #831843;
        }
        .widget-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .section-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #831843;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dates-pill-row {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
        }
        .date-chip {
          flex: 1;
          background: #FFF0F5;
          border: 1px solid #FCE7F3;
          border-radius: 12px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: #831843;
        }
        .date-chip:hover {
          border-color: #F472B6;
          transform: translateY(-1px);
        }
        .date-chip.active {
          background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
          color: #FFF;
          border-color: #EC4899;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.4);
        }
        .chip-day { font-size: 0.72rem; }
        .chip-num { font-size: 1.1rem; font-weight: 800; }

        .time-slots-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .time-chip {
          background: #FFF0F5;
          border: 1px solid #FCE7F3;
          padding: 10px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          text-align: center;
          color: #831843;
          transition: all 0.25s ease;
        }
        .time-chip:hover {
          border-color: #F472B6;
        }
        .time-chip.active {
          background: linear-gradient(135deg, #EC4899 0%, #BE185D 100%);
          color: #FFF;
          border-color: #EC4899;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 18px rgba(236, 72, 153, 0.4);
        }

        .mini-chips-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .mini-chip {
          background: #FFF0F5;
          border: 1px solid #FCE7F3;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 0.8rem;
          cursor: pointer;
          font-weight: 600;
          color: #831843;
          transition: all 0.2s ease;
        }
        .mini-chip:hover {
          border-color: #F472B6;
        }
        .mini-chip.active {
          background: #DB2777;
          color: #FFF;
          border-color: #DB2777;
          box-shadow: 0 4px 12px rgba(219, 39, 119, 0.35);
        }

        .widget-footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #FCE7F3;
          padding-top: 16px;
          margin-top: 10px;
        }
        .price-preview {
          display: flex;
          flex-direction: column;
          font-size: 0.9rem;
        }
        .deposit-tag {
          font-size: 0.75rem;
          color: #777;
        }

        /* Inputs */
        .widget-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #FBCFE8;
          background: #FFF9FC;
          font-family: inherit;
          font-size: 0.9rem;
          color: #1A1A1A;
          transition: all 0.2s;
        }
        .widget-input:focus {
          outline: none;
          border-color: #EC4899;
          box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.18);
        }
        .booking-breakdown-box {
          background: #FFF0F5;
          border-radius: 12px;
          padding: 16px;
          font-size: 0.88rem;
          line-height: 1.7;
          border: 1px solid #FCE7F3;
          color: #831843;
        }
        .full-btn {
          width: 100%;
          padding: 14px;
        }

        /* Confirmation */
        .confirmation-pane {
          text-align: center;
          padding: 20px 0;
        }
        .conf-icon-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #FCE7F3;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.3);
        }
        .conf-ref { color: #666; font-size: 0.9rem; }
        .conf-summary-card {
          background: #FFF0F5;
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          font-size: 0.88rem;
          line-height: 1.8;
          margin: 20px 0;
          border: 1px solid #FCE7F3;
        }
        .conf-btns {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        /* RIGHT PANE: STUDIO PROFILE */
        .widget-right-pane {
          background: #FFF8FA;
          border-left: 1px solid #FCE7F3;
          display: flex;
          flex-direction: column;
        }
        .studio-card-banner {
          position: relative;
          height: 180px;
        }
        .banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .studio-avatar-badge {
          position: absolute;
          bottom: -24px;
          left: 28px;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #9D174D;
          border: 3px solid #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
        }

        .studio-card-content {
          padding: 36px 26px 30px 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .studio-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: #0F172A;
          letter-spacing: 0.3px;
        }
        .studio-desc {
          font-size: 0.92rem;
          color: #334155;
          line-height: 1.75;
          letter-spacing: 0.012em;
          font-weight: 450;
          white-space: pre-line;
        }
        .gold-txt, .pink-txt {
          color: #DB2777;
          font-weight: 700;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          border-top: 1px solid #FCE7F3;
          padding-top: 22px;
          margin-top: 6px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.88rem;
          color: #334155;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .link-item:hover {
          color: #DB2777;
          transform: translateX(3px);
        }
        .item-icon {
          color: #DB2777;
          flex-shrink: 0;
        }
        .hours-item {
          color: #BE185D;
          font-weight: 600;
          background: #FFF0F5;
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid #FCE7F3;
        }

        /* ── RESPONSIVE MOBILE VIEW ────────────────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .booking-widget-card {
            grid-template-columns: 1fr;
            border-radius: 20px;
          }
          .widget-right-pane {
            border-left: none;
            border-top: 1px solid #FCE7F3;
          }
          .widget-left-pane {
            padding: 24px 20px;
          }
          .studio-card-content {
            padding: 28px 20px;
          }
        }

        @media (max-width: 600px) {
          .widget-wrapper {
            padding: 10px 8px;
            width: 100%;
            max-width: 100vw;
            overflow-x: hidden;
          }
          .app-navbar {
            padding: 10px 14px;
            margin-bottom: 12px;
            border-radius: 16px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          .nav-brand-title {
            font-size: 1.05rem;
          }
          .nav-brand-sub {
            font-size: 0.55rem;
            letter-spacing: 1px;
          }
          .nav-links {
            gap: 4px;
          }
          .nav-item-link {
            padding: 6px 10px;
            font-size: 0.78rem;
          }
          .nav-item-text {
            display: none;
          }
          .booking-widget-card {
            border-radius: 18px;
            box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3);
          }
          .widget-left-pane {
            padding: 18px 12px;
          }
          .widget-header {
            gap: 8px;
            margin-bottom: 16px;
          }
          .widget-title {
            font-size: 1.25rem;
            line-height: 1.25;
          }
          .widget-back-btn {
            padding: 5px 10px;
            font-size: 0.78rem;
            flex-shrink: 0;
          }
          .service-row-item {
            gap: 12px;
            padding: 12px 6px;
          }
          .srv-img-box {
            width: 56px;
            height: 56px;
            border-radius: 10px;
          }
          .srv-title {
            font-size: 0.92rem;
          }
          .srv-desc {
            font-size: 0.78rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .srv-meta {
            font-size: 0.78rem;
            gap: 6px;
          }
          .btn-book-pill {
            padding: 8px 16px;
            font-size: 0.82rem;
            flex-shrink: 0;
          }
          .dates-pill-row {
            overflow-x: auto;
            padding-bottom: 6px;
            -webkit-overflow-scrolling: touch;
          }
          .date-chip {
            min-width: 54px;
            flex: 0 0 auto;
            padding: 8px 6px;
          }
          .time-slots-row {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .mini-chip {
            padding: 6px 12px;
            font-size: 0.78rem;
          }
          .widget-footer-actions {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }
          .widget-footer-actions .action-btn {
            width: 100%;
          }
          .price-preview {
            text-align: center;
          }
          .conf-btns {
            flex-direction: column;
          }
          .studio-card-content {
            padding: 22px 14px;
          }
        }
      `}</style>
    </div>
  );
}
