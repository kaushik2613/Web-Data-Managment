import React, { useState, useEffect } from 'react';
import styles from './SessionsModal.module.css';
import { X, Calendar, Clock, User, BookOpen, DollarSign, Edit2, Save, Plus } from 'lucide-react';

const SessionsModal = ({ 
  isOpen, 
  onClose, 
  session = null, 
  onSave,
  mode = 'view' // 'view', 'add', 'edit'
}) => {
  const [formData, setFormData] = useState({
    title: '',
    tutor: '',
    date: '',
    time: '',
    duration: '',
    subject: '',
    price: '',
    status: 'upcoming'
  });

  const [isEditing, setIsEditing] = useState(mode === 'add' || mode === 'edit');

  useEffect(() => {
    if (session) {
      setFormData({
        title: session.title || '',
        tutor: session.tutor || '',
        date: session.date || '',
        time: session.time || '',
        duration: session.duration || '',
        subject: session.subject || '',
        price: session.price?.replace('$', '') || '',
        status: session.status || 'upcoming'
      });
    } else {
      // Reset form for new session
      setFormData({
        title: '',
        tutor: '',
        date: '',
        time: '',
        duration: '',
        subject: '',
        price: '',
        status: 'upcoming'
      });
    }
    setIsEditing(mode === 'add' || mode === 'edit');
  }, [session, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.title || !formData.tutor || !formData.date || !formData.time || !formData.duration || !formData.subject || !formData.price) {
      alert('Please fill in all required fields');
      return;
    }

    const sessionData = {
      ...formData,
      price: `$${formData.price}`,
      id: session?.id || Date.now() // Generate ID for new sessions
    };

    onSave(sessionData);
    onClose();
  };

  const handleCancel = () => {
    if (mode === 'add') {
      onClose();
    } else {
      setIsEditing(false);
      // Reset form data to original session data
      if (session) {
        setFormData({
          title: session.title || '',
          tutor: session.tutor || '',
          date: session.date || '',
          time: session.time || '',
          duration: session.duration || '',
          subject: session.subject || '',
          price: session.price?.replace('$', '') || '',
          status: session.status || 'upcoming'
        });
      }
    }
  };

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming': return '#2e7d32';
      case 'completed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      default: return '#666666';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'upcoming': return <Clock size={16} />;
      case 'completed': return <Calendar size={16} />;
      case 'cancelled': return <X size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.modalTitle}>
              {mode === 'add' ? 'Add New Session' : 
               mode === 'edit' ? 'Edit Session' : 'Session Details'}
            </h2>
            {!isEditing && session && (
              <span 
                className={styles.statusBadge}
                style={{ 
                  backgroundColor: `${getStatusColor(session.status)}20`, 
                  color: getStatusColor(session.status),
                  borderColor: getStatusColor(session.status)
                }}
              >
                {getStatusIcon(session.status)}
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {/* Session Title */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <BookOpen size={18} />
              Session Title
            </label>
            {isEditing ? (
              <input
                type="text"
                className={styles.input}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter session title"
              />
            ) : (
              <div className={styles.displayValue}>{session?.title}</div>
            )}
          </div>

          {/* Tutor Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <User size={18} />
              Tutor
            </label>
            {isEditing ? (
              <input
                type="text"
                className={styles.input}
                value={formData.tutor}
                onChange={(e) => handleInputChange('tutor', e.target.value)}
                placeholder="Enter tutor name"
              />
            ) : (
              <div className={styles.displayValue}>{session?.tutor}</div>
            )}
          </div>

          <div className={styles.formRow}>
            {/* Date */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Calendar size={18} />
                Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  className={styles.input}
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              ) : (
                <div className={styles.displayValue}>{session?.date}</div>
              )}
            </div>

            {/* Time */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={18} />
                Time
              </label>
              {isEditing ? (
                <input
                  type="time"
                  className={styles.input}
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              ) : (
                <div className={styles.displayValue}>{session?.time}</div>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            {/* Duration */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Clock size={18} />
                Duration
              </label>
              {isEditing ? (
                <select
                  className={styles.input}
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                >
                  <option value="">Select duration</option>
                  <option value="30 min">30 minutes</option>
                  <option value="1 hr">1 hour</option>
                  <option value="1.5 hrs">1.5 hours</option>
                  <option value="2 hrs">2 hours</option>
                  <option value="3 hrs">3 hours</option>
                </select>
              ) : (
                <div className={styles.displayValue}>{session?.duration}</div>
              )}
            </div>

            {/* Subject */}
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <BookOpen size={18} />
                Subject
              </label>
              {isEditing ? (
                <select
                  className={styles.input}
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                >
                  <option value="">Select subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              ) : (
                <div className={styles.displayValue}>{session?.subject}</div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <DollarSign size={18} />
              Price
            </label>
            {isEditing ? (
              <div className={styles.priceInputContainer}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            ) : (
              <div className={styles.displayValue}>{session?.price}</div>
            )}
          </div>

          {/* Status (only editable in edit mode) */}
          {isEditing && (
            <div className={styles.formGroup}>
              <label className={styles.label}>
                <Calendar size={18} />
                Status
              </label>
              <select
                className={styles.input}
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          {isEditing ? (
            <>
              <button 
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleSave}
              >
                <Save size={18} />
                {mode === 'add' ? 'Create Session' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button 
                className={styles.cancelButton}
                onClick={onClose}
              >
                Close
              </button>
              {mode !== 'add' && (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={18} />
                  Edit Session
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionsModal;