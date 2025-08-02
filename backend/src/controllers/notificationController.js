const { Notification } = require('../models');
const notificationService = require('../services/notificationService');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      type, 
      isRead, 
      priority 
    } = req.query;

    const query = { user: req.user._id };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({
      success: true,
      data: { message: 'All notifications marked as read' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: { message: 'Notification not found' }
      });
    }

    res.json({
      success: true,
      data: { message: 'Notification deleted successfully' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const preferences = req.user.preferences?.notifications || {
      email: true,
      sms: false,
      push: true,
      types: {
        booking_confirmation: true,
        price_alert: true,
        trip_reminder: true,
        promotion: false
      }
    };

    res.json({
      success: true,
      data: { preferences }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const { User } = require('../models');
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'preferences.notifications': req.body },
      { new: true }
    );

    res.json({
      success: true,
      data: { 
        message: 'Notification preferences updated',
        preferences: user.preferences.notifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Admin: Send notification to user(s)
const sendNotification = async (req, res) => {
  try {
    const { 
      userIds, 
      type, 
      title, 
      message, 
      content,
      channels = ['in_app'],
      priority = 'medium',
      scheduledFor
    } = req.body;

    const notifications = [];

    for (const userId of userIds) {
      const notification = await notificationService.createNotification({
        user: userId,
        type,
        title,
        message,
        content,
        channels: channels.map(channel => ({ type: channel })),
        priority,
        scheduledFor,
        source: 'admin',
        createdBy: req.user._id
      });

      notifications.push(notification);
    }

    res.json({
      success: true,
      data: { 
        message: `Notification sent to ${userIds.length} users`,
        notifications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Admin: Get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      type, 
      priority,
      status,
      userId
    } = req.query;

    const query = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (userId) query.user = userId;

    const notifications = await Notification.find(query)
      .populate('user', 'email profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

// Admin: Get notification analytics
const getNotificationAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    const analytics = await Notification.aggregate([
      { $match: { createdAt: dateFilter } },
      {
        $facet: {
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          readStats: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                read: { $sum: { $cond: ['$isRead', 1, 0] } },
                unread: { $sum: { $cond: ['$isRead', 0, 1] } }
              }
            }
          ],
          dailyTrend: [
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: { analytics: analytics[0] }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  sendNotification,
  getAllNotifications,
  getNotificationAnalytics
};