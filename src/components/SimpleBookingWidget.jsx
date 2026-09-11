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
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, doc, getDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SERVICES as localServices, NAIL_SHAPES, NAIL_LENGTHS, ART_TIERS, ADD_ONS } from '../data/servicesData';
import PinkMistCanvas from './PinkMistCanvas';

export default function SimpleBookingWidget() {
  const [step, setStep] = useState('services'); // 'services' | 'datetime' | 'details' | 'confirmation'
  const [services, setServices] = useState(localServices);
  const [loadingServices, setLoadingServices] = useState(true);

  // Customization Collections from Firestore
  const [shapesList, setShapesList] = useState(NAIL_SHAPES);
  const [lengthsList, setLengthsList] = useState(NAIL_LENGTHS);
  const [artTiersList, setArtTiersList] = useState(ART_TIERS);
  const [addonsList, setAddonsList] = useState(ADD_ONS);
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
  const [selectedShape, setSelectedShape] = useState(NAIL_SHAPES[0]);
  const [selectedLength, setSelectedLength] = useState(NAIL_LENGTHS[1]);
  const [selectedArtTier, setSelectedArtTier] = useState(ART_TIERS[0]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

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

  const dynamicDates = getDynamicUpcomingDates();
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(dynamicDates[0]?.full || todayISO);
  const [selectedTime, setSelectedTime] = useState(timeSlotsList[0] || '10:30 AM');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch Services
        const srvSnap = await getDocs(collection(db, 'services'));
        if (!srvSnap.empty) {
          const srvs = [];
          srvSnap.forEach((doc) => {
            const data = doc.data();
            srvs.push({
              id: doc.id,
              name: data.name || 'Nail Service',
              price: Number(data.price) || 0,
              duration: data.duration || '60 mins',
              description: data.description || '',
              category: data.category || 'Nails',
              imageUrl: data.imageUrl || '/images/hero.png',
              ...data
            });
          });
          if (srvs.length > 0) setServices(srvs);
        }

        // Fetch Shapes
        const shapeSnap = await getDocs(collection(db, 'shapes'));
        if (!shapeSnap.empty) {
          const shapes = shapeSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (shapes.length > 0) {
            setShapesList(shapes);
            setSelectedShape(shapes[0]);
          }
        }

        // Fetch Lengths
        const lengthSnap = await getDocs(collection(db, 'lengths'));
        if (!lengthSnap.empty) {
          const lengths = lengthSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (lengths.length > 0) {
            setLengthsList(lengths);
            setSelectedLength(lengths[1] || lengths[0]);
          }
        }

        // Fetch Art Tiers
        const artSnap = await getDocs(collection(db, 'artTiers'));
        if (!artSnap.empty) {
          const tiers = artSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (tiers.length > 0) {
            setArtTiersList(tiers);
            setSelectedArtTier(tiers[0]);
          }
        }

        // Fetch Addons
        const addonSnap = await getDocs(collection(db, 'addons'));
        if (!addonSnap.empty) {
          const addons = addonSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (addons.length > 0) setAddonsList(addons);
        }

        // Initial Fetch of Studio Settings
        const configDoc = await getDoc(doc(db, 'settings', 'studioConfig'));
        if (configDoc.exists()) {
          const cData = configDoc.data();
          if (cData.timeSlots && cData.timeSlots.length > 0) {
            setTimeSlotsList(cData.timeSlots);
            setSelectedTime(cData.timeSlots[0]);
          }
          if (cData.depositAmount !== undefined) setDepositAmount(Number(cData.depositAmount));
          setStudioConfig(prev => ({ ...prev, ...cData }));
        }
      } catch (error) {
        console.error("Error fetching booking options:", error);
      }
      setLoadingServices(false);
    };
    fetchAllData();
  }, []);

  // Real-time Studio Settings & Config Listener (Syncs Admin changes instantly)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'studioConfig'), (snap) => {
      if (snap.exists()) {
        const cData = snap.data();
        if (cData.timeSlots && cData.timeSlots.length > 0) {
          setTimeSlotsList(cData.timeSlots);
        }
        if (cData.depositAmount !== undefined) {
          setDepositAmount(Number(cData.depositAmount));
        }
        setStudioConfig(prev => ({ ...prev, ...cData }));
      }
    }, (err) => {
      console.warn("Real-time listener notice:", err);
    });
    return () => unsub();
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
        shape: selectedShape?.name,
        length: selectedLength?.name,
        artTier: selectedArtTier?.name,
        addons: selectedAddons.map(a => a.name),
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

Service:        ${selectedService?.name} (₦${selectedService?.price.toLocaleString()})
Shape:          ${selectedShape?.name}
Length:         ${selectedLength?.name} (+₦${selectedLength?.extra.toLocaleString()})
Art Level:      ${selectedArtTier?.name} (+₦${selectedArtTier?.price.toLocaleString()})
Add-ons:        ${selectedAddons.map(a => a.name).join(', ') || 'None'}

Total Amount:   ₦${totalPrice.toLocaleString()}
Payment Terms:  Pay at Studio after appointment (No Deposit Required)

Location: 104 Auric Studio Lane, Suite 4B
Instagram: @auricc_nails
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

  const totalPrice = (selectedService?.price || 0) + selectedLength.extra + selectedArtTier.price + selectedAddons.reduce((s, a) => s + a.price, 0);

  return (
    <div className="widget-wrapper">
      {/* Dynamic Falling Pink Mist & Floating Particles */}
      <PinkMistCanvas />

      {/* Dynamic Ambient Glass Orbs */}
      <div className="bg-orb orb-pink-1"></div>
      <div className="bg-orb orb-pink-2"></div>
      <div className="bg-orb orb-pink-3"></div>

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
            href="https://instagram.com/auricc_nails"
            target="_blank"
            rel="noreferrer"
            className="nav-item-link"
          >
            <Instagram size={15} />
            <span className="nav-item-text">@auricc_nails</span>
          </a>
          <a
            href="https://wa.me/2348001234567"
            target="_blank"
            rel="noreferrer"
            className="nav-item-link"
          >
            <MessageCircle size={15} />
            <span className="nav-item-text">WhatsApp</span>
          </a>
        </nav>
      </header>

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
            <div className="services-list">
              {services.map((srv) => (
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
                      <span className="meta-price">₦{(srv.price || 0).toLocaleString()}</span>
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
              ))}
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
              <div className="widget-section">
                <label className="section-label">Select Nail Shape</label>
                <div className="mini-chips-grid">
                  {(shapesList && shapesList.length > 0 ? shapesList : NAIL_SHAPES).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShape(s)}
                      className={`mini-chip ${selectedShape?.id === s.id ? 'active' : ''}`}
                    >
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div className="widget-section">
                <label className="section-label">Select Extension Length</label>
                <div className="mini-chips-grid">
                  {(lengthsList && lengthsList.length > 0 ? lengthsList : NAIL_LENGTHS).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLength(l)}
                      className={`mini-chip ${selectedLength?.id === l.id ? 'active' : ''}`}
                    >
                      {l.name} {l.extra > 0 ? `(+₦${Number(l.extra).toLocaleString()})` : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nail Art Tiers */}
              <div className="widget-section">
                <label className="section-label">Select Nail Art Level</label>
                <div className="mini-chips-grid">
                  {(artTiersList && artTiersList.length > 0 ? artTiersList : ART_TIERS).map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedArtTier(tier)}
                      className={`mini-chip ${selectedArtTier?.id === tier.id ? 'active' : ''}`}
                    >
                      {tier.name} {tier.price > 0 ? `(+₦${Number(tier.price).toLocaleString()})` : '(Included)'}
                    </button>
                  ))}
                </div>
              </div>

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

              <div className="widget-footer-actions">
                <div className="price-preview">
                  <span>Pay at studio after service (No upfront deposit)</span>
                  <div className="detail-value highlight">₦{totalPrice.toLocaleString()}</div>
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
                <p><strong>Service Total:</strong> ₦{totalPrice.toLocaleString()}</p>
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
                <p><strong>Shape & Length:</strong> {selectedShape.name}, {selectedLength.name}</p>
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
            <img src="/images/hero.png" alt="Auric Nails Studio" className="banner-img" />
            <div className="studio-avatar-badge">
              <Sparkles size={22} color="#EC4899" />
            </div>
          </div>

          <div className="studio-card-content">
            <h3 className="studio-name">{studioConfig.studioName || 'Auric Nails'}</h3>
            <p className="studio-desc">
              {studioConfig.studioDescription || 'Auric Nails (@auricc_nails) is your luxury escape for bespoke nail beauty and care. We specialize in clean, liquid gold chrome, gel-x, acrylic extensions, and long-wear BIAB overlays.'}
            </p>

            {/* Contact Items List matching Screenshot */}
            <div className="contact-list">
              <div className="contact-item">
                <Phone size={16} className="item-icon" />
                <span>{studioConfig.studioPhone || '+234 800 123 4567'}</span>
              </div>

              <a
                href={`https://wa.me/${(studioConfig.studioPhone || '2348001234567').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="contact-item link-item"
              >
                <MessageCircle size={16} className="item-icon" />
                <span>WhatsApp Us</span>
              </a>

              <a
                href={`https://instagram.com/${(studioConfig.studioInstagram || '@auricc_nails').replace('@', '')}`}
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

              <div className="contact-item">
                <Mail size={16} className="item-icon" />
                <span>{studioConfig.studioEmail || 'hello@auricnails.com'}</span>
              </div>

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
          max-width: 100vw;
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
          transform: translateZ(0);
        }

        /* Floating Glass Orbs */
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
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
          overflow: hidden;
          color: #1A1A1A;
          position: relative;
          z-index: 10;
        }

        /* LEFT PANE */
        .widget-left-pane {
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          background: #FFFFFF;
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
          padding: 40px 28px 30px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .studio-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
        }
        .studio-desc {
          font-size: 0.84rem;
          color: #666;
          line-height: 1.6;
        }
        .gold-txt, .pink-txt {
          color: #DB2777;
          font-weight: 700;
        }

        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid #FCE7F3;
          padding-top: 20px;
          margin-top: 10px;
        }
        .contact-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
          color: #444;
          text-decoration: none;
        }
        .link-item:hover {
          color: #EC4899;
        }
        .item-icon {
          color: #EC4899;
          flex-shrink: 0;
        }
        .hours-item {
          color: #BE185D;
          font-weight: 600;
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
