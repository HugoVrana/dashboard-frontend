"use client"

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]

interface AvatarUploadLabels {
  upload?: string
  change?: string
  remove?: string
}

interface AvatarUploadProps {
  value?: File | string | null
  onImageSelect?: (file: File | null) => void
  className?: string
  disabled?: boolean
  accept?: string
  size?: "default" | "sm" | "lg" | "xl"
  fallback?: React.ReactNode
  labels?: AvatarUploadLabels
}

const defaultLabels: Required<AvatarUploadLabels> = {
  upload: "Upload",
  change: "Change",
  remove: "Remove",
}

function AvatarUpload({
  value,
  onImageSelect,
  className,
  disabled = false,
  accept = ACCEPTED_IMAGE_TYPES.join(","),
  size = "xl",
  fallback,
  labels,
}: AvatarUploadProps) {
  const resolvedLabels = { ...defaultLabels, ...labels }
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

  const sizeClasses = {
    sm: "size-16",
    default: "size-20",
    lg: "size-24",
    xl: "size-32",
  }

  const defaultFallback = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-1/2"
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )

  return (
    <div
      data-slot="avatar-upload"
      className={cn("flex flex-col items-center gap-3", className)}
    >
      <div
        data-slot="avatar-upload-dropzone"
        data-drag-over={isDragOver || undefined}
        className={cn(
          "relative cursor-pointer rounded-full transition-all",
          "ring-2 ring-transparent ring-offset-2 ring-offset-background",
          "data-[drag-over]:ring-primary",
          "hover:ring-muted-foreground/50",
          disabled && "pointer-events-none opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <Avatar
          size={size === "xl" ? "lg" : size}
          className={cn(
            sizeClasses[size],
            "border-2 border-dashed border-input",
            preview && "border-solid border-border"
          )}
        >
          {preview ? (
            <AvatarImage src={preview} alt="Profile preview" />
          ) : null}
          <AvatarFallback className="bg-muted">
            {fallback ?? defaultFallback}
          </AvatarFallback>
        </Avatar>

        {/* Hover overlay with camera icon */}
        <div
          data-slot="avatar-upload-overlay"
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity",
            "hover:opacity-100",
            isDragOver && "opacity-100"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6"
          >
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
            <circle cx="12" cy="13" r="3" />
          </svg>
        </div>
      </div>

      {/* Action buttons */}
      <div
        data-slot="avatar-upload-actions"
        className="flex items-center gap-2"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={disabled}
        >
          {preview ? resolvedLabels.change : resolvedLabels.upload}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
          >
            {resolvedLabels.remove}
          </Button>
        )}
      </div>
    </div>
  )
}

export { AvatarUpload, type AvatarUploadProps }
