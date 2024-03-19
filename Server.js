const app = require('./App');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const port = 8040;

dotenv.config({path: "./config.env"});

// Connect to the database mongoose server
mongoose.connect(process.env.DATABASE_URL, {
}).then(() => {
    console.log('Connected to the database 🥳');
}).catch((error) => {
    console.log('Error connecting to the database 💥', error);
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
