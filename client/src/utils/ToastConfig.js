/**
 * ToastConfig.js
 * Centralized toast notification configuration
 */
import { toast } from 'react-toastify';

// Default toast settings
const DEFAULT_TOAST_OPTIONS = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast with consistent styling and behavior
export const showSuccessToast = (message) => {
  return toast.success(message, {
    ...DEFAULT_TOAST_OPTIONS,
    icon: "🎉",
  });
};

// Error toast with consistent styling and behavior
export const showErrorToast = (message) => {
  return toast.error(message, {
    ...DEFAULT_TOAST_OPTIONS,
    autoClose: 7000, // Longer display time for errors
    icon: "❌",
  });
};

// Warning toast with consistent styling and behavior
export const showWarningToast = (message) => {
  return toast.warning(message, {
    ...DEFAULT_TOAST_OPTIONS,
    icon: "⚠️",
  });
};

// Info toast with consistent styling and behavior
export const showInfoToast = (message) => {
  return toast.info(message, {
    ...DEFAULT_TOAST_OPTIONS,
    icon: "ℹ️",
  });
};

// Loading toast that can be updated with a success/error message
export const showLoadingToast = (initialMessage) => {
  const toastId = toast.loading(initialMessage, {
    ...DEFAULT_TOAST_OPTIONS,
    autoClose: false, // Don't auto close while loading
  });

  // Return functions to update this specific toast
  return {
    updateWithSuccess: (message) => {
      toast.update(toastId, {
        render: message,
        type: "success",
        isLoading: false,
        icon: "🎉",
        autoClose: 5000, // Auto close after update
      });
    },
    updateWithError: (message) => {
      toast.update(toastId, {
        render: message,
        type: "error",
        isLoading: false,
        icon: "❌",
        autoClose: 7000, // Auto close after update
      });
    },
    dismiss: () => {
      toast.dismiss(toastId);
    }
  };
};

// Configure global toast container
export const toastContainerConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  newestOnTop: true,
  closeOnClick: true,
  rtl: false,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true,
  theme: "light" // Can be "light" or "dark"
};
