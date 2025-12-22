import express from 'express';
import db from '../schema.js';

const router = express.Router();

// Share a report
router.post('/', (req, res) => {
  try {
    const { reportId, sharedWithEmail, sharedWithName, accessRole } = req.body;

    if (!reportId || !sharedWithEmail || !sharedWithName) {
      return res.status(400).json({ error: 'Report ID, email, and name are required' });
    }

    // Verify report ownership
    const report = db.prepare(`
      SELECT * FROM reports WHERE id = ? AND user_id = ?
    `).get(reportId, req.user.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found or access denied' });
    }

    // Check if already shared
    const existing = db.prepare(`
      SELECT * FROM access_shares 
      WHERE report_id = ? AND shared_with_email = ?
    `).get(reportId, sharedWithEmail);

    if (existing) {
      return res.status(400).json({ error: 'Report already shared with this user' });
    }

    // Create share
    db.prepare(`
      INSERT INTO access_shares (report_id, owner_id, shared_with_email, shared_with_name, access_role)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      reportId,
      req.user.id,
      sharedWithEmail,
      sharedWithName,
      accessRole || 'viewer'
    );

    res.status(201).json({ message: 'Report shared successfully' });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({ error: 'Failed to share report' });
  }
});

// Get reports shared WITH current user
router.get('/received', (req, res) => {
  try {
    const shares = db.prepare(`
      SELECT 
        s.*,
        r.filename,
        r.original_name,
        r.report_type,
        r.report_date,
        r.file_type,
        u.name as owner_name,
        u.email as owner_email
      FROM access_shares s
      JOIN reports r ON s.report_id = r.id
      JOIN users u ON s.owner_id = u.id
      WHERE s.shared_with_email = ?
      ORDER BY s.created_at DESC
    `).all(req.user.email);

    res.json({ shares });
  } catch (error) {
    console.error('Get received shares error:', error);
    res.status(500).json({ error: 'Failed to fetch shared reports' });
  }
});

// Get shares for reports owned by current user
router.get('/sent', (req, res) => {
  try {
    const shares = db.prepare(`
      SELECT 
        s.*,
        r.original_name,
        r.report_type,
        r.report_date
      FROM access_shares s
      JOIN reports r ON s.report_id = r.id
      WHERE s.owner_id = ?
      ORDER BY s.created_at DESC
    `).all(req.user.id);

    res.json({ shares });
  } catch (error) {
    console.error('Get sent shares error:', error);
    res.status(500).json({ error: 'Failed to fetch shares' });
  }
});

// Revoke access
router.delete('/:id', (req, res) => {
  try {
    const share = db.prepare(`
      SELECT * FROM access_shares WHERE id = ? AND owner_id = ?
    `).get(req.params.id, req.user.id);

    if (!share) {
      return res.status(404).json({ error: 'Share not found or access denied' });
    }

    db.prepare('DELETE FROM access_shares WHERE id = ?').run(req.params.id);

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    console.error('Revoke access error:', error);
    res.status(500).json({ error: 'Failed to revoke access' });
  }
});

export default router;
