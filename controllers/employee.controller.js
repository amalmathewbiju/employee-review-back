const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'employee'
    });

    res.status(201).json({ message: 'Employee created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    await User.findByIdAndUpdate(id, { name, email });
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
