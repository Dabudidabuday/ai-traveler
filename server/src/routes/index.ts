import express, { Request, Response } from 'express';
import { messageRoute } from '../messages/route'; 
import { eventsRoute } from '../events/route';

export const routes = express.Router();

routes.use(messageRoute)
routes.use(eventsRoute)
