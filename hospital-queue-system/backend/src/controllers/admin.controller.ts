import type { RequestHandler } from 'express';
import { getStats } from '../services/admin/statsService.js';

export const getStatsHandler: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
