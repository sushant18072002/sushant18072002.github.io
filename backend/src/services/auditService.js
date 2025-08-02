const { AuditLog } = require('../models');

const log = async (auditData) => {
  try {
    const audit = new AuditLog({
      userId: auditData.userId,
      action: auditData.action,
      resource: auditData.resource,
      resourceId: auditData.resourceId,
      changes: auditData.changes,
      metadata: {
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        timestamp: new Date()
      }
    });
    
    await audit.save();
    return audit;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Don't throw error to avoid breaking main functionality
  }
};

const logUserAction = async (userId, action, resource, resourceId, changes, req) => {
  return await log({
    userId,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: req?.ip,
    userAgent: req?.get('User-Agent')
  });
};

const logSystemAction = async (action, resource, resourceId, changes) => {
  return await log({
    userId: null,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: 'system',
    userAgent: 'system'
  });
};

module.exports = {
  log,
  logUserAction,
  logSystemAction
};