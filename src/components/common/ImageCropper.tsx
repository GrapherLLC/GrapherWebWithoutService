'use client'

import { useState, useRef, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop, PercentCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageFile: File
  onCropComplete: (croppedBlob: Blob) => void
  onCancel: () => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ imageFile, onCropComplete, onCancel }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load image when component mounts
  useEffect(() => {
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '')
    })
    reader.addEventListener('error', () => {
      setError('Failed to load image')
    })
    reader.readAsDataURL(imageFile)

    return () => {
      reader.abort()
    }
  }, [imageFile])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 1)) // 1 for square aspect ratio
  }

  async function cropImage() {
    if (loading) return // Prevent multiple clicks
    setLoading(true)
    setError(null)
    
    try {
      if (!imgRef.current || !completedCrop) {
        throw new Error('No image or crop data')
      }

      // Create two canvases - one for cropping, one for resizing
      const cropCanvas = document.createElement('canvas')
      const resizeCanvas = document.createElement('canvas')
      const cropCtx = cropCanvas.getContext('2d')
      const resizeCtx = resizeCanvas.getContext('2d')

      if (!cropCtx || !resizeCtx) {
        throw new Error('Failed to get canvas context')
      }

      const image = imgRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height

      // Set dimensions for the crop canvas
      cropCanvas.width = completedCrop.width
      cropCanvas.height = completedCrop.height

      // Draw the cropped image
      cropCtx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height,
      )

      // Set fixed dimensions for the final resized image
      const TARGET_SIZE = 512
      resizeCanvas.width = TARGET_SIZE
      resizeCanvas.height = TARGET_SIZE

      // Enable image smoothing for better quality
      resizeCtx.imageSmoothingEnabled = true
      resizeCtx.imageSmoothingQuality = 'high'

      // Draw the cropped image onto the resize canvas
      resizeCtx.drawImage(
        cropCanvas,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE
      )

      return new Promise<void>((resolve, reject) => {
        resizeCanvas.toBlob(
          async (blob) => {
            if (blob) {
              try {
                await onCropComplete(blob)
                resolve()
              } catch (error) {
                reject(error)
              }
            } else {
              reject(new Error('Failed to create image blob'))
            }
          },
          'image/jpeg',
          0.85 // Slightly reduced quality for better file size
        )
      })
    } catch (error) {
      console.error('Error cropping image:', error)
      setError(error instanceof Error ? error.message : 'Failed to crop image')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-xl font-semibold text-dark-text-primary">
            Crop Your Photo
          </h3>
          <p className="text-sm text-dark-text-secondary mt-1">
            Drag to reposition and use the corners to resize. The circular overlay shows how your photo will appear.
          </p>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 text-red-400 rounded-md p-4 text-sm mb-4">
              {error}
            </div>
          )}
          
          {imgSrc && (
            <div className="flex items-center justify-center min-h-[500px]">
              <ReactCrop
                crop={crop}
                onChange={(pixelCrop: PixelCrop, percentCrop: PercentCrop) => setCrop(percentCrop)}
                onComplete={(c: PixelCrop) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
                className="max-h-[600px] bg-dark-input rounded-lg"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={imgSrc}
                  onLoad={onImageLoad}
                  className="max-h-[600px] max-w-full"
                  style={{ maxWidth: '100%' }}
                />
              </ReactCrop>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-dark-border flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 border border-dark-border text-dark-text-primary rounded-md hover:bg-dark-input transition-colors text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={cropImage}
            disabled={!completedCrop?.width || !completedCrop?.height || loading}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors text-base flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>Apply Crop</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 