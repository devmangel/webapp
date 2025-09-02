import React from 'react';

interface SpinnerProps {
  height?: number | string;
  width?: number | string;
  /** Hex, rgb(a) or CSS color */
  color?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
  /** Controls visibility without unmounting parents */
  visible?: boolean;
  /** Optional wrapper classname (e.g. for layout) */
  wrapperClass?: string;
  /** Optional wrapper inline styles */
  wrapperStyle?: React.CSSProperties | undefined;
  /** Circle stroke thickness in px */
  thickness?: number;
}

/**
 * Modern, accessible SVG spinner without external libraries.
 * - Smooth Material-like dash animation + rotation
 * - Customizable size, color and thickness
 */
const Spinner: React.FC<SpinnerProps> = ({
  height = 48,
  width = 48,
  color = '#fbbf24', // Amber 400 by default
  ariaLabel = 'Cargando…',
  visible = true,
  wrapperClass = '',
  wrapperStyle,
  thickness = 4,
}) => {
  if (!visible) return null;

  // Normalize size values
  const h = typeof height === 'number' ? `${height}px` : height;
  const w = typeof width === 'number' ? `${width}px` : width;

  // Circle geometry: viewBox is 50x50, radius fits within stroke
  const size = 50;
  const radius = 20; // centered circle (cx, cy = 25), radius 20
  const center = size / 2;

  return (
    <div
      className={wrapperClass}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: h, width: w, ...wrapperStyle }}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          transformOrigin: 'center',
          animation: 'spinner-rotate 2s linear infinite',
        }}
      >
        {/* Track (subtle background ring) */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth={thickness}
        />
        {/* Animated arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          style={{
            strokeDasharray: '1, 200',
            strokeDashoffset: 0,
            animation: 'spinner-dash 1.5s ease-in-out infinite',
          }}
        />
      </svg>
      <span className="sr-only">{ariaLabel}</span>

      {/* Component-scoped animations */}
      <style jsx>{`
        @keyframes spinner-rotate {
          100% { transform: rotate(360deg); }
        }
        @keyframes spinner-dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -15px;
          }
          100% {
            stroke-dasharray: 100, 200;
            stroke-dashoffset: -125px;
          }
        }
        /* Visually hidden but accessible text */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
};

export default Spinner;
