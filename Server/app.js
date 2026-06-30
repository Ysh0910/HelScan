const express      = require('express');
const cors         = require('cors');
const methodOverride = require('method-override');
const mongoose     = require('mongoose');
const riderRoutes  = require('./routes/rider');

const app  = express();
const PORT = 3000;
const MONGO_URL = 'mongodb://127.0.0.1:27017/HelScan';

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ── Database ─────────────────────────────────────────────────────────────────
mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// ── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('HelScan API running'));
app.use('/', riderRoutes);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
