import { useEffect, useMemo, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { t } from '@/i18n';
import { cropImageToBlob, type CropArea } from '@/lib/image-crop';
import { toast } from 'sonner';

type ImageCropDialogProps = {
  /** 원본 파일. null 이면 다이얼로그 닫힘. */
  file: File | null;
  /** crop 영역의 가로/세로 비율 (예: 프로필 1, 배경 16/5). */
  aspect: number;
  /** 출력 이미지의 최대 변 크기 (px). 가로/세로 중 긴 쪽 기준. */
  maxOutputSize: number;
  /** 다이얼로그 제목 ('profile' 이면 프로필 라벨, 'cover' 면 배경 라벨). */
  variant: 'profile' | 'cover';
  /** 적용 시 잘린 Blob 을 전달. 호출 후 다이얼로그는 닫힘. */
  onConfirm: (blob: Blob) => void;
  /** 취소/닫기. */
  onCancel: () => void;
};

export function ImageCropDialog({
  file,
  aspect,
  maxOutputSize,
  variant,
  onConfirm,
  onCancel,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<CropArea | null>(null);
  const [busy, setBusy] = useState(false);

  const imageSrc = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!imageSrc) return;
    return () => URL.revokeObjectURL(imageSrc);
  }, [imageSrc]);

  // 새 파일이 들어오면 crop/zoom 초기화.
  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }, [file]);

  const handleApply = async () => {
    if (!imageSrc || !croppedArea) return;
    setBusy(true);
    try {
      const blob = await cropImageToBlob(imageSrc, croppedArea, maxOutputSize);
      onConfirm(blob);
    } catch {
      toast.error(t.user.image.cropFailed);
    } finally {
      setBusy(false);
    }
  };

  const open = file !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {variant === 'profile' ? t.user.crop.titleProfile : t.user.crop.titleCover}
          </DialogTitle>
          <DialogDescription>{t.user.crop.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="relative h-80 w-full overflow-hidden rounded-md bg-muted">
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedArea(areaPixels)}
                showGrid={false}
              />
            ) : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="crop-zoom" className="text-xs text-muted-foreground">
              {t.user.crop.zoomLabel}
            </Label>
            <input
              id="crop-zoom"
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={busy}
          >
            {t.common.cancel}
          </Button>
          <Button
            type="button"
            onClick={handleApply}
            disabled={busy || !croppedArea}
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {t.user.crop.apply}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
