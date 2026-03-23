const express = require('express');
const Log = require('../models/Log');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * GET /api/logs
 * Get all logs (authenticated users only)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { level, search, limit = 100 } = req.query;

    const filter = {};
    if (level && level !== 'ALL') {
      filter.level = level;
    }
    if (search) {
      filter.$or = [
        { message: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'email');

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error fetching logs.' });
  }
});

/**
 * POST /api/log
 * Create a new log entry (authenticated users only)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { level, source, message, isAnomaly } = req.body;

    if (!level || !source || !message) {
      return res.status(400).json({ message: 'Level, source, and message are required.' });
    }

    const log = await Log.create({
      level,
      source,
      message,
      isAnomaly: isAnomaly || false,
      userId: req.user._id,
    });

    res.status(201).json({ message: 'Log created successfully.', log });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Server error creating log.' });
  }
});

/**
 * DELETE /api/log/:id
 * Delete a log entry (admin only)
 */
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({ message: 'Log not found.' });
    }

    res.json({ message: 'Log deleted successfully.' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ message: 'Server error deleting log.' });
  }
});

module.exports = router;
