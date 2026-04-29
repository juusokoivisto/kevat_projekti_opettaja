import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { logger } from './config/logger';
import { requestLogger } from './middleware/requestLogger';
import { slidingSession } from './middleware/refreshToken';

if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CORS_ORIGIN
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins,
  exposedHeaders: ['x-new-token'],
}));
app.use(express.json());
app.use(requestLogger);
app.use(slidingSession);

app.use('/api', routes);

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(`${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});