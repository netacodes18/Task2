import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/upload.routes';
import queryRoutes from './routes/query.routes';
import datasetRoutes from './routes/datasets.routes';
import { initDb } from './services/db.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB on startup
initDb();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/upload', uploadRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/datasets', datasetRoutes);

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
