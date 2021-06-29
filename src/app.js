const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

//Importing Database
require('./database/mongoose');

// Importing Routes
const loginSignup = require('./routes/loginSignup');
const DataUpload = require('./routes/DataUpload');
app.use(loginSignup);
app.use(DataUpload);

module.exports = app;