export interface ImageUploadProps {
    value?: File | string | null
    onImageSelect?: (file: File | null) => void
    className?: string
    disabled?: boolean
    accept?: string
    icon?: React.ReactNode
    title?: string
    description?: string
    browseButtonText?: string
}