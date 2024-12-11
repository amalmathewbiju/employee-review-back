const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { subjectId, reviewerId } = req.body;
    await Review.create({
      subject: subjectId,
      reviewer: reviewerId,
      status: 'pending'
    });
    res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('subject', 'name')
      .populate('reviewer', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;
    
    await Review.findByIdAndUpdate(id, {
      feedback,
      status: 'completed'
    });
    
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'pending' })
      .populate('subject', 'name')
      .populate('reviewer', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
