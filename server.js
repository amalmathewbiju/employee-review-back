const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();



const app = express();

app.use(cors());
app.use(express.json());

const createInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log(' Admin user created successfully');
    }
  } catch (error) {
    console.log('Error creating admin:', error);
  }
};

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/reviews', require('./routes/review.routes'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    createInitialAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
