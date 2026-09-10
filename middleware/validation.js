// middleware/validation.js - Express middleware for validation and error handling

/**
 * Validate campaign creation/update request
 */
exports.validateCampaignRequest = (req, res, next) => {
  const { title, description, budget, startDate, endDate, targetAudience } = req.body;
  const errors = [];

  // Title validation
  if (!title || title.trim() === '') {
    errors.push('Title is required');
  } else if (title.length < 3 || title.length > 200) {
    errors.push('Title must be between 3 and 200 characters');
  }

  // Description validation
  if (!description || description.trim() === '') {
    errors.push('Description is required');
  } else if (description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  // Budget validation
  if (budget === undefined || budget === null) {
    errors.push('Budget is required');
  } else if (typeof budget !== 'number' || budget < 0) {
    errors.push('Budget must be a positive number');
  }

  // Dates validation
  if (!startDate) {
    errors.push('Start date is required');
  }
  if (!endDate) {
    errors.push('End date is required');
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime())) {
      errors.push('Invalid start date format');
    }
    if (isNaN(end.getTime())) {
      errors.push('Invalid end date format');
    }
    if (start > end) {
      errors.push('End date must be after start date');
    }
  }

  // Target audience validation
  if (!targetAudience || targetAudience.trim() === '') {
    errors.push('Target audience is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors: errors,
    });
  }

  next();
};

/**
 * Validate MongoDB ID
 */
exports.validateId = (req, res, next) => {
  const { id } = req.params;
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!mongoIdRegex.test(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid campaign ID format',
    });
  }

  next();
};

/**
 * Error handling middleware
 */
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate field value',
      field: Object.keys(err.keyValue)[0],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler
 */
exports.notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    path: req.originalUrl,
  });
};

/**
 * CORS middleware
 */
exports.corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://yourdomain.com',
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};

/**
 * Request logging middleware
 */
exports.requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};

/**
 * Rate limiting middleware
 */
exports.rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000),
      });
    }

    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

/**
 * Pagination middleware
 */
exports.paginationMiddleware = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    skip,
  };

  next();
};

/**
 * Sort middleware
 */
exports.sortMiddleware = (req, res, next) => {
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order === 'asc' ? 1 : -1;

  const validSortFields = ['title', 'budget', 'createdAt', 'status', 'startDate'];

  if (validSortFields.includes(sortBy)) {
    req.sort = { [sortBy]: order };
  } else {
    req.sort = { createdAt: -1 };
  }

  next();
};