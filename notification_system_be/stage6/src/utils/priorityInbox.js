export const getTopNByPriority = (notifications, n) => {
  const typeWeights = {
    Placement: 3,
    Result: 2,
    Event: 1
  };

  return notifications
    .map((notification) => {
      const type = notification.type || notification.notification_type || "";
      const isRead = notification.isRead !== undefined ? notification.isRead : notification.is_read;
      const createdAt = notification.createdAt || notification.created_at || new Date().toISOString();

      const typeWeight = typeWeights[type] || 1;
      const recencyHrs = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
      const recencyFactor = Math.max(0.1, 1 / (1 + recencyHrs / 24));
      const readFactor = isRead ? 0.5 : 1.5;

      const priorityScore = typeWeight * recencyFactor * readFactor;
      return { ...notification, priorityScore };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, n);
};
