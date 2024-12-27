"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = require('dotenv');
const cors = require('cors');
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = require("./routes");
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT;
app.use(body_parser_1.default.json({ limit: '50mb', type: 'application/json' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
//routes
app.use('/', routes_1.routes);
app.get('/', (req, res) => {
    res.send('This is default path. Server runs on 3000');
});
app.listen(PORT || 3000, () => {
    console.log(`we are on ${PORT}`);
});
