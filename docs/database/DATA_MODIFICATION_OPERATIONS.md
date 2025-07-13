# Data Modification Operations & Table Management

## 📊 Database Operations for Data Push/Modification

### 1. Bulk Data Import Operations

#### Flight Data Import
```javascript
// Bulk import flights from external APIs
const bulkImportFlights = async (flightData) => {
  const operations = flightData.map(flight => ({
    updateOne: {
      filter: { 
        flightNumber: flight.flightNumber,
        'route.departure.scheduledTime': flight.route.departure.scheduledTime
      },
      update: { $set: flight },
      upsert: true
    }
  }));
  
  return await db.flights.bulkWrite(operations, { ordered: false });
};

// Usage
const flightData = [
  {
    flightNumber: "EK205",
    airline: { code: "EK", name: "Emirates" },
    route: {
      departure: {
        airport: { code: "DXB", name: "Dubai International" },
        scheduledTime: new Date("2024-12-20T14:30:00Z")
      },
      arrival: {
        airport: { code: "JFK", name: "JFK International" },
        scheduledTime: new Date("2024-12-20T19:45:00Z")
      }
    },
    pricing: {
      economy: { basePrice: 980, taxes: 270, totalPrice: 1250 }
    }
  }
];

await bulkImportFlights(flightData);
```

#### Hotel Data Import
```javascript
const bulkImportHotels = async (hotelData) => {
  const operations = hotelData.map(hotel => ({
    updateOne: {
      filter: { 
        name: hotel.name,
        'location.address.city': hotel.location.address.city
      },
      update: { 
        $set: {
          ...hotel,
          updatedAt: new Date()
        }
      },
      upsert: true
    }
  }));
  
  return await db.hotels.bulkWrite(operations);
};
```

### 2. Real-time Price Updates

#### Flight Price Updates
```javascript
const updateFlightPrices = async (priceUpdates) => {
  const bulkOps = priceUpdates.map(update => ({
    updateOne: {
      filter: { _id: update.flightId },
      update: {
        $set: {
          'pricing.economy.totalPrice': update.newPrice,
          'pricing.economy.basePrice': update.basePrice,
          'pricing.economy.taxes': update.taxes,
          'pricing.lastUpdated': new Date()
        },
        $push: {
          'pricing.priceHistory': {
            price: update.newPrice,
            timestamp: new Date(),
            source: update.source
          }
        }
      }
    }
  }));
  
  const result = await db.flights.bulkWrite(bulkOps);
  
  // Trigger price alert notifications
  await checkPriceAlerts(priceUpdates);
  
  return result;
};

const checkPriceAlerts = async (priceUpdates) => {
  for (const update of priceUpdates) {
    const alerts = await db.priceAlerts.find({
      flightId: update.flightId,
      targetPrice: { $gte: update.newPrice },
      active: true
    });
    
    for (const alert of alerts) {
      await sendPriceAlertNotification(alert, update);
    }
  }
};
```

#### Hotel Availability Updates
```javascript
const updateHotelAvailability = async (availabilityData) => {
  const operations = availabilityData.map(data => ({
    updateOne: {
      filter: { 
        _id: data.hotelId,
        'rooms.type': data.roomType
      },
      update: {
        $set: {
          'rooms.$.availability.available': data.availableRooms,
          'rooms.$.pricing.baseRate': data.currentPrice,
          'rooms.$.lastUpdated': new Date()
        }
      }
    }
  }));
  
  return await db.hotels.bulkWrite(operations);
};
```

### 3. User Data Modifications

#### User Profile Updates
```javascript
const updateUserProfile = async (userId, profileData) => {
  const updateDoc = {
    $set: {
      'profile.firstName': profileData.firstName,
      'profile.lastName': profileData.lastName,
      'profile.phone': profileData.phone,
      'preferences.currency': profileData.currency,
      'preferences.language': profileData.language,
      updatedAt: new Date()
    }
  };
  
  // Add to update history
  updateDoc.$push = {
    'profile.updateHistory': {
      timestamp: new Date(),
      changes: Object.keys(profileData),
      updatedBy: userId
    }
  };
  
  return await db.users.updateOne({ _id: userId }, updateDoc);
};
```

#### User Preferences Batch Update
```javascript
const batchUpdateUserPreferences = async (updates) => {
  const operations = updates.map(update => ({
    updateOne: {
      filter: { _id: update.userId },
      update: {
        $set: {
          'preferences.travel': update.travelPreferences,
          'preferences.notifications': update.notificationPreferences,
          updatedAt: new Date()
        }
      }
    }
  }));
  
  return await db.users.bulkWrite(operations);
};
```

### 4. Booking Operations

#### Create Booking with Inventory Update
```javascript
const createBookingWithInventory = async (bookingData) => {
  const session = await db.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create booking
      const booking = await db.bookings.insertOne({
        ...bookingData,
        status: 'pending',
        createdAt: new Date()
      }, { session });
      
      // Update inventory
      if (bookingData.type === 'flight') {
        await db.flights.updateOne(
          { _id: bookingData.items[0].flightId },
          { 
            $inc: { 
              'pricing.economy.availability': -bookingData.items[0].passengers.length 
            }
          },
          { session }
        );
      } else if (bookingData.type === 'hotel') {
        await db.hotels.updateOne(
          { 
            _id: bookingData.items[0].hotelId,
            'rooms.type': bookingData.items[0].roomType
          },
          { 
            $inc: { 'rooms.$.availability.available': -1 }
          },
          { session }
        );
      }
      
      return booking;
    });
  } finally {
    await session.endSession();
  }
};
```

#### Booking Status Updates
```javascript
const updateBookingStatus = async (bookingId, newStatus, metadata = {}) => {
  const updateDoc = {
    $set: {
      status: newStatus,
      updatedAt: new Date()
    },
    $push: {
      statusHistory: {
        status: newStatus,
        timestamp: new Date(),
        metadata
      }
    }
  };
  
  // Handle specific status changes
  if (newStatus === 'confirmed') {
    updateDoc.$set.confirmedAt = new Date();
  } else if (newStatus === 'cancelled') {
    updateDoc.$set.cancelledAt = new Date();
    updateDoc.$set.cancellationReason = metadata.reason;
  }
  
  return await db.bookings.updateOne({ _id: bookingId }, updateDoc);
};
```

### 5. Content Management Operations

#### Blog Post Management
```javascript
const createBlogPost = async (postData) => {
  const post = {
    ...postData,
    slug: generateSlug(postData.title),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'draft',
    views: 0,
    likes: 0
  };
  
  return await db.blogPosts.insertOne(post);
};

const publishBlogPost = async (postId) => {
  return await db.blogPosts.updateOne(
    { _id: postId },
    {
      $set: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );
};

const incrementBlogViews = async (postId) => {
  return await db.blogPosts.updateOne(
    { _id: postId },
    { 
      $inc: { views: 1 },
      $set: { lastViewedAt: new Date() }
    }
  );
};
```

#### Destination Data Updates
```javascript
const updateDestinationInfo = async (destinationId, updateData) => {
  const updateDoc = {
    $set: {
      ...updateData,
      updatedAt: new Date()
    }
  };
  
  // Handle attractions updates
  if (updateData.attractions) {
    updateDoc.$addToSet = {
      attractions: { $each: updateData.attractions }
    };
    delete updateDoc.$set.attractions;
  }
  
  return await db.destinations.updateOne({ _id: destinationId }, updateDoc);
};
```

### 6. Review and Rating Operations

#### Add Review with Rating Update
```javascript
const addReviewWithRatingUpdate = async (reviewData) => {
  const session = await db.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Insert review
      const review = await db.reviews.insertOne({
        ...reviewData,
        createdAt: new Date(),
        helpful: { yes: 0, no: 0, voters: [] },
        verified: true
      }, { session });
      
      // Update target rating
      const targetCollection = reviewData.targetType === 'hotel' ? 'hotels' : 'flights';
      
      // Recalculate average rating
      const reviews = await db.reviews.find({
        targetType: reviewData.targetType,
        targetId: reviewData.targetId
      }, { session });
      
      const avgRating = reviews.reduce((sum, r) => sum + r.rating.overall, 0) / reviews.length;
      
      await db[targetCollection].updateOne(
        { _id: reviewData.targetId },
        {
          $set: {
            'rating.overall': Math.round(avgRating * 10) / 10,
            'rating.reviewCount': reviews.length,
            'rating.lastReviewAt': new Date()
          }
        },
        { session }
      );
      
      return review;
    });
  } finally {
    await session.endSession();
  }
};
```

### 7. Analytics Data Operations

#### Track User Activity
```javascript
const trackUserActivity = async (activityData) => {
  const activity = {
    ...activityData,
    timestamp: new Date(),
    sessionId: activityData.sessionId,
    userAgent: activityData.userAgent,
    ipAddress: activityData.ipAddress
  };
  
  // Insert into analytics collection
  await db.analytics.insertOne(activity);
  
  // Update user stats
  if (activityData.userId) {
    await db.users.updateOne(
      { _id: activityData.userId },
      {
        $set: { lastActivityAt: new Date() },
        $inc: { 'stats.totalActivities': 1 }
      }
    );
  }
};
```

#### Search Analytics
```javascript
const trackSearchQuery = async (searchData) => {
  const searchLog = {
    ...searchData,
    timestamp: new Date(),
    resultsCount: searchData.resultsCount || 0
  };
  
  // Insert search log
  await db.searchLogs.insertOne(searchLog);
  
  // Update popular searches
  await db.popularSearches.updateOne(
    { 
      type: searchData.type,
      query: searchData.query
    },
    {
      $inc: { count: 1 },
      $set: { lastSearched: new Date() }
    },
    { upsert: true }
  );
};
```

### 8. Data Cleanup Operations

#### Archive Old Data
```javascript
const archiveOldBookings = async (daysOld = 365) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  // Move old completed bookings to archive
  const oldBookings = await db.bookings.find({
    status: 'completed',
    completedAt: { $lt: cutoffDate }
  });
  
  if (oldBookings.length > 0) {
    await db.archivedBookings.insertMany(oldBookings);
    await db.bookings.deleteMany({
      _id: { $in: oldBookings.map(b => b._id) }
    });
  }
  
  return oldBookings.length;
};

const cleanupExpiredSessions = async () => {
  const expiredDate = new Date();
  expiredDate.setHours(expiredDate.getHours() - 24);
  
  return await db.sessions.deleteMany({
    lastActivity: { $lt: expiredDate }
  });
};
```

### 9. Data Validation and Sanitization

#### Validate and Sanitize User Input
```javascript
const sanitizeUserData = (userData) => {
  const sanitized = {};
  
  // Email validation and sanitization
  if (userData.email) {
    sanitized.email = userData.email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.email)) {
      throw new Error('Invalid email format');
    }
  }
  
  // Phone number sanitization
  if (userData.phone) {
    sanitized.phone = userData.phone.replace(/[^\d+]/g, '');
  }
  
  // Name sanitization
  if (userData.firstName) {
    sanitized.firstName = userData.firstName.trim().replace(/[<>]/g, '');
  }
  
  return sanitized;
};
```

### 10. Backup and Recovery Operations

#### Create Data Backup
```javascript
const createBackup = async (collections = []) => {
  const backupId = new Date().toISOString().replace(/[:.]/g, '-');
  const backupData = {};
  
  for (const collection of collections) {
    backupData[collection] = await db[collection].find({}).toArray();
  }
  
  // Store backup metadata
  await db.backups.insertOne({
    backupId,
    collections,
    createdAt: new Date(),
    size: JSON.stringify(backupData).length,
    status: 'completed'
  });
  
  return { backupId, data: backupData };
};

const restoreFromBackup = async (backupId) => {
  const backup = await db.backups.findOne({ backupId });
  if (!backup) {
    throw new Error('Backup not found');
  }
  
  // Restore collections
  for (const collection of backup.collections) {
    await db[collection].deleteMany({});
    await db[collection].insertMany(backup.data[collection]);
  }
  
  return backup;
};
```

## 🔄 Scheduled Data Operations

### Daily Operations
```javascript
const dailyDataMaintenance = async () => {
  // Update exchange rates
  await updateCurrencyRates();
  
  // Clean expired price alerts
  await db.priceAlerts.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  
  // Update popular destinations
  await updatePopularDestinations();
  
  // Archive old analytics data
  await archiveOldAnalytics();
};
```

### Weekly Operations
```javascript
const weeklyDataMaintenance = async () => {
  // Recalculate user recommendations
  await recalculateUserRecommendations();
  
  // Update search trends
  await updateSearchTrends();
  
  // Clean up unused files
  await cleanupUnusedFiles();
};
```

This comprehensive guide covers all data modification operations needed for the TravelAI platform, ensuring efficient data management and real-time updates.