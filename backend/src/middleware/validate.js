const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ['not_started', 'in_progress', 'completed'];

/**
 * Validates specified request params are valid MongoDB ObjectIds.
 * @param {...string} paramNames
 */
exports.validateParamObjectIds = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const val = req.params[name];
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        return res.status(400).json({ message: `Invalid ID parameter: ${name}` });
      }
    }
    next();
  };
};

/**
 * Validates registration request payload.
 */
exports.validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Valid name is required' });
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  next();
};

/**
 * Validates login request payload.
 */
exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ message: 'A valid email address is required' });
  }
  next();
};

/**
 * Validates skill status update payload.
 */
exports.validateSkillStatus = (req, res, next) => {
  const { targetStatus } = req.body;
  if (!targetStatus || !ALLOWED_STATUSES.includes(targetStatus)) {
    return res.status(400).json({
      message: `Invalid targetStatus. Allowed values: ${ALLOWED_STATUSES.join(', ')}`
    });
  }
  next();
};

/**
 * Validates completeLesson payload and params.
 */
exports.validateLessonProgress = (req, res, next) => {
  const { lessonId } = req.params;
  const { levelId, courseId } = req.body;

  if (lessonId && !mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({ message: 'Invalid lessonId' });
  }
  if (!levelId || !mongoose.Types.ObjectId.isValid(levelId)) {
    return res.status(400).json({ message: 'Valid levelId is required' });
  }
  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({ message: 'Valid courseId is required' });
  }
  next();
};

/**
 * Validates target career update.
 */
exports.validateTargetCareer = (req, res, next) => {
  const { careerId } = req.body;
  if (!careerId || !mongoose.Types.ObjectId.isValid(careerId)) {
    return res.status(400).json({ message: 'Valid careerId is required' });
  }
  next();
};
