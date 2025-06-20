import type { FC, ReactNode } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type ModalConfirmProps = {
  visible: boolean;
  title?: string;
  message?: ReactNode;
  btnYes?: string;
  btnNo?: string;
  onYes: () => void;
  onNo: () => void;
};

export const ModalConfirm: FC<ModalConfirmProps> = ({ visible = false, title, message, btnYes, btnNo, onYes, onNo }) => {
  return (
    <AlertDialog open={visible}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onNo}>{btnNo ?? 'No'}</AlertDialogCancel>
          <AlertDialogAction onClick={onYes}>{btnYes ?? 'Yes'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ModalConfirm.displayName = 'ModalConfirm';
