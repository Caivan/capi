const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    access_token: process.env.ACCESS_TOKEN,
    pixel_id: process.env.PIXEL_ID,
};