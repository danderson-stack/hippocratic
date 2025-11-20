"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const port = process.env.PORT || 3000;
app_1.default.listen(port, () => {
    console.log(`🚀 [SERVER] Backend server listening on port ${port}`);
    console.log(`📡 [SERVER] Agent API available at http://localhost:${port}/api/query`);
});
