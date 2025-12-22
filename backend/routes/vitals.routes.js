import express from 'express';
import db from '../schema.js';

const router = express.Router();

// Add vitals entry
router.post('/', (req, res) => {
  try {
    const { reportId, vitals, recordedDate } = req.body;

    if (!vitals || !Array.isArray(vitals) || vitals.length === 0) {
      return res.status(400).json({ error: 'Vitals data is required' });
    }

    const insertVital = db.prepare(`
      INSERT INTO vitals (report_id, user_id, vital_type, vital_value, unit, recorded_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const date = recordedDate || new Date().toISOString().split('T')[0];

    for (const vital of vitals) {
      if (vital.type && vital.value) {
        insertVital.run(
          reportId || null,
          req.user.id,
          vital.type,
          vital.value,
          vital.unit || '',
          date
        );
      }
    }

    res.status(201).json({ message: 'Vitals added successfully' });
  } catch (error) {
    console.error('Add vitals error:', error);
    res.status(500).json({ error: 'Failed to add vitals' });
  }
});

// Get vitals history
router.get('/', (req, res) => {
  try {
    const { startDate, endDate, vitalType } = req.query;
    
    let query = 'SELECT * FROM vitals WHERE user_id = ?';
    const params = [req.user.id];

    if (startDate && endDate) {
      query += ' AND recorded_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (vitalType) {
      query += ' AND vital_type = ?';
      params.push(vitalType);
    }

    query += ' ORDER BY recorded_date DESC, created_at DESC';

    const vitals = db.prepare(query).all(...params);
    res.json({ vitals });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({ error: 'Failed to fetch vitals' });
  }
});

// Get vitals trends for charts
router.get('/trends', (req, res) => {
  try {
    const { vitalType, startDate, endDate } = req.query;
    
    let query = `
      SELECT vital_type, vital_value, unit, recorded_date
      FROM vitals 
      WHERE user_id = ?
    `;
    const params = [req.user.id];

    if (vitalType) {
      query += ' AND vital_type = ?';
      params.push(vitalType);
    }

    if (startDate && endDate) {
      query += ' AND recorded_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else {
      // Default to last 30 days
      query += ' AND recorded_date >= date("now", "-30 days")';
    }

    query += ' ORDER BY recorded_date ASC';

    const trends = db.prepare(query).all(...params);

    // Group by vital type
    const grouped = trends.reduce((acc, item) => {
      if (!acc[item.vital_type]) {
        acc[item.vital_type] = [];
      }
      acc[item.vital_type].push({
        date: item.recorded_date,
        value: parseFloat(item.vital_value),
        unit: item.unit
      });
      return acc;
    }, {});

    res.json({ trends: grouped });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// Get vitals summary (latest values)
router.get('/summary', (req, res) => {
  try {
    const query = `
      SELECT DISTINCT vital_type, vital_value, unit, recorded_date
      FROM vitals v1
      WHERE user_id = ? 
      AND recorded_date = (
        SELECT MAX(recorded_date) 
        FROM vitals v2 
        WHERE v2.vital_type = v1.vital_type AND v2.user_id = v1.user_id
      )
      ORDER BY vital_type
    `;

    const summary = db.prepare(query).all(req.user.id);
    res.json({ summary });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;
