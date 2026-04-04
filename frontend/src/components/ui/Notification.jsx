import { useState, useEffect, useRef } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/solid';

/**
 * Notification Component
 * 
 * A beautiful, animated notification component that supports different types:
 * - success: Green themed for successful operations
 * - error: Red themed for errors
 * - warning: Amber themed for warnings
 * - info: Blue themed for informational messages
 */

const notificationConfig = {
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-800',
    textColor: 'text-green-700',
    progressBarColor: 'bg-green-500'
  },
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-800',
    textColor: 'text-red-700',
    progressBarColor: 'bg-red-500'
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-800',
    textColor: 'text-amber-700',
    progressBarColor: 'bg-amber-500'
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-800',
    textColor: 'text-blue-700',
    progressBarColor: 'bg-blue-500'
  }
};

const positionClasses = {
  'top-right': 'top-0 right-0',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
  'top-left': 'top-0 left-0',
  'bottom-right': 'bottom-0 right-0',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-0 left-0'
};

const Notification = ({ 
  notification, 
  onRemove, 
  position = 'top-right' 
}) => {
  const { id, type, title, message, showClose, duration } = notification;
  const config = notificationConfig[type] || notificationConfig.info;
  const Icon = config.icon;
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef(null);
  const removeTimeoutRef = useRef(null);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Auto-remove if duration is set
    if (duration && duration > 0) {
      removeTimeoutRef.current = setTimeout(() => {
        handleRemove();
      }, duration);
    }

    return () => {
      if (removeTimeoutRef.current) {
        clearTimeout(removeTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration]);

  useEffect(() => {
    if (duration === 0 || !duration || isRemoving) return;

    const animate = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = Math.max(0, 1 - elapsed / duration);
        setProgress(remaining * 100);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration, isPaused, isRemoving]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(id);
    }, 300); // Wait for exit animation
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Calculate transform based on position
  const getTransform = () => {
    if (isRemoving) {
      if (position.includes('left')) return 'translateX(-120%)';
      if (position.includes('right')) return 'translateX(120%)';
      if (position.includes('bottom')) return 'translateY(120%)';
      return 'translateY(-120%)';
    }
    if (!isVisible) {
      if (position.includes('left')) return 'translateX(-120%)';
      if (position.includes('right')) return 'translateX(120%)';
      if (position.includes('bottom')) return 'translateY(120%)';
      return 'translateY(-120%)';
    }
    return 'translate(0, 0)';
  };

  return (
    <div
      className={`
        relative w-full max-w-sm mb-3 rounded-2xl border p-4 shadow-lg
        ${config.bgColor} ${config.borderColor}
        backdrop-blur-sm bg-opacity-95
        transition-all duration-300 ease-out
      `}
      style={{ 
        transform: getTransform(),
        opacity: isRemoving ? 0 : isVisible ? 1 : 0
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 rounded-full p-1 ${config.bgColor}`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
              {title}
            </h4>
          )}
          {message && (
            <p className={`text-sm ${config.textColor} leading-relaxed`}>
              {message}
            </p>
          )}
        </div>

        {/* Close Button */}
        {showClose && (
          <button
            onClick={handleRemove}
            className={`flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/5`}
          >
            <XMarkIcon className={`h-4 w-4 ${config.textColor}`} />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {duration && duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl overflow-hidden bg-black/5">
          <div
            className={`h-full ${config.progressBarColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

/**
 * NotificationContainer Component
 * 
 * Container that renders all notifications grouped by position
 */
export const NotificationContainer = ({ notifications, onRemove }) => {
  // Group notifications by position
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position || 'top-right';
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Object.entries(groupedNotifications).map(([position, notifications]) => (
        <div
          key={position}
          className={`absolute pointer-events-auto ${positionClasses[position]} p-4 flex flex-col`}
        >
          {notifications.map((notification) => (
            <Notification
              key={notification.id}
              notification={notification}
              onRemove={onRemove}
              position={position}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Notification;