const app = require('./App');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createClient } = require('redis');

const port = 8040;

dotenv.config({ path: "./config.env" });

// Connect to the database mongoose server
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('Connected to the database 🥳');
}).catch((error) => {
    console.log('Error connecting to the database 💥', error);
});

// Create a Redis client
exports.redisClient = createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // password:process.env.REDIS_PASSWORD
}).on('connect', () => {
    console.log('Connected to Redis 🎉');
}).on('error', (err) => {
    console.log('Error connecting to Redis', err);
}).connect();



// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

