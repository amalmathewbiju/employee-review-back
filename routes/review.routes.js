const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth, adminOnly } = require('../middleware/auth.middleware');

router.get('/', auth, async (req, res) => {
  try {
    let reviews;
    if (req.user.role === 'admin') {
      reviews = await Review.find()
        .populate('subject', 'name email')
        .populate('reviewer', 'name email')
        .sort({ createdAt: -1 });
    } else {
      reviews = await Review.find({
        $or: [
          { subject: req.user.userId },
          { reviewer: req.user.userId }
        ]
      })
        .populate('subject', 'name email')
        .populate('reviewer', 'name email')
        .sort({ createdAt: -1 });
    }
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews' });
  }
});

router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { subject, reviewer } = req.body;
    const review = await Review.create({
      subject,
      reviewer,
      status: 'pending'
    });
    
    const populatedReview = await Review.findById(review._id)
      .populate('subject', 'name email')
      .populate('reviewer', 'name email');
    
    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review' });
  }
});

router.post('/:id/feedback', auth, async (req, res) => {
    try {
      // First verify if the logged-in user is the assigned reviewer
      const review = await Review.findOne({
        _id: req.params.id,
        reviewer: req.user.userId, // This ensures only the assigned reviewer can submit
        status: 'pending'
      });
  
      if (!review) {
        return res.status(403).json({ 
          message: 'Only the assigned reviewer can submit feedback for this review'
        });
      }
  
      // If the user is the assigned reviewer, proceed with feedback submission
      const { feedback, rating } = req.body;
      
      review.feedback = feedback;
      review.rating = parseInt(rating);
      review.status = 'completed';
      review.updatedAt = new Date();
      
      const savedReview = await review.save();
      
      const populatedReview = await Review.findById(savedReview._id)
        .populate('subject', 'name email')
        .populate('reviewer', 'name email');
  
      res.json({
        success: true,
        data: populatedReview
      });
  
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error submitting feedback'
      });
    }
  });
  
  router.get('/pending', auth, async (req, res) => {
    try {
      const reviews = await Review.find({
        reviewer: req.user.userId,
        status: 'pending'
      })
      .populate('subject', 'name email')
      .populate('reviewer', 'name email');
      
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching pending reviews' });
    }
  });
  
router.get('/employee/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.userId !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to view these reviews' });
    }

    const reviews = await Review.find({
      subject: req.params.id,
      status: 'completed'
    })
      .populate('subject', 'name email')
      .populate('reviewer', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee reviews' });
  }
});

router.get('/completed', auth, adminOnly, async (req, res) => {
    try {
      const completedReviews = await Review.find({ status: 'completed' })
        .populate('subject', 'name email')
        .populate('reviewer', 'name email')
        .sort({ updatedAt: -1 });
      
      res.json(completedReviews);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching completed reviews' });
    }
  });
  

router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching review statistics' });
  }
});

module.exports = router;
