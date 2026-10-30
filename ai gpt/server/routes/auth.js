const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const DISABLE_MONGODB = process.env.DISABLE_MONGODB === 'true';

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (DISABLE_MONGODB) {
      // Mock registration when MongoDB is disabled
      const mockToken = jwt.sign({ user: { id: 'mock_user_id' } }, JWT_SECRET, { expiresIn: '5h' });
      return res.json({ message: 'User registered successfully (mock mode)', token: mockToken, userId: 'mock_user_id' });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = new User({ email, password: hashedPassword });
    await user.save();

    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (DISABLE_MONGODB) {
      // Mock login when MongoDB is disabled
      const mockToken = jwt.sign({ user: { id: 'mock_user_id' } }, JWT_SECRET, { expiresIn: '5h' });
      return res.json({ token: mockToken, userId: 'mock_user_id' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign Token
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, userId: user.id });
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
