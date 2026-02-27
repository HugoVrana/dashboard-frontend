"use client"

import * as React from "react"
import {cn} from "@/app/lib/utils"
import {Button} from "./button"
import {ImageUploadProps} from "@/app/models/ui/imageUploadProps"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

function ImageUpload({
  value,
  onImageSelect,
  className,
  disabled = false,
  accept = ACCEPTED_IMAGE_TYPES.join(","),
  icon,
  title = "Drag and drop an image here",
  description = "JPG, PNG, GIF or WebP",
  browseButtonText = "Browse files",
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value)
      setPreview(url)
      return () => URL.revokeObjectURL(url)
    } else if (typeof value === "string" && value) {
      setPreview(value)
    } else {
      setPreview(null)
    }
  }, [value])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        onImageSelect?.(file)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onImageSelect?.(files[0])
    }
  }

  const handleClear = () => {
    onImageSelect?.(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div
      data-slot="image-upload"
      data-drag-over={isDragOver || undefined}
      data-has-image={!!preview || undefined}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
        "border-input bg-background",
        "data-[drag-over]:border-primary data-[drag-over]:bg-primary/5",
        "data-[has-image]:border-solid data-[has-image]:border-border",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        disabled={disabled}
        className="hidden"
      />

      {preview ? (
        <div
          data-slot="image-upload-preview"
          className="relative size-full min-h-32 p-2"
        >
          <img
            src={preview}
            alt="Preview"
            className="size-full rounded-md object-contain"
          />
          <div
            data-slot="image-upload-actions"
            className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 opacity-0 transition-opacity hover:opacity-100"
          >
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClick}
              disabled={disabled}
            >
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          data-slot="image-upload-empty"
          className="flex flex-col items-center justify-center gap-3 p-6 text-center"
        >
          <div className="text-muted-foreground">
            {icon ?? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {title}
            </p>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={disabled}
          >
            {browseButtonText}
          </Button>
        </div>
      )}
    </div>
  )
}

export { ImageUpload }
