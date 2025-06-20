import type { FC, ReactNode } from 'react';

import SuccessIcon from '../icons/success';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from '../ui/alert-dialog';
import { Button } from '../ui/button';

type ModalSuccessProps = {
  visible: boolean;
  title: string;
  message?: ReactNode;
  btnClose?: string;
  onClose: () => void;
};

export const ModalSuccess: FC<ModalSuccessProps> = ({ visible = false, title, message, btnClose, onClose }) => {
  return (
    <AlertDialog open={visible}>
      <AlertDialogContent className="flex-col justify-center text-center">
        <SuccessIcon className="mx-auto" width={60} />
        <AlertDialogTitle className="text-green-500">{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
        <Button variant="outline" onClick={onClose}>
          {btnClose ?? 'Close'}
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
};
