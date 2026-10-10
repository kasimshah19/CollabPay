"use client";

import { useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      // Focus first focusable element
      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      } else {
        contentRef.current?.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-ink/50 dark:bg-ink/80 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className="bg-surface w-full sm:w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl sm:rounded-t-2xl flex flex-col max-h-[90dvh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 focus:outline-none"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h2 id="modal-title" className="font-sora text-lg font-bold text-ink">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-ink rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-line bg-soft rounded-b-2xl flex items-center justify-end gap-3 flex-wrap sm:flex-nowrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  confirmLabel?: string;
  cancelText?: string;
  variant?: "primary" | "danger";
  loading?: boolean;
  children?: ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmLabel,
  cancelText = "Cancel",
  variant = "primary",
  loading = false,
  children,
}: ConfirmDialogProps) {
  const actualConfirmText = confirmLabel || confirmText || "Confirm";
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1 sm:flex-none">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading} className="flex-1 sm:flex-none">
            {loading ? "Please wait..." : actualConfirmText}
          </Button>
        </>
      }
    >
      <div className="text-muted">
        {description}
      </div>
      {children}
    </Modal>
  );
}
