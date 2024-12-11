const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth.middleware');

// Get all employees
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees' });
  }
});

// Create new employee
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingEmployee = await User.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'employee'
    });

    res.status(201).json({
      _id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating employee' });
  }
});

// Update employee
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email } = req.body;
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating employee' });
  }
});

// Delete employee
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting employee' });
  }
});

// Get single employee
router.get('/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select('-password');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee' });
  }
});

module.exports = router;
