const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/e-commerce');

module.exports = mongoose; // Export Mongoose for use in other files
