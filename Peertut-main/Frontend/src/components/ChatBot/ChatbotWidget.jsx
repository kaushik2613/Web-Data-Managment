// components/Chatbot/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import styles from './ChatbotWidget.module.css';
import Chatbot from './Chatbot';

const ChatbotWidget = ({ geminiApiKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const buttonRef = useRef(null);
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Handle Escape key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Store current focus
      previousFocusRef.current = document.activeElement;
      
      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
    } else if (!isOpen && previousFocusRef.current) {
      // Restore focus when closed
      previousFocusRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Trap focus within modal when open
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, isMinimized]);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          ref={buttonRef}
          onClick={openChat}
          className={styles.floatingButton}
          aria-label="Open chatbot"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        >
          <MessageCircle size={28} />
          <span className={styles.buttonText}>Chat</span>
        </button>
      )}

      {/* Chatbot Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className={styles.backdrop}
            onClick={closeChat}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div
            ref={modalRef}
            className={`${styles.chatModal} ${isMinimized ? styles.minimized : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-title"
          >
            {/* Modal Header */}
            <div className={styles.modalHeader}>
              <h2 id="chatbot-title" className={styles.modalTitle}>
                <MessageCircle size={20} aria-hidden="true" />
                AI Assistant
              </h2>
              <div className={styles.headerActions}>
                <button
                  onClick={toggleMinimize}
                  className={styles.iconButton}
                  aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
                  title={isMinimized ? "Maximize" : "Minimize"}
                >
                  <Minimize2 size={20} />
                </button>
                <button
                  onClick={closeChat}
                  className={styles.iconButton}
                  aria-label="Close chatbot"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Chatbot Content */}
            {!isMinimized && (
              <div className={styles.modalBody}>
                <Chatbot geminiApiKey={geminiApiKey} />
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ChatbotWidget;