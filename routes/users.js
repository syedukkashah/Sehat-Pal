const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Middleware to verify JWT token
const verifyToken = require('../middleware/auth');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const [users] = await pool.query('SELECT id, full_name, email, created_at FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get personal info
    const [personalInfo] = await pool.query('SELECT * FROM personal_info WHERE user_id = ?', [userId]);
    
    // Get medical info
    const [medicalInfo] = await pool.query('SELECT * FROM medical_info WHERE user_id = ?', [userId]);
    
    // Get lifestyle info
    const [lifestyleInfo] = await pool.query('SELECT * FROM lifestyle_info WHERE user_id = ?', [userId]);

    res.json({
      user,
      personalInfo: personalInfo[0] || null,
      medicalInfo: medicalInfo[0] || null,
      lifestyleInfo: lifestyleInfo[0] || null
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update personal information
router.put('/personal-info', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date_of_birth, gender, address, phone } = req.body;

    // Check if personal info exists
    const [existingInfo] = await pool.query('SELECT * FROM personal_info WHERE user_id = ?', [userId]);

    if (existingInfo.length === 0) {
      // Create new record
      await pool.query(
        'INSERT INTO personal_info (user_id, date_of_birth, gender, address, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, date_of_birth, gender, address, phone]
      );
    } else {
      // Update existing record
      await pool.query(
        'UPDATE personal_info SET date_of_birth = ?, gender = ?, address = ?, phone = ? WHERE user_id = ?',
        [date_of_birth, gender, address, phone, userId]
      );
    }

    res.json({ message: 'Personal information updated successfully' });
  } catch (error) {
    console.error('Error updating personal info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update medical information
router.put('/medical-info', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { vaccination_history, chronic_illness, past_surgeries, current_medicines, allergies } = req.body;

    // Check if medical info exists
    const [existingInfo] = await pool.query('SELECT * FROM medical_info WHERE user_id = ?', [userId]);

    if (existingInfo.length === 0) {
      // Create new record
      await pool.query(
        'INSERT INTO medical_info (user_id, vaccination_history, chronic_illness, past_surgeries, current_medicines, allergies) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, vaccination_history, chronic_illness, past_surgeries, current_medicines, allergies]
      );
    } else {
      // Update existing record
      await pool.query(
        'UPDATE medical_info SET vaccination_history = ?, chronic_illness = ?, past_surgeries = ?, current_medicines = ?, allergies = ? WHERE user_id = ?',
        [vaccination_history, chronic_illness, past_surgeries, current_medicines, allergies, userId]
      );
    }

    res.json({ message: 'Medical information updated successfully' });
  } catch (error) {
    console.error('Error updating medical info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update lifestyle information
router.put('/lifestyle-info', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { dietary_restrictions, smoking_status, exercise_frequency, alcohol_consumption } = req.body;

    // Check if lifestyle info exists
    const [existingInfo] = await pool.query('SELECT * FROM lifestyle_info WHERE user_id = ?', [userId]);

    if (existingInfo.length === 0) {
      // Create new record
      await pool.query(
        'INSERT INTO lifestyle_info (user_id, dietary_restrictions, smoking_status, exercise_frequency, alcohol_consumption) VALUES (?, ?, ?, ?, ?)',
        [userId, dietary_restrictions, smoking_status, exercise_frequency, alcohol_consumption]
      );
    } else {
      // Update existing record
      await pool.query(
        'UPDATE lifestyle_info SET dietary_restrictions = ?, smoking_status = ?, exercise_frequency = ?, alcohol_consumption = ? WHERE user_id = ?',
        [dietary_restrictions, smoking_status, exercise_frequency, alcohol_consumption, userId]
      );
    }

    res.json({ message: 'Lifestyle information updated successfully' });
  } catch (error) {
    console.error('Error updating lifestyle info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;