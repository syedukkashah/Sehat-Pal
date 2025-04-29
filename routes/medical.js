const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const verifyToken = require('../middleware/auth');

// Get all health metrics for a user
router.get('/metrics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [metrics] = await pool.query(
      'SELECT * FROM health_metrics WHERE user_id = ? ORDER BY measurement_date DESC',
      [userId]
    );
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new health metric
router.post('/metrics', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { metric_name, metric_value } = req.body;
    
    if (!metric_name || !metric_value) {
      return res.status(400).json({ message: 'Metric name and value are required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO health_metrics (user_id, metric_name, metric_value) VALUES (?, ?, ?)',
      [userId, metric_name, metric_value]
    );
    
    res.status(201).json({
      message: 'Health metric added successfully',
      metricId: result.insertId
    });
  } catch (error) {
    console.error('Error adding health metric:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all appointments for a user
router.get('/appointments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE user_id = ? ORDER BY appointment_date',
      [userId]
    );
    
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new appointment
router.post('/appointments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointment_date, doctor_name, purpose, notes } = req.body;
    
    if (!appointment_date) {
      return res.status(400).json({ message: 'Appointment date is required' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO appointments (user_id, appointment_date, doctor_name, purpose, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, appointment_date, doctor_name, purpose, notes]
    );
    
    res.status(201).json({
      message: 'Appointment added successfully',
      appointmentId: result.insertId
    });
  } catch (error) {
    console.error('Error adding appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an appointment
router.put('/appointments/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    const { appointment_date, doctor_name, purpose, notes } = req.body;
    
    // Check if appointment exists and belongs to user
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND user_id = ?',
      [appointmentId, userId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await pool.query(
      'UPDATE appointments SET appointment_date = ?, doctor_name = ?, purpose = ?, notes = ? WHERE id = ?',
      [appointment_date, doctor_name, purpose, notes, appointmentId]
    );
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an appointment
router.delete('/appointments/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const appointmentId = req.params.id;
    
    // Check if appointment exists and belongs to user
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND user_id = ?',
      [appointmentId, userId]
    );
    
    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await pool.query('DELETE FROM appointments WHERE id = ?', [appointmentId]);
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;