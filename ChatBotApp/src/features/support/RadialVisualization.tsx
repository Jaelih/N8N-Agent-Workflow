import React, { useEffect, useState } from 'react';
import { designTokens } from '../../design-system/tokens';

interface RadialVisualizationProps {
  status: 'idle' | 'connecting' | 'active' | 'ending';
  duration?: number;
}

export const RadialVisualization: React.FC<RadialVisualizationProps> = ({ 
  status, 
  duration = 0 
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (status === 'active' || status === 'connecting') {
      const interval = setInterval(() => {
        setRotation((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case 'connecting':
        return designTokens.colors.semantic.warning;
      case 'active':
        return designTokens.colors.pldt.red;
      case 'ending':
        return designTokens.colors.neutral.gray500;
      default:
        return designTokens.colors.neutral.gray300;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center h-full w-full max-w-sm mx-auto overflow-hidden">
      <div className="relative flex items-center justify-center w-full aspect-square max-w-[350px] lg:max-w-[400px] overflow-hidden">
        {/* Background gradient glow */}
        {(status === 'active' || status === 'connecting') && (
          <div 
            className="absolute inset-0 opacity-20 blur-xl animate-pulse-slow pointer-events-none z-0"
            style={{
              background: designTokens.gradients.radialGlow,
              width: '100%',
              height: '100%',
            }}
          />
        )}

        {/* Main radial circle container */}
        <div className="relative flex items-center justify-center w-full h-full z-10">
          {/* Outer ring - segmented */}
          <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 400 400"
            className="absolute w-full h-full"
            style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.05s linear' }}
          >
            {/* Outer segmented ring */}
            <defs>
              <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={designTokens.colors.pldt.red} stopOpacity={status === 'active' ? '1' : '0.3'} />
                <stop offset="50%" stopColor={designTokens.colors.pldt.redDark} stopOpacity={status === 'active' ? '0.8' : '0.2'} />
                <stop offset="100%" stopColor={designTokens.colors.pldt.redDeep} stopOpacity={status === 'active' ? '0.6' : '0.1'} />
              </linearGradient>
              
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Segmented outer ring */}
            {[...Array(24)].map((_, i) => {
              const angle = (i * 15) - 90;
              const opacity = status === 'active' 
                ? 0.4 + (Math.sin((rotation + i * 15) * Math.PI / 180) * 0.6)
                : 0.15;
              
              return (
                <path
                  key={i}
                  d={`M 200 200 L ${200 + 190 * Math.cos(angle * Math.PI / 180)} ${200 + 190 * Math.sin(angle * Math.PI / 180)} A 190 190 0 0 1 ${200 + 190 * Math.cos((angle + 12) * Math.PI / 180)} ${200 + 190 * Math.sin((angle + 12) * Math.PI / 180)} Z`}
                  fill={getStatusColor()}
                  opacity={opacity}
                  filter={status === 'active' ? 'url(#glow)' : undefined}
                />
              );
            })}

            {/* Middle ring - solid gradient */}
            <circle
              cx="200"
              cy="200"
              r="160"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="2"
              opacity={status === 'active' ? '0.6' : '0.2'}
            />

            {/* Inner ring - pulse effect */}
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke={getStatusColor()}
              strokeWidth="1"
              opacity={status === 'active' ? '0.4' : '0.1'}
              className={status === 'active' ? 'animate-pulse' : ''}
            />
          </svg>

          {/* Center content */}
          <div className="relative z-20 flex flex-col items-center justify-center w-3/5 aspect-square rounded-full bg-white/80 backdrop-blur-sm"
               style={{ boxShadow: designTokens.shadows.lg }}>
            
            {/* Status indicator */}
            <div className="flex flex-col items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                status === 'active' ? 'bg-pldt-red animate-pulse-slow' :
                status === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-gray-300'
              }`} />
              
              {/* Duration or status text */}
              <div className="text-center px-4">
                {status === 'active' && (
                  <>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 tracking-tight">
                      {formatDuration(duration)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                      Call in progress
                    </div>
                  </>
                )}
                {status === 'connecting' && (
                  <div className="text-base sm:text-lg font-medium text-gray-700">
                    Connecting...
                  </div>
                )}
                {status === 'idle' && (
                  <div className="text-sm sm:text-base font-medium text-gray-500">
                    Ready
                  </div>
                )}
                {status === 'ending' && (
                  <div className="text-sm sm:text-base font-medium text-gray-500">
                    Ending call...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Network activity indicators */}
          {status === 'active' && (
            <div className="absolute inset-0 pointer-events-none z-15">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-pldt-red rounded-full opacity-0 animate-ping"
                  style={{
                    top: `${50 + 45 * Math.sin((i * 45) * Math.PI / 180)}%`,
                    left: `${50 + 45 * Math.cos((i * 45) * Math.PI / 180)}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
