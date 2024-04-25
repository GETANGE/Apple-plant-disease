const app = require('./App');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: "./config.env" });

const port = process.env.PORT ||8040;

// Connect to the database mongoose server
mongoose.connect(process.env.DATABASE_URL).then(() => {
    console.log('Connected to the database 🥳');
}).catch((error) => {
    console.log('Error connecting to the database 💥', error);
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});