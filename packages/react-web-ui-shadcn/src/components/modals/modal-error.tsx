import type { FC, ReactNode } from 'react';

import ErrorIcon from '../icons/error';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';

type ModalErrorProps = {
  visible: boolean;
  title: string;
  message?: ReactNode;
  btnClose?: string;
  onClose: () => void;
};

export const ModalError: FC<ModalErrorProps> = ({ visible = false, title, message, btnClose, onClose }) => {
  return (
    <AlertDialog open={visible}>
      <AlertDialogContent className="flex-col justify-center text-center">
        <ErrorIcon className="mx-auto" width={60} />
        <AlertDialogTitle className="text-red-500">{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
        <Button variant="outline" onClick={onClose}>
          {btnClose ?? 'Close'}
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};
