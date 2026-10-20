import { useState, type FC, type ImgHTMLAttributes } from 'react'
import { Building2 } from 'lucide-react'

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt: string
  fallbackSrc?: string
  aspectRatioClass?: string
  className?: string
  containerClassName?: string
}

export const LazyImage: FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/src/assets/apollo-hospital.jpg',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const currentSrc = hasError || !src ? fallbackSrc : src

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${containerClassName}`}>
      {/* Skeleton Pulse Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse flex items-center justify-center">
          <Building2 className="size-8 text-slate-300 animate-bounce" />
        </div>
      )}

      {/* Actual Image with Lazy Loading */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (!hasError && currentSrc !== fallbackSrc) {
            setHasError(true)
          } else {
            setIsLoaded(true)
          }
        }}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${className}`}
        {...props}
      />
    </div>
  )
}
