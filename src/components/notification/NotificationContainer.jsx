import React from 'react';
import Notification from './Notification';

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
