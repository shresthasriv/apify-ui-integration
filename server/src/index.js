const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apifyRoutes = require('./routes/apify');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apifyRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is up and running! 🚀');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});