import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop } from 'react-image-crop'
import { X, Loader2 } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

interface PortfolioMediaCropperProps {
  file: File
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
  config?: {
    aspectRatio?: number
    maxWidth?: number
    maxHeight?: number
    quality?: number
  }
}

export default function PortfolioMediaCropper({
  file,
  onCropComplete,
  onCancel,
  config = {
    aspectRatio: 1,
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.9
  }
}: PortfolioMediaCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string>('')
  const mediaRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    setMediaUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const cropSize = Math.min(width, height)
    const x = (width - cropSize) / 2
    const y = (height - cropSize) / 2

    setCrop({
      unit: '%',
      x: (x / width) * 100,
      y: (y / height) * 100,
      width: (cropSize / width) * 100,
      height: (cropSize / height) * 100
    })
  }

  const handleCrop = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!mediaRef.current || !crop) {
        throw new Error('No media or crop data')
      }

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No 2d context')

      const image = mediaRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      const pixelCrop = {
        x: (crop.x * image.width * scaleX) / 100,
        y: (crop.y * image.height * scaleY) / 100,
        width: (crop.width * image.width * scaleX) / 100,
        height: (crop.height * image.height * scaleY) / 100
      }

      const cropSize = Math.min(pixelCrop.width, pixelCrop.height, config.maxWidth!)
      canvas.width = cropSize
      canvas.height = cropSize

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        cropSize,
        cropSize
      )

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          'image/jpeg',
          config.quality
        )
      })
      await onCropComplete(blob)
    } catch (err) {
      console.error('Error cropping image:', err)
      setError(err instanceof Error ? err.message : 'Failed to crop image')
    } finally {
      setLoading(false)
    }
  }, [crop, config, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-dark-card rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-dark-border flex justify-between items-center">
          <h3 className="text-lg font-medium text-dark-text-primary">
            Crop Image
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-dark-input rounded-full z-50"
          >
            <X className="w-5 h-5 text-dark-text-primary" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-md text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="relative bg-dark-input rounded-lg overflow-hidden flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={config.aspectRatio}
              className="max-h-[calc(90vh-12rem)] flex items-center justify-center"
              minWidth={100}
              minHeight={100}
            >
              <img
                ref={mediaRef}
                alt="Crop preview"
                src={mediaUrl}
                onLoad={onImageLoad}
                className="max-h-[calc(90vh-12rem)] w-auto object-contain"
              />
            </ReactCrop>
          </div>
        </div>

        <div className="p-4 bg-dark-bg border-t border-dark-border flex justify-end gap-3 sticky bottom-0 z-50">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-dark-text-primary hover:bg-dark-input rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            disabled={loading || !crop?.width || !crop?.height}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  )
}