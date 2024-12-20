import express, { Application, json, Request, Response } from 'express';
const dotenv = require('dotenv');
const cors = require('cors');
import bodyParser from 'body-parser';

import { routes } from './routes';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

//routes
app.use('/', routes);

app.get('/', (req: Request, res: Response) => {
  res.send('This is default path. Server runs on 3000');
})

app.listen(PORT || 3000, () => {
  console.log(`we are on ${PORT}`)
})
