import toast from 'react-hot-toast';

const baseOptions = {
  className: 'doc-toast',
};

export function useToast() {
  return {
    success: (message) =>
      toast.success(message, {
        ...baseOptions,
        iconTheme: { primary: '#22c55e', secondary: '#04110b' },
      }),
    error: (message) =>
      toast.error(message, {
        ...baseOptions,
        iconTheme: { primary: '#ef4444', secondary: '#140707' },
      }),
    info: (message) =>
      toast(message, {
        ...baseOptions,
        icon: 'i',
      }),
  };
}
