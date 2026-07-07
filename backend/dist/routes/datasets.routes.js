"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_service_1 = require("../services/db.service");
const mongodb_1 = require("mongodb");
const router = express_1.default.Router();
// Get all datasets
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_service_1.getDb)();
        const sessionId = req.headers['x-session-id'] || 'anonymous';
        const datasets = yield db.collection('_datasets')
            .find({ session_id: sessionId }, { projection: { column_schema: 0 } }) // Omit schema for list view
            .sort({ created_at: -1 })
            .toArray();
        // Map _id to id for frontend
        const formattedDatasets = datasets.map(d => (Object.assign(Object.assign({}, d), { id: d._id.toString() })));
        res.json(formattedDatasets);
    }
    catch (error) {
        console.error('Fetch datasets error:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
}));
// Get a specific dataset with schema
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = (0, db_service_1.getDb)();
        const dataset = yield db.collection('_datasets').findOne({
            _id: new mongodb_1.ObjectId(req.params.id)
        });
        if (!dataset) {
            return res.status(404).json({ error: 'Dataset not found' });
        }
        res.json(Object.assign(Object.assign({}, dataset), { id: dataset._id.toString() }));
    }
    catch (error) {
        console.error('Fetch dataset error:', error);
        res.status(500).json({ error: 'Failed to fetch dataset' });
    }
}));
exports.default = router;
