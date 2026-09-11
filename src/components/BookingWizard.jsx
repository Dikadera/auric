import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  AlertCircle
} from 'lucide-react';
import { SERVICES, NAIL_SHAPES, NAIL_LENGTHS, ART_TIERS, ADD_ONS } from '../data/servicesData';

export default function BookingWizard({ preselectedData, onResetPreselected }) {
  const [step, setStep] = useState(1);

  // Selections
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [selectedShape, setSelectedShape] = useState(NAIL_SHAPES[0]);
  const [selectedLength, setSelectedLength] = useState(NAIL_LENGTHS[1]); // Medium default
  const [selectedArtTier, setSelectedArtTier] = useState(ART_TIERS[1]); // Signature default
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Date & Time
  const [selectedDate, setSelectedDate] = useState('2026-09-15');
  const [selectedTime, setSelectedTime] = useState('2:00 PM');

  // Client Details
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  // Modal Confirmation State
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Handle transferred preset data from Customizer or Gallery
  useEffect(() => {
    if (preselectedData) {
      if (preselectedData.shape) {
        const foundShape = NAIL_SHAPES.find((s) => s.id === preselectedData.shape.toLowerCase());
        if (foundShape) setSelectedShape(foundShape);
      }
      if (preselectedData.tier) {
        const foundTier = ART_TIERS.find((t) => t.name.toLowerCase().includes(preselectedData.tier.toLowerCase()));
        if (foundTier) setSelectedArtTier(foundTier);
      }
    }
  }, [preselectedData]);

  // Price Computations
  const basePrice = selectedService ? selectedService.price : 0;
  const lengthExtra = selectedLength ? selectedLength.extra : 0;
  const artPrice = selectedArtTier ? selectedArtTier.price : 0;
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);

  const totalPrice = basePrice + lengthExtra + artPrice + addonsTotal;
  const depositRequired = 25;
  const remainingDue = Math.max(0, totalPrice - depositRequired);

  const availableDates = [
    { day: 'Tue', date: '15', full: '2026-09-15' },
    { day: 'Wed', date: '16', full: '2026-09-16' },
    { day: 'Thu', date: '17', full: '2026-09-17' },
    { day: 'Fri', date: '18', full: '2026-09-18' },
    { day: 'Sat', date: '19', full: '2026-09-19' }
  ];

  const availableTimeSlots = [
    '10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'
  ];

  const toggleAddon = (addon) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleNextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      alert('Please fill in your name, email, and phone number.');
      return;
    }
    const newBookingId = `AURIC-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(newBookingId);
    setShowConfirmation(true);
  };

  const downloadReceipt = () => {
    const content = `
==============================================
          AURIC NAILS (@auricc_nails)
         APPOINTMENT BOOKING CONFIRMATION
==============================================
Booking Reference: ${bookingId}
Client Name:       ${clientInfo.name}
Email:             ${clientInfo.email}
Phone:             ${clientInfo.phone}

Date:              ${selectedDate}
Time Slot:         ${selectedTime}

SERVICE BREAKDOWN:
- Base Service:    ${selectedService.name} ($${selectedService.price})
- Nail Silhouette: ${selectedShape.name}
- Length:          ${selectedLength.name} (+$${selectedLength.extra})
- Art Level:       ${selectedArtTier.name} (+$${selectedArtTier.price})
- Add-Ons:         ${selectedAddons.map(a => a.name).join(', ') || 'None'}

PRICING SUMMARY:
Total Estimated:   $${totalPrice}
Deposit Paid:      $${depositRequired} (LOCKED)
Remaining Due:     $${remainingDue} (At Studio)

Location:          104 Auric Studio Lane, Suite 4B
Instagram:         @auricc_nails
==============================================
Thank you for choosing Auric Nails! See you soon.
    `;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `AuricNails_Booking_${bookingId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section id="services" className="booking-section">
      <div className="container">
        <div className="section-header">
          <div className="badge-gold">
            <CalendarIcon size={14} />
            <span>ONLINE APPOINTMENT ENGINE</span>
          </div>
          <h2>Reserve Your Auric Experience</h2>
          <p>Select your base service, length, silhouette shape, and art opulence tier below.</p>
        </div>

        {/* Wizard Step Progress Tracker */}
        <div className="wizard-progress-bar glass-card">
          {[
            { num: 1, label: 'Service' },
            { num: 2, label: 'Shape & Length' },
            { num: 3, label: 'Nail Art' },
            { num: 4, label: 'Add-Ons' },
            { num: 5, label: 'Time & Confirm' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`progress-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
            >
              <div className="step-num-circle">
                {step > s.num ? <CheckCircle2 size={16} color="#D4AF37" /> : s.num}
              </div>
              <span className="step-label">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="booking-layout">
          {/* Main Wizard Form Area */}
          <div className="wizard-main-content glass-card">
            {/* STEP 1: SERVICE */}
            {step === 1 && (
              <div className="step-content">
                <h3 className="step-title">Step 1: Choose Base Service</h3>
                <div className="services-grid">
                  {SERVICES.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedService(srv)}
                      className={`service-card ${selectedService?.id === srv.id ? 'selected' : ''}`}
                    >
                      {srv.popular && <span className="popular-tag">MOST POPULAR</span>}
                      <div className="srv-header">
                        <h4>{srv.name}</h4>
                        <span className="srv-price">${srv.price}</span>
                      </div>
                      <p className="srv-tagline">{srv.tagline}</p>
                      <p className="srv-desc">{srv.description}</p>
                      <div className="srv-footer">
                        <span className="srv-duration"><Clock size={14} /> {srv.duration}</span>
                        {selectedService?.id === srv.id && <CheckCircle2 size={18} color="#D4AF37" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: SHAPE & LENGTH */}
            {step === 2 && (
              <div className="step-content">
                <h3 className="step-title">Step 2: Nail Silhouette & Length</h3>

                {/* Shapes */}
                <div className="sub-section">
                  <h4 className="sub-title">1. Select Silhouette Shape</h4>
                  <div className="shapes-grid">
                    {NAIL_SHAPES.map((shp) => (
                      <div
                        key={shp.id}
                        onClick={() => setSelectedShape(shp)}
                        className={`shape-card ${selectedShape?.id === shp.id ? 'selected' : ''}`}
                      >
                        <span className="shape-icon-large">{shp.icon}</span>
                        <h5>{shp.name}</h5>
                        <p>{shp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lengths */}
                <div className="sub-section" style={{ marginTop: '30px' }}>
                  <h4 className="sub-title">2. Select Extension Length</h4>
                  <div className="lengths-grid">
                    {NAIL_LENGTHS.map((len) => (
                      <div
                        key={len.id}
                        onClick={() => setSelectedLength(len)}
                        className={`length-card ${selectedLength?.id === len.id ? 'selected' : ''}`}
                      >
                        <span className="length-badge">{len.badge}</span>
                        <h5>{len.name}</h5>
                        <span className="length-surcharge">
                          {len.extra === 0 ? 'Included' : `+$${len.extra}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: NAIL ART TIER */}
            {step === 3 && (
              <div className="step-content">
                <h3 className="step-title">Step 3: Select Nail Art Opulence Level</h3>
                <div className="art-tiers-grid">
                  {ART_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedArtTier(tier)}
                      className={`art-tier-card ${selectedArtTier?.id === tier.id ? 'selected' : ''}`}
                    >
                      <div className="tier-header">
                        <span className="tier-tag">{tier.tag}</span>
                        <span className="tier-price">+${tier.price}</span>
                      </div>
                      <h4>{tier.name}</h4>
                      <p>{tier.desc}</p>
                      {selectedArtTier?.id === tier.id && (
                        <div className="tier-selected-check">
                          <CheckCircle2 size={20} color="#D4AF37" /> Selected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: ADD-ONS */}
            {step === 4 && (
              <div className="step-content">
                <h3 className="step-title">Step 4: Enhancements & Add-Ons</h3>
                <div className="addons-grid">
                  {ADD_ONS.map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon)}
                        className={`addon-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="addon-header">
                          <h4>{addon.name}</h4>
                          <span className="addon-price">+${addon.price}</span>
                        </div>
                        <p>{addon.desc}</p>
                        <div className="addon-check">
                          {isSelected ? <CheckCircle2 size={20} color="#D4AF37" /> : <div className="uncheck-ring"></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: TIME & CONFIRMATION */}
            {step === 5 && (
              <div className="step-content">
                <h3 className="step-title">Step 5: Schedule Slot & Client Details</h3>

                <form onSubmit={handleSubmitBooking} className="checkout-form">
                  {/* Date Selector */}
                  <div className="form-group">
                    <label className="field-label">Select Preferred Appointment Date</label>
                    <div className="dates-row">
                      {availableDates.map((d) => (
                        <button
                          type="button"
                          key={d.full}
                          onClick={() => setSelectedDate(d.full)}
                          className={`date-pill ${selectedDate === d.full ? 'active' : ''}`}
                        >
                          <span className="date-day">{d.day}</span>
                          <span className="date-num">{d.date}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selector */}
                  <div className="form-group">
                    <label className="field-label">Select Available Time Slot</label>
                    <div className="time-slots-grid">
                      {availableTimeSlots.map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`time-pill ${selectedTime === t ? 'active' : ''}`}
                        >
                          <Clock size={14} />
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Client Details Inputs */}
                  <div className="client-fields-grid">
                    <div className="input-box">
                      <label><User size={14} /> Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Amber Rose"
                        value={clientInfo.name}
                        onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      />
                    </div>

                    <div className="input-box">
                      <label><Mail size={14} /> Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="amber@example.com"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      />
                    </div>

                    <div className="input-box">
                      <label><Phone size={14} /> Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(555) 019-2831"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      />
                    </div>

                    <div className="input-box full-width">
                      <label><FileText size={14} /> Inspiration Notes / Special Requests</label>
                      <textarea
                        rows="2"
                        placeholder="Mention any custom color preferences, reference pics, or soak-off details..."
                        value={clientInfo.notes}
                        onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>

                  <button type="submit" className="btn-gold submit-booking-btn">
                    <Sparkles size={18} /> Confirm & Pay $25 Deposit
                  </button>
                </form>
              </div>
            )}

            {/* Navigation Next/Prev buttons */}
            <div className="wizard-actions">
              {step > 1 && (
                <button onClick={handlePrevStep} className="btn-outline">
                  <ChevronLeft size={18} /> Previous
                </button>
              )}
              {step < 5 && (
                <button onClick={handleNextStep} className="btn-gold next-btn">
                  <span>Continue Step {step + 1}</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Right Sidebar Real-time Summary Card */}
          <div className="summary-sidebar glass-card">
            <div className="summary-header">
              <h3>Appointment Summary</h3>
              <span className="insta-tag">@auricc_nails</span>
            </div>

            <div className="summary-list">
              <div className="summary-row">
                <span className="row-label">Base Service:</span>
                <span className="row-val">{selectedService?.name}</span>
              </div>
              <div className="summary-row sub-row">
                <span>Duration:</span>
                <span>{selectedService?.duration}</span>
              </div>

              <div className="summary-row">
                <span className="row-label">Silhouette:</span>
                <span className="row-val">{selectedShape?.name}</span>
              </div>

              <div className="summary-row">
                <span className="row-label">Length:</span>
                <span className="row-val">{selectedLength?.name} (+${lengthExtra})</span>
              </div>

              <div className="summary-row">
                <span className="row-label">Nail Art Level:</span>
                <span className="row-val">{selectedArtTier?.name} (+${artPrice})</span>
              </div>

              {selectedAddons.length > 0 && (
                <div className="summary-row">
                  <span className="row-label">Add-Ons ({selectedAddons.length}):</span>
                  <span className="row-val">+${addonsTotal}</span>
                </div>
              )}

              {step === 5 && (
                <div className="summary-row date-time-highlight">
                  <span className="row-label">Slot:</span>
                  <span className="row-val gold-text">{selectedDate} @ {selectedTime}</span>
                </div>
              )}
            </div>

            <div className="summary-totals">
              <div className="total-line">
                <span>Total Estimated:</span>
                <span className="total-price">${totalPrice}</span>
              </div>
              <div className="total-line deposit-line">
                <span>Deposit Due Now:</span>
                <span className="deposit-val">${depositRequired}</span>
              </div>
              <div className="total-line due-line">
                <span>Remaining Due at Studio:</span>
                <span className="due-val">${remainingDue}</span>
              </div>
            </div>

            <div className="policy-micro-note">
              <AlertCircle size={14} color="#D4AF37" />
              <span>Deposits are non-refundable & lock in your spot.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showConfirmation && (
        <div className="modal-overlay">
          <div className="confirmation-modal glass-card">
            <div className="conf-icon pulse-gold">
              <CheckCircle2 size={48} color="#D4AF37" />
            </div>

            <h2>Appointment Reserved!</h2>
            <p className="conf-sub">Ref Code: <strong>{bookingId}</strong></p>

            <div className="conf-details-box">
              <p><strong>Client:</strong> {clientInfo.name}</p>
              <p><strong>Date & Time:</strong> {selectedDate} at {selectedTime}</p>
              <p><strong>Service Set:</strong> {selectedService.name} ({selectedShape.name}, {selectedLength.name})</p>
              <p><strong>Art Level:</strong> {selectedArtTier.name}</p>
              <p className="conf-deposit-note">✨ $25 Deposit Received. Remaining ${remainingDue} due at your appointment.</p>
            </div>

            <div className="conf-actions">
              <button onClick={downloadReceipt} className="btn-gold">
                <Download size={16} /> Download Confirmation Slip
              </button>
              <button onClick={() => setShowConfirmation(false)} className="btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .booking-section {
          padding: 100px 0;
          background: #0C0C12;
        }
        .wizard-progress-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          border-radius: 30px;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .progress-step {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          opacity: 0.5;
          transition: var(--transition);
        }
        .progress-step.active, .progress-step.completed {
          opacity: 1;
        }
        .step-num-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          color: #FFF;
        }
        .progress-step.active .step-num-circle {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.2);
          color: var(--gold-light);
        }
        .step-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .booking-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 32px;
        }
        .wizard-main-content {
          padding: 36px;
          border-radius: 24px;
        }
        .step-title {
          font-family: var(--font-serif);
          font-size: 1.8rem;
          margin-bottom: 24px;
          color: var(--gold-light);
        }
        .services-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .service-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          position: relative;
          transition: var(--transition);
        }
        .service-card:hover {
          border-color: var(--gold-primary);
        }
        .service-card.selected {
          background: rgba(212, 175, 55, 0.1);
          border-color: var(--gold-primary);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }
        .popular-tag {
          position: absolute;
          top: -10px;
          right: 16px;
          background: var(--gold-gradient);
          color: #000;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 10px;
        }
        .srv-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .srv-header h4 {
          font-size: 1.05rem;
          color: #FFF;
        }
        .srv-price {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--gold-light);
        }
        .srv-tagline {
          font-size: 0.8rem;
          color: var(--gold-text);
          margin-bottom: 8px;
        }
        .srv-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .srv-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .sub-title {
          font-size: 1rem;
          color: #FFF;
          margin-bottom: 14px;
        }
        .shapes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }
        .shape-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .shape-card:hover {
          border-color: var(--gold-primary);
        }
        .shape-card.selected {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.15);
        }
        .shape-icon-large {
          font-size: 1.8rem;
          display: block;
          margin-bottom: 6px;
        }
        .shape-card h5 {
          color: #FFF;
          font-size: 0.95rem;
          margin-bottom: 4px;
        }
        .shape-card p {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .lengths-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        .length-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 14px 10px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .length-card.selected {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.15);
        }
        .length-badge {
          font-size: 0.65rem;
          color: var(--gold-light);
          display: block;
          margin-bottom: 4px;
        }
        .length-card h5 {
          font-size: 0.85rem;
          color: #FFF;
        }
        .length-surcharge {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--gold-text);
        }

        .art-tiers-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .art-tier-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: var(--transition);
        }
        .art-tier-card.selected {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.15);
        }
        .tier-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .tier-tag {
          font-size: 0.7rem;
          background: rgba(212, 175, 55, 0.2);
          color: var(--gold-light);
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 700;
        }
        .tier-price {
          font-weight: 800;
          color: var(--gold-light);
        }

        .addons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .addon-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .addon-card.selected {
          border-color: var(--gold-primary);
          background: rgba(212, 175, 55, 0.1);
        }

        .checkout-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .field-label {
          font-size: 0.9rem;
          font-weight: 700;
          color: #FFF;
        }
        .dates-row {
          display: flex;
          gap: 12px;
        }
        .date-pill {
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          color: var(--text-muted);
          transition: var(--transition);
        }
        .date-pill.active {
          background: rgba(212, 175, 55, 0.2);
          border-color: var(--gold-primary);
          color: var(--gold-light);
        }
        .date-day { font-size: 0.75rem; }
        .date-num { font-size: 1.2rem; font-weight: 800; }

        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .time-pill {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #FFF;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .time-pill.active {
          background: var(--gold-gradient);
          color: #000;
          font-weight: 700;
        }

        .client-fields-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .full-width { grid-column: span 2; }
        .input-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-box label {
          font-size: 0.82rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .input-box input, .input-box textarea {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 12px;
          color: #FFF;
          font-family: var(--font-sans);
          font-size: 0.9rem;
        }
        .input-box input:focus, .input-box textarea:focus {
          outline: none;
          border-color: var(--gold-primary);
        }

        .submit-booking-btn {
          width: 100%;
          justify-content: center;
          padding: 16px;
          margin-top: 10px;
        }

        .wizard-actions {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          border-top: 1px solid var(--glass-border);
          padding-top: 20px;
        }

        /* Summary Sidebar */
        .summary-sidebar {
          padding: 24px;
          border-radius: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }
        .summary-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .summary-header h3 {
          font-family: var(--font-serif);
          font-size: 1.3rem;
          color: #FFF;
        }
        .insta-tag {
          font-size: 0.75rem;
          color: var(--gold-light);
        }
        .summary-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .row-label { color: var(--text-muted); }
        .row-val { color: #FFF; font-weight: 600; text-align: right; }
        .summary-totals {
          border-top: 1px dashed var(--glass-border);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .total-price { font-size: 1.4rem; font-weight: 800; color: #FFF; }
        .deposit-val { font-size: 1.1rem; font-weight: 800; color: var(--gold-light); }
        .due-val { font-weight: 700; color: var(--text-main); }
        .policy-micro-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 16px;
          background: rgba(255, 255, 255, 0.02);
          padding: 8px 12px;
          border-radius: 8px;
        }

        /* Confirmation Modal */
        .confirmation-modal {
          max-width: 500px;
          width: 100%;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
        }
        .conf-icon { margin-bottom: 16px; }
        .confirmation-modal h2 {
          font-family: var(--font-serif);
          font-size: 2rem;
          margin-bottom: 4px;
        }
        .conf-sub { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 20px; }
        .conf-details-box {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 20px;
          text-align: left;
          font-size: 0.88rem;
          line-height: 1.8;
          margin-bottom: 24px;
        }
        .conf-deposit-note {
          margin-top: 10px;
          font-size: 0.8rem;
          color: var(--gold-light);
          border-top: 1px dashed var(--glass-border);
          padding-top: 8px;
        }
        .conf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        @media (max-width: 992px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }
          .services-grid, .shapes-grid, .art-tiers-grid, .addons-grid {
            grid-template-columns: 1fr;
          }
          .lengths-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </section>
  );
}
