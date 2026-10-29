import { type FC } from 'react'

interface IndustrialSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  color?: 'gray' | 'slate' | 'orange' | 'brand' | 'white' | 'currentColor'
  animationMode?: 'chaser' | 'stepped' | 'smooth'
  withReflection?: boolean
  className?: string
  label?: string
}

const sizeMap = {

  xs: { box: 'size-4 min-w-[16px] min-h-[16px] shrink-0', svgSize: 16 },
  sm: { box: 'size-5 min-w-[20px] min-h-[20px] shrink-0', svgSize: 20 },
  md: { box: 'size-7 min-w-[28px] min-h-[28px] shrink-0', svgSize: 28 },
  lg: { box: 'size-10 min-w-[40px] min-h-[40px] shrink-0', svgSize: 40 },
  xl: { box: 'size-14 min-w-[56px] min-h-[56px] shrink-0', svgSize: 56 },
  '2xl': { box: 'size-20 min-w-[80px] min-h-[80px] shrink-0', svgSize: 80 },




}

const colorMap = {
  gray: {
    fill: '#475569', // slate-600
    cssClass: 'fill-slate-600',
    glow: 'rgba(71, 85, 105, 0.18)',
  },
  slate: {
    fill: '#334155', // slate-700
    cssClass: 'fill-slate-700',
    glow: 'rgba(51, 65, 85, 0.18)',
  },
  orange: {
    fill: '#f97316', // orange-500 (matching iconscout reference)
    cssClass: 'fill-orange-500',
    glow: 'rgba(249, 115, 22, 0.25)',
  },
  brand: {
    fill: '#2563eb', // blue-600
    cssClass: 'fill-blue-600',
    glow: 'rgba(37, 99, 235, 0.22)',
  },
  white: {
    fill: '#ffffff',
    cssClass: 'fill-white',
    glow: 'rgba(255, 255, 255, 0.3)',
  },
  currentColor: {
    fill: 'currentColor',
    cssClass: 'fill-current',
    glow: 'transparent',
  },
}

// 8 radial capsule petal spokes around 360 degrees (45 deg apart)
const PETALS = [
  { index: 0, angle: 0, baseOpacity: 1.0 },
  { index: 1, angle: 45, baseOpacity: 0.86 },
  { index: 2, angle: 90, baseOpacity: 0.72 },
  { index: 3, angle: 135, baseOpacity: 0.58 },
  { index: 4, angle: 180, baseOpacity: 0.44 },
  { index: 5, angle: 225, baseOpacity: 0.32 },
  { index: 6, angle: 270, baseOpacity: 0.2 },
  { index: 7, angle: 315, baseOpacity: 0.1 },
]

export const IndustrialSpinner: FC<IndustrialSpinnerProps> = ({
  size = 'md',
  color = 'gray',
  animationMode = 'chaser',
  withReflection = false,
  className = '',
  label,
}) => {
  const currentSize = sizeMap[size] || sizeMap.md
  const currentColor = colorMap[color] || colorMap.gray

  // Unique ID prefix for inline keyframes without conflicting
  const animName = `spokeChaser_${color}`

  return (
    <div
      role="status"
      aria-label={label || 'Loading...'}
      className={`inline-flex flex-col items-center justify-center relative select-none shrink-0 ${className}`}
    >
      {/* SVG Container */}
      <div className={`relative ${currentSize.box} flex items-center justify-center shrink-0`}>
        <svg
          width={currentSize.svgSize}
          height={currentSize.svgSize}
          style={{ width: `${currentSize.svgSize}px`, height: `${currentSize.svgSize}px`, minWidth: `${currentSize.svgSize}px`, minHeight: `${currentSize.svgSize}px`, flexShrink: 0 }}
          viewBox="0 0 40 40"
          className={`w-full h-full overflow-visible ${
            animationMode === 'smooth'
              ? 'animate-spin [animation-duration:0.8s]'
              : animationMode === 'stepped'
                ? 'animate-[spin_0.8s_steps(8)_infinite]'
                : ''
          }`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>
            {`
              @keyframes ${animName} {
                0% { opacity: 1; transform: scale(1.05); }
                50% { opacity: 0.25; transform: scale(0.95); }
                100% { opacity: 0.12; transform: scale(0.92); }
              }
            `}
          </style>

          {/* 8 Capsule Petal Rays */}
          <g>
            {PETALS.map((petal) => {
              // In 'chaser' mode, animate each petal's opacity with staggered delay
              const delay = -(8 - petal.index) * 0.1
              const style =
                animationMode === 'chaser'
                  ? {
                      animation: `${animName} 0.8s linear infinite`,
                      animationDelay: `${delay}s`,
                      transformOrigin: '20px 20px',
                    }
                  : {
                      opacity: petal.baseOpacity,
                      transformOrigin: '20px 20px',
                    }

              return (
                <rect
                  key={petal.index}
                  x="17.6"
                  y="3.2"
                  width="4.8"
                  height="10"
                  rx="2.4"
                  ry="2.4"
                  fill={currentColor.fill}
                  className={currentColor.cssClass}
                  style={style}
                  transform={`rotate(${petal.angle} 20 20)`}
                />
              )
            })}
          </g>
        </svg>

        {/* Ambient glow backing for high-tech industrial aesthetic */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none -z-10 blur-sm opacity-50"
          style={{ background: currentColor.glow }}
        />
      </div>

      {/* Optional Mirror Floor Reflection (matching reference image) */}
      {withReflection && (
        <div
          aria-hidden="true"
          className="w-full flex items-center justify-center pointer-events-none overflow-hidden h-4 -mt-1 opacity-25"
          style={{
            transform: 'scaleY(-0.7)',
            filter: 'blur(0.8px)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          }}
        >
          <svg
            width={currentSize.svgSize}
          height={currentSize.svgSize}
          style={{ width: `${currentSize.svgSize}px`, height: `${currentSize.svgSize}px`, minWidth: `${currentSize.svgSize}px`, minHeight: `${currentSize.svgSize}px`, flexShrink: 0 }}
          viewBox="0 0 40 40"
            className={`${currentSize.box}`}
            xmlns="http://www.w3.org/2000/svg"
          >
            {PETALS.map((petal) => (
              <rect
                key={petal.index}
                x="17.6"
                y="3.2"
                width="4.8"
                height="10"
                rx="2.4"
                ry="2.4"
                fill={currentColor.fill}
                opacity={petal.baseOpacity * 0.7}
                transform={`rotate(${petal.angle} 20 20)`}
              />
            ))}
          </svg>
        </div>
      )}

      {label && <span className="sr-only">{label}</span>}
    </div>
  )
}
