import express, { Application } from 'express';
import path from 'path';
const dotenv = require('dotenv');
const cors = require('cors');
import bodyParser from 'body-parser';

import { routes } from './routes';

dotenv.config();
const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// API routes
app.use('/', routes);


// Serve static files from React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
