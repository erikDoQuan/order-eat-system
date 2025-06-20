import type { FC } from 'react';
import type { Area } from 'react-easy-crop';
import { useCallback, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Cropper from 'react-easy-crop';

import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Slider } from '../ui/slider';

type ModalCropImageProps = {
  visible: boolean;
  image: string;
  btnClose?: string;
  btnDone?: string;
  isLoading?: boolean;
  onClose?: () => void;
  onCropComplete?: (blob: Blob) => void;
};

export const ModalCropImage: FC<ModalCropImageProps> = ({
  visible = false,
  image,
  btnClose,
  btnDone,
  onClose,
  onCropComplete,
  isLoading = false,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixelsInfo, setCroppedAreaPixelsInfo] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixelsInfo(croppedAreaPixels);
  }, []);

  const handleUploadClick = async () => {
    if (!croppedAreaPixelsInfo) return;

    const cropped = await getCroppedImg(image, croppedAreaPixelsInfo, rotation);

    if (!cropped) return;

    onCropComplete?.(cropped);
    onClose?.();
  };

  return (
    <Dialog open={visible} modal={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
          <VisuallyHidden>
            <DialogDescription>Crop Image</DialogDescription>
          </VisuallyHidden>
        </DialogHeader>
        <div className="relative h-72 w-full">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            showGrid={false}
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="my-4 flex gap-6">
          <div className="flex w-full items-center gap-x-2">
            <span>Zoom</span>
            <Slider defaultValue={[1]} min={1} max={3} step={0.1} value={[zoom]} onValueChange={value => setZoom(value[0]!)} />
          </div>
          <div className="flex w-full items-center gap-x-2">
            <span>Rotation</span>
            <Slider defaultValue={[0]} min={0} max={360} step={1} value={[rotation]} onValueChange={value => setRotation(value[0]!)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {btnClose ?? 'Close'}
          </Button>
          <Button onClick={handleUploadClick} disabled={isLoading}>
            {btnDone ?? 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper functions remain unchanged
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180;
}

function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRadian = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRadian) * width) + Math.abs(Math.sin(rotRadian) * height),
    height: Math.abs(Math.sin(rotRadian) * width) + Math.abs(Math.cos(rotRadian) * height),
  };
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0, flipHorizontal = false, flipVertical = false): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const rotRadian = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRadian);
  ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(canvas, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);

  const maxWidth = 320;
  const maxHeight = 320;
  const aspectRatio = pixelCrop.width / pixelCrop.height;

  let newWidth = pixelCrop.width;
  let newHeight = pixelCrop.height;

  if (newWidth > maxWidth || newHeight > maxHeight) {
    if (aspectRatio > 1) {
      newWidth = maxWidth;
      newHeight = maxWidth / aspectRatio;
    } else {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }
  }

  const finalCanvas = document.createElement('canvas');
  const finalCtx = finalCanvas.getContext('2d');

  if (!finalCtx) return null;

  finalCanvas.width = newWidth;
  finalCanvas.height = newHeight;

  finalCtx.drawImage(croppedCanvas, 0, 0, pixelCrop.width, pixelCrop.height, 0, 0, newWidth, newHeight);

  return new Promise((resolve, reject) => {
    finalCanvas.toBlob(file => {
      if (file) {
        resolve(file);
      } else {
        reject(new Error('Blob creation failed'));
      }
    }, 'image/jpeg');
  });
}
