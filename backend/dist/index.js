"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const upload_routes_1 = __importDefault(require("./routes/upload.routes"));
const query_routes_1 = __importDefault(require("./routes/query.routes"));
const datasets_routes_1 = __importDefault(require("./routes/datasets.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const db_service_1 = require("./services/db.service");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize DB on startup
(0, db_service_1.initDb)();
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/upload', upload_routes_1.default);
app.use('/api/query', query_routes_1.default);
app.use('/api/datasets', datasets_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
});
