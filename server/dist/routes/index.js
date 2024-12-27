"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = __importDefault(require("express"));
const route_1 = require("../messages/route");
const route_2 = require("../events/route");
exports.routes = express_1.default.Router();
exports.routes.use(route_1.messageRoute);
exports.routes.use(route_2.eventsRoute);
