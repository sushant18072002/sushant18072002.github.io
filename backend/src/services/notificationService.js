const { Notification, User } = require('../models');
const emailService = require('./emailService');

class NotificationService {
  // Create a new notification
  async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();

      // Send notification through specified channels
      await this.sendNotification(notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send notification through various channels
  async sendNotification(notification) {
    try {
      const user = await User.findById(notification.user);
      if (!user) return;

      const userPreferences = user.preferences?.notifications || {};

      for (const channel of notification.channels) {
        // Check if user has enabled this channel
        if (!userPreferences[channel.type]) continue;

        try {
          switch (channel.type) {
            case 'email':
              await this.sendEmailNotification(notification, user);
              break;
            case 'sms':
              await this.sendSMSNotification(notification, user);
              break;
            case 'push':
              await this.sendPushNotification(notification, user);
              break;
            case 'in_app':
              // In-app notifications are stored in database, no additional action needed
              break;
          }

          // Update channel status
          channel.status = 'sent';
          channel.sentAt = new Date();
        } catch (error) {
          channel.status = 'failed';
          channel.error = error.message;
        }
      }

      await notification.save();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Send email notification
  async sendEmailNotification(notification, user) {
    const emailData = {
      to: user.email,
      subject: notification.title,
      html: notification.content?.html || notification.message,
      data: {
        userName: user.profile?.firstName || 'User',
        notificationTitle: notification.title,
        notificationMessage: notification.message,
        actionUrl: notification.content?.actionUrl,
        actionText: notification.content?.actionText
      }
    };

    await emailService.sendNotificationEmail(emailData);
  }

  // Send SMS notification (placeholder)
  async sendSMSNotification(notification, user) {
    // Integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`SMS notification sent to ${user.profile?.phone}: ${notification.message}`);
  }

  // Send push notification (placeholder)
  async sendPushNotification(notification, user) {
    // Integrate with push notification service (Firebase, OneSignal, etc.)
    console.log(`Push notification sent to user ${user._id}: ${notification.message}`);
  }

  // Booking-related notifications
  async sendBookingConfirmation(booking) {
    const user = await User.findById(booking.user);
    if (!user) return;

    await this.createNotification({
      user: booking.user,
      type: 'booking_confirmation',
      title: 'Booking Confirmed',
      message: `Your booking ${booking.bookingReference} has been confirmed.`,
      content: {
        html: `<p>Your booking <strong>${booking.bookingReference}</strong> has been confirmed.</p>`,
        actionUrl: `/bookings/${booking._id}`,
        actionText: 'View Booking'
      },
      relatedEntity: {
        type: 'booking',
        id: booking._id
      },
      channels: [
        { type: 'in_app' },
        { type: 'email' }
      ],
      priority: 'high'
    });
  }

  async sendPaymentSuccess(booking, payment) {
    await this.createNotification({
      user: booking.user,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ${payment.amount.currency} ${payment.amount.total} has been processed successfully.`,
      relatedEntity: {
        type: 'booking',
        id: booking._id
      },
      channels: [
        { type: 'in_app' },
        { type: 'email' }
      ],
      priority: 'high'
    });
  }

  async sendTripReminder(booking, reminderType = 'departure') {
    const titles = {
      departure: 'Trip Departure Reminder',
      checkin: 'Check-in Reminder',
      checkout: 'Check-out Reminder'
    };

    const messages = {
      departure: `Your trip ${booking.bookingReference} is coming up soon!`,
      checkin: `Don't forget to check in for your booking ${booking.bookingReference}`,
      checkout: `Check-out time is approaching for your booking ${booking.bookingReference}`
    };

    await this.createNotification({
      user: booking.user,
      type: 'trip_reminder',
      title: titles[reminderType],
      message: messages[reminderType],
      relatedEntity: {
        type: 'booking',
        id: booking._id
      },
      channels: [
        { type: 'in_app' },
        { type: 'push' }
      ],
      priority: 'medium'
    });
  }

  // Price alert notifications
  async sendPriceAlert(userId, alertData) {
    await this.createNotification({
      user: userId,
      type: 'price_alert',
      title: 'Price Alert',
      message: `Price drop alert: ${alertData.description}`,
      content: {
        actionUrl: alertData.url,
        actionText: 'View Deal'
      },
      channels: [
        { type: 'in_app' },
        { type: 'email' }
      ],
      priority: 'medium',
      data: alertData
    });
  }

  // System notifications
  async sendSystemUpdate(userIds, updateData) {
    const notifications = userIds.map(userId => ({
      user: userId,
      type: 'system_update',
      title: updateData.title,
      message: updateData.message,
      channels: [{ type: 'in_app' }],
      priority: 'low'
    }));

    await Notification.insertMany(notifications);
  }

  // Promotional notifications
  async sendPromotion(userIds, promotionData) {
    const notifications = userIds.map(userId => ({
      user: userId,
      type: 'promotion',
      title: promotionData.title,
      message: promotionData.message,
      content: {
        html: promotionData.html,
        actionUrl: promotionData.actionUrl,
        actionText: promotionData.actionText,
        imageUrl: promotionData.imageUrl
      },
      channels: [
        { type: 'in_app' },
        { type: 'email' }
      ],
      priority: 'low',
      expiresAt: promotionData.expiresAt
    }));

    await Notification.insertMany(notifications);
  }

  // Clean up old notifications
  async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      isRead: true,
      priority: { $in: ['low', 'medium'] }
    });
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    const stats = await Notification.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: ['$isRead', 0, 1] } },
          byType: {
            $push: {
              type: '$type',
              isRead: '$isRead'
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, byType: [] };
  }
}

module.exports = new NotificationService();