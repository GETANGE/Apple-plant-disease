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
const client = createClient({
    host: 'redis-13393.c274.us-east-1-3.ec2.cloud.redislabs.com',
    port: 13393,
    password: 'pkajlxlgCUq9WypiNGVmbDTRalEBAGPG'
});

client.on('connect', () => {
    console.log('Connected to Redis 🎉');
});

client.on('error', (err) => {
    console.log('Error connecting to Redis', err);
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
