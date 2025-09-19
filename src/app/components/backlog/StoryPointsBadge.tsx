'use client';

interface StoryPointsBadgeProps {
  points?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onPointsChange?: (points: number | undefined) => void;
}

const sizeClasses = {
  sm: {
    container: 'text-xs min-w-[20px] h-5',
    font: 'text-xs'
  },
  md: {
    container: 'text-sm min-w-[24px] h-6',
    font: 'text-sm'
  },
  lg: {
    container: 'text-base min-w-[28px] h-7',
    font: 'text-base'
  }
};

export function StoryPointsBadge({ 
  points, 
  size = 'sm', 
  interactive = false,
  onPointsChange 
}: StoryPointsBadgeProps) {
  const sizeClass = sizeClasses[size];

  if (interactive && onPointsChange) {
    return (
      <div className="relative group">
        <input
          type="number"
          value={points || ''}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onPointsChange(value);
          }}
          placeholder="SP"
          className={`
            ${sizeClass.container} ${sizeClass.font}
            px-2 rounded-full border-2 text-center font-bold
            bg-amber-50 border-amber-200 text-amber-800 
            hover:bg-amber-100 hover:border-amber-300
            focus:bg-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20
            dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300
            dark:hover:bg-amber-900/30 dark:hover:border-amber-600
            dark:focus:bg-amber-900/40 dark:focus:border-amber-500
            transition-all duration-200
            placeholder-amber-600 dark:placeholder-amber-400
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />
        
        {/* Tooltip */}
        <div className="
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1
          px-2 py-1 bg-gray-900 text-white text-xs rounded
          opacity-0 group-hover:opacity-100 transition-opacity duration-200
          pointer-events-none z-10
          dark:bg-gray-700
        ">
          Story Points
        </div>
      </div>
    );
  }

  if (!points) {
    return (
      <div className={`
        ${sizeClass.container} ${sizeClass.font}
        px-2 rounded-full border-2 text-center font-bold
        bg-gray-100 border-gray-300 text-gray-500
        dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400
      `}>
        —
      </div>
    );
  }

  // Determinar color basado en el número de puntos
  const getPointsColor = (pts: number) => {
    if (pts <= 1) return 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
    if (pts <= 3) return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300';
    if (pts <= 5) return 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
    if (pts <= 8) return 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-700 dark:text-orange-300';
    return 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
  };

  return (
    <div className={`
      ${sizeClass.container} ${sizeClass.font}
      px-2 rounded-full border-2 text-center font-bold
      ${getPointsColor(points)}
    `}>
      {points}
    </div>
  );
}
