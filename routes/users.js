// routes/users.js
// Admin route to fetch all user IDs and emails

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust path as needed
const { isAdmin } = require('../middleware/auth');

// GET /api/users/all - admin only
router.get('/all', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '_id email');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router; 