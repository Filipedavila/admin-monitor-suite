import { useEffect, useRef } from "react";

const modalStyles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 100000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: "8px",
    maxWidth: "400px",
    width: "90%",
    padding: "2rem 1.5rem 1.5rem 1.5rem",
    boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
    position: "relative",
    outline: "none", // Remove default outline
  },
  closeBtn: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#333",
  },
  title: {
    margin: 0,
    marginBottom: "1rem",
    fontSize: "1.25rem",
    fontWeight: 600,
  },
};

// initialFocusId (opcional): id do elemento a focar ao abrir; por omissão foca o primeiro focável.
export function Modal({ isOpen, onRequestClose, title, children, initialFocusId }) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement;
      
      // Use a small delay to ensure the modal is fully rendered
      const focusModal = () => {
        if (modalRef.current) {
          modalRef.current.focus();

          const initial = initialFocusId ? document.getElementById(initialFocusId) : null;
          if (initial && modalRef.current.contains(initial)) {
            initial.focus();
            return;
          }

          // Try to focus the first focusable element (button, input, etc.)
          const focusableElements = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          if (focusableElements.length > 0) {
            // Focus the first focusable element
            focusableElements[0].focus();
          }
        }
      };
      
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(focusModal);
    } else {
      // Restore focus to the previously focused element when modal closes
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, initialFocusId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onRequestClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onRequestClose]);

  if (!isOpen) return null;
  
  return (
    <div
      style={modalStyles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onRequestClose}
    >
      <div
        ref={modalRef}
        style={modalStyles.modal}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
        onKeyDown={(e) => {
          // Handle tab navigation within modal
          if (e.key === 'Tab') {
            const focusableElements = modalRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
              // Shift + Tab
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              // Tab
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }}
      >
        {title && <h2 id="modal-title" style={modalStyles.title}>{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
} 