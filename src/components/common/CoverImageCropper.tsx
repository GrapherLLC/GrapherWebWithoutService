import { useState, useRef } from 'react'
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import { X, Loader2 } from 'lucide-react'
import 'react-image-crop/dist/ReactCrop.css'

// Cover image specifications
const COVER_ASPECT_RATIO = 2.7 // 1920:720
const COVER_WIDTH = 1920
const COVER_HEIGHT = 720

interface CoverImageCropperProps {
  imageFile: File
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90, // Start with 90% width for better visibility
      },
      COVER_ASPECT_RATIO,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function CoverImageCropper({ imageFile, onCropComplete, onCancel }: CoverImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [imageSrc, setImageSrc] = useState<string>('')
  const imageRef = useRef<HTMLImageElement>(null)
  const [loading, setLoading] = useState(false)

  // Load the image when component mounts
  useState(() => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || '')
    })
    reader.readAsDataURL(imageFile)
  })

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height))
  }

  async function cropImage() {
    if (!imageRef.current || !crop) return

    setLoading(true)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('No 2d context')

      // Set the canvas size to our desired output size
      canvas.width = COVER_WIDTH
      canvas.height = COVER_HEIGHT

      // Draw the cropped image to match our specifications
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height

      const pixelCrop = {
        x: (crop.x * imageRef.current.width * scaleX) / 100,
        y: (crop.y * imageRef.current.height * scaleY) / 100,
        width: (crop.width * imageRef.current.width * scaleX) / 100,
        height: (crop.height * imageRef.current.height * scaleY) / 100,
      }

      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(
        imageRef.current,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        COVER_WIDTH,
        COVER_HEIGHT
      )

      // Convert the canvas to a Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
          },
          'image/jpeg',
          0.9 // Quality
        )
      })

      await onCropComplete(blob)
    } catch (error) {
      console.error('Error cropping image:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-dark-card rounded-lg p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-dark-text-primary">
            Crop Cover Image
          </h3>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-dark-text-secondary text-sm">
            Your cover image will be cropped to <span className="font-medium">{COVER_WIDTH}x{COVER_HEIGHT}px</span>.
            For best results, use an image that is at least this size.
          </p>
        </div>

        <div className="relative bg-dark-input rounded-lg overflow-hidden mb-4">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={COVER_ASPECT_RATIO}
              className="flex justify-center"
            >
              <img
                ref={imageRef}
                alt="Cover"
                src={imageSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] object-contain"
              />
            </ReactCrop>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-dark-text-primary hover:bg-dark-input rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={cropImage}
            disabled={loading || !crop}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Processing...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  )
} 