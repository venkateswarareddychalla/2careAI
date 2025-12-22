import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload report
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { reportType, reportDate, vitals } = req.body;
    
    if (!reportType || !reportDate) {
      return res.status(400).json({ error: 'Report type and date are required' });
    }

    // Insert report
    const result = db.prepare(`
      INSERT INTO reports (user_id, filename, original_name, report_type, report_date, file_type, file_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      req.file.filename,
      req.file.originalname,
      reportType,
      reportDate,
      req.file.mimetype,
      req.file.size
    );

    const reportId = result.lastInsertRowid;

    // Insert vitals if provided
    if (vitals) {
      const vitalsData = JSON.parse(vitals);
      const insertVital = db.prepare(`
        INSERT INTO vitals (report_id, user_id, vital_type, vital_value, unit, recorded_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const vital of vitalsData) {
        if (vital.type && vital.value) {
          insertVital.run(
            reportId,
            req.user.id,
            vital.type,
            vital.value,
            vital.unit || '',
            reportDate
          );
        }
      }
    }

    res.status(201).json({
      message: 'Report uploaded successfully',
      reportId,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload report' });
  }
});

// Get all reports for user
router.get('/', (req, res) => {
  try {
    const { reportType, startDate, endDate, vitalType } = req.query;
    
    let query = `
      SELECT DISTINCT r.* 
      FROM reports r
      LEFT JOIN vitals v ON r.id = v.report_id
      WHERE r.user_id = ?
    `;
    const params = [req.user.id];

    if (reportType) {
      query += ' AND r.report_type = ?';
      params.push(reportType);
    }

    if (startDate && endDate) {
      query += ' AND r.report_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    if (vitalType) {
      query += ' AND v.vital_type = ?';
      params.push(vitalType);
    }

    query += ' ORDER BY r.report_date DESC, r.created_at DESC';

    const reports = db.prepare(query).all(...params);
    res.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT * FROM reports WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Get associated vitals
    const vitals = db.prepare(`
      SELECT * FROM vitals WHERE report_id = ?
    `).all(req.params.id);

    res.json({ report, vitals });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Download report file
router.get('/:id/download', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT * FROM reports WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const filePath = join(__dirname, '../uploads', report.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, report.original_name);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Delete report
router.delete('/:id', (req, res) => {
  try {
    const report = db.prepare(`
      SELECT * FROM reports WHERE id = ? AND user_id = ?
    `).get(req.params.id, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Delete file
    const filePath = join(__dirname, '../uploads', report.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database (cascades to vitals and shares)
    db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
