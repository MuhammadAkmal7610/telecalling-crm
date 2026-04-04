import { useNotification } from '../../context/NotificationContext';

/**
 * NotificationDemo Component
 * 
 * A demo component that showcases all notification types and features.
 * This can be used for testing or as a reference for how to use the notification system.
 * 
 * Remove this component in production or keep it as a reference.
 */
const NotificationDemo = () => {
  const { success, error, warning, info, showNotification } = useNotification();

  const demonstrateNotifications = () => {
    // Success notification
    success(
      'Task Completed Successfully!',
      'Your lead has been imported successfully. 150 new leads have been added to your pipeline.'
    );

    // Error notification after a delay
    setTimeout(() => {
      error(
        'Connection Failed',
        'Unable to connect to the WhatsApp API. Please check your internet connection and try again.'
      );
    }, 1000);

    // Warning notification
    setTimeout(() => {
      warning(
        'Low Credit Balance',
        'Your WhatsApp message credits are running low. You have only 50 messages remaining.'
      );
    }, 2000);

    // Info notification
    setTimeout(() => {
      info(
        'New Feature Available',
        'We\'ve added a new bulk email campaign feature. Check it out in the Automations section!'
      );
    }, 3000);

    // Persistent notification (no auto-close)
    setTimeout(() => {
      showNotification({
        type: 'info',
        title: 'System Update',
        message: 'A new version is available. Click here to update now.',
        duration: 0, // Persistent
        position: 'top-center'
      });
    }, 4000);

    // Notification in different position
    setTimeout(() => {
      success(
        'File Uploaded',
        'Your CSV file has been processed and all leads have been validated.',
        { position: 'bottom-right' }
      );
    }, 5000);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Notification System Demo
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Click the button below to see all notification types in action. 
        Each notification will appear with a 1-second delay between them.
      </p>
      <button
        onClick={demonstrateNotifications}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
      >
        Show All Notification Types
      </button>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 4 notification types (success, error, warning, info)</li>
            <li>• Smooth slide-in/slide-out animations</li>
            <li>• Auto-dismiss with progress bar</li>
            <li>• Pause on hover</li>
            <li>• Multiple positions supported</li>
            <li>• Persistent notifications option</li>
            <li>• Click to dismiss</li>
          </ul>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Usage Example:</h4>
          <code className="text-xs text-gray-600 block whitespace-pre-wrap">
{`const { success, error } = useNotification();

// Show success notification
success('Title', 'Message');

// With options
error('Error', 'Something went wrong', {
  duration: 5000,
  position: 'top-center'
});`}
          </code>
        </div>
      </div>
    </div>
  );
};

export default NotificationDemo;