import React, { forwardRef, useImperativeHandle, Ref, useEffect } from 'react';

import { Text } from 'react-figma-ui/ui';
import styles from './styles.module.scss';

export interface ToastRefI {
  show: (params: ToastIPropsI) => void;
}

export const Toast = forwardRef<ToastRefI, {}>((_, ref: Ref<ToastRefI>) => {
  const [toasts, setToasts] = React.useState<ToastIPropsI[]>([]);

  useImperativeHandle(ref as Ref<ToastRefI>, () => ({
    show: (params) => {
      setToasts([
        ...toasts,
        {
          title: params.title ?? 'Title',
          message: params.message,
          options: {
            type: params.options?.type ?? 'info',
            timeout: params.options?.timeout ?? 5000,
            onClose: params.options?.onClose,
          },
        },
      ]);
    },
  }));

  const handleClose = (index: number) => {
    const toast = toasts[index];
    toast.options?.onClose?.();
    setToasts(toasts.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (toasts[0]?.options?.type === 'error') {
      return;
    }

    const timeout = setTimeout(() => {
      if (toasts.length) {
        handleClose(0);
      }
    }, toasts[0]?.options?.timeout || 3000);

    return () => clearTimeout(timeout);
  }, [toasts]);

  return (
    <div className={styles.toastContainer}>
      <div className={styles.toastWrapper}>
        {toasts.map((toast, index) => (
          <div
            key={index}
            className={`${styles.toast} ${styles[toast.options.type ?? 'info']}`}
            onClick={() => handleClose(index)}
          >
            <Text fontWeight="bold" className={styles.title}>
              {toast.options.type === 'error'
                ? '⛔️ '
                : toast.options.type === 'warn'
                  ? '⚠️ '
                  : '🎉 '}
              {toast.title}
            </Text>

            <Text className={styles.message}>{toast.message}</Text>
          </div>
        ))}
      </div>
    </div>
  );
});
