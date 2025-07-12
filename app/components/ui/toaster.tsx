import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9);
  toasts.push({ ...toast, id });
  listeners.forEach(listener => listener([...toasts]));
  
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, 5000);
}

export function useToast() {
  return {
    toast: addToast,
  };
}

export function Toaster() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToastList(newToasts);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-lg shadow-lg min-w-[300px] max-w-[500px]
            ${toast.variant === 'destructive' ? 'bg-red-600 text-white' : 
              toast.variant === 'success' ? 'bg-green-600 text-white' : 
              'bg-white border border-gray-200 text-gray-900'}
          `}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90 mt-1">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
}