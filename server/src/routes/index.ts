import express, { Request, Response } from 'express';
import { messageRoute } from '../messages/route';

export const routes = express.Router();

routes.use(messageRoute)
