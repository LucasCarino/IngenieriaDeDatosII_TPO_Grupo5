require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');
const Redis = require('ioredis');

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log('MongoDB connected!');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

const redis = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
});

redis.on('connect', () => {
    console.log('Redis connected!');
});
  
redis.on('error', (err) => {
    console.log(err);
});

module.exports = { redis, connectDB, pool };