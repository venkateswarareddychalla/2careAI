import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname } from "path";
import './schema.js'; // Initialize database

// Import middleware
import { authenticateToken } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import vitalsRoutes from './routes/vitals.routes.js';
import sharesRoutes from './routes/shares.routes.js';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get("/", (req, res) => res.send("Digital Health Wallet API is Running"));

// Public routes (no authentication required)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/vitals', authenticateToken, vitalsRoutes);
app.use('/api/shares', authenticateToken, sharesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('✓ Database initialized');
  console.log('✓ All routes configured');
});
