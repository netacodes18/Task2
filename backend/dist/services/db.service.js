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
exports.getDb = exports.initDb = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/datachat';
const client = new mongodb_1.MongoClient(uri);
let db;
const initDb = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield client.connect();
        db = client.db(); // uses the database from the URI
        console.log(`Connected to MongoDB: ${db.databaseName}`);
        // Ensure the metadata collection exists
        const collections = yield db.listCollections({ name: '_datasets' }).toArray();
        if (collections.length === 0) {
            yield db.createCollection('_datasets');
            console.log('Created _datasets metadata collection.');
        }
    }
    catch (error) {
        console.error('Failed to connect to MongoDB:', error);
    }
});
exports.initDb = initDb;
const getDb = () => {
    if (!db) {
        throw new Error('Database not initialized. Call initDb() first.');
    }
    return db;
};
exports.getDb = getDb;
