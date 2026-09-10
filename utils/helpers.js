// utils/helpers.js - Utility functions for the application

/**
 * Calculate performance metrics for a campaign
 * @param {Object} metrics - Campaign metrics object
 * @returns {Object} Enhanced metrics with calculations
 */
exports.calculateMetrics = (metrics) => {
  const {
    impressions = 0,
    clicks = 0,
    conversions = 0,
    engagement = 0,
  } = metrics;

  const clickThroughRate = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
  const roi = conversions > 0 ? ((conversions / impressions) * 100) : 0;

  return {
    ...metrics,
    clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
    conversionRate: parseFloat(conversionRate.toFixed(2)),
    roi: parseFloat(roi.toFixed(2)),
  };
};

/**
 * Validate campaign data
 * @param {Object} data - Campaign data to validate
 * @returns {Object} Validation result with errors array
 */
exports.validateCampaignData = (data) => {
  const errors = [];

  if (!data.title || data.title.trim() === '') {
    errors.push('Campaign title is required');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Campaign description is required');
  }

  if (!data.budget || data.budget < 0) {
    errors.push('Campaign budget must be a positive number');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  }

  if (!data.endDate) {
    errors.push('End date is required');
  }

  if (new Date(data.startDate) > new Date(data.endDate)) {
    errors.push('End date must be after start date');
  }

  if (!data.targetAudience || data.targetAudience.trim() === '') {
    errors.push('Target audience is required');
  }

  const validTypes = ['social_media', 'email', 'content', 'paid_ads', 'influencer', 'event', 'other'];
  if (data.type && !validTypes.includes(data.type)) {
    errors.push('Invalid campaign type');
  }

  const validStatuses = ['draft', 'scheduled', 'active', 'paused', 'completed'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push('Invalid campaign status');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format date for display
 * @param {Date|String} date - Date to format
 * @param {String} format - Format option: 'short' or 'long'
 * @returns {String} Formatted date
 */
exports.formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate days remaining for a campaign
 * @param {Date|String} endDate - Campaign end date
 * @returns {Number} Days remaining
 */
exports.calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate campaign progress percentage
 * @param {Date|String} startDate - Campaign start date
 * @param {Date|String} endDate - Campaign end date
 * @returns {Number} Progress percentage (0-100)
 */
exports.calculateProgress = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const totalDuration = end - start;
  const elapsed = now - start;

  const progress = (elapsed / totalDuration) * 100;
  return Math.min(Math.max(progress, 0), 100);
};

/**
 * Get campaign status based on dates
 * @param {String} manualStatus - Manually set status
 * @param {Date|String} startDate - Campaign start date
 * @param {Date|String} endDate - Campaign end date
 * @returns {String} Campaign status
 */
exports.getCampaignStatus = (manualStatus, startDate, endDate) => {
  if (manualStatus && manualStatus !== 'draft') {
    return manualStatus;
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Format currency values
 * @param {Number} value - Value to format
 * @param {String} currency - Currency code (default: USD)
 * @returns {String} Formatted currency string
 */
exports.formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
};

/**
 * Generate campaign summary report
 * @param {Object} campaign - Campaign object
 * @returns {Object} Summary report
 */
exports.generateCampaignSummary = (campaign) => {
  const metrics = this.calculateMetrics(campaign.metrics || {});
  const progress = this.calculateProgress(campaign.startDate, campaign.endDate);
  const daysRemaining = this.calculateDaysRemaining(campaign.endDate);

  return {
    title: campaign.title,
    type: campaign.type,
    status: campaign.status,
    budget: this.formatCurrency(campaign.budget),
    dateRange: `${this.formatDate(campaign.startDate)} - ${this.formatDate(campaign.endDate)}`,
    targetAudience: campaign.targetAudience,
    progress: Math.round(progress),
    daysRemaining: daysRemaining,
    metrics: {
      impressions: campaign.metrics?.impressions || 0,
      clicks: campaign.metrics?.clicks || 0,
      conversions: campaign.metrics?.conversions || 0,
      ctr: `${metrics.clickThroughRate}%`,
      conversionRate: `${metrics.conversionRate}%`,
      roi: `${metrics.roi}%`,
    },
    channels: campaign.channels || [],
    teamLead: campaign.team || 'Unassigned',
  };
};

/**
 * Error handler middleware
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Success response formatter
 */
exports.successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Pagination helper
 */
exports.getPaginationData = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};