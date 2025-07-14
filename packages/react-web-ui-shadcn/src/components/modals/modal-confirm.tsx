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
  btnYesClassName?: string;
};

export const ModalConfirm: FC<ModalConfirmProps> = ({ visible = false, title, message, btnYes, btnNo, onYes, onNo, btnYesClassName }) => {
  return (
    <AlertDialog open={visible}>
      <AlertDialogContent>
        {/* Đường kẻ đỏ dài sát mép trên, margin ngang -24px như ban đầu, cao 16px */}
        <div style={{ height: 16, background: '#dc2626', borderRadius: 0, margin: '-24px -24px 0 -24px' }} />
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onNo}>{btnNo ?? 'No'}</AlertDialogCancel>
          <AlertDialogAction onClick={onYes} className={btnYesClassName}>{btnYes ?? 'Yes'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

ModalConfirm.displayName = 'ModalConfirm';
