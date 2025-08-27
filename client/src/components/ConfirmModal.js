
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './ConfirmModal.scss';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    onClick={onClose}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                >
                    <motion.div
                        className="modal-content"
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                        role="alertdialog"
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.96, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    >
                        <h2 id="modal-title" className="modal-title">{title}</h2>
                        <p className="modal-message">{message}</p>
                        <div className="modal-actions">
                            <button
                                className="modal-button modal-button--secondary"
                                onClick={onClose}
                                aria-label="Cancel"
                            >
                                {cancelText || 'Cancel'}
                            </button>
                            <button
                                className="modal-button modal-button--primary"
                                onClick={onConfirm}
                                aria-label={confirmText || 'Confirm'}
                            >
                                {confirmText || 'Confirm'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default ConfirmModal;
