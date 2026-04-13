import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import routes from './routes';
import { logger } from './config/logger';
import { requestLogger } from './middleware/requestLogger';

if (!process.env.JWT_SECRET) {
  logger.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(requestLogger);

app.use('/', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, () => {
  logger.info(`Server listening on http://localhost:${port}`);
});