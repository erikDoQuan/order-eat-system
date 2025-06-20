import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Loading } from '../ui/loading';

type ModalLoadingProps = {
  visible: boolean;
  onClose?: () => void;
};

export const ModalLoading: FC<ModalLoadingProps> = ({ visible = false, onClose }) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <AlertDialog open={isVisible}>
      <AlertDialogContent className="flex max-w-32 flex-col items-center justify-center">
        <VisuallyHidden>
          <AlertDialogHeader>
            <AlertDialogTitle>Loading...</AlertDialogTitle>
            <AlertDialogDescription>Loading...</AlertDialogDescription>
          </AlertDialogHeader>
        </VisuallyHidden>
        <Loading thickness={6} size={'lg'} onClick={onClose} />
      </AlertDialogContent>
    </AlertDialog>
  );
};
