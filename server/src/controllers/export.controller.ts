import { Request, Response } from 'express';

export const exportToExcel = async (req: Request<{ id: string }>, res: Response) => {
  res.status(204).send();
}