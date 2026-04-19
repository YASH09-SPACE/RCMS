const Comment = require('../models/Comment');

/**
 * @desc    Get comments for a complaint (public)
 * @route   GET /api/complaints/:id/comments
 * @access  Public
 */
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ complaint: req.params.id })
      .populate('user', 'name profileImage role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: comments.length, data: comments });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to a complaint (auth required)
 * @route   POST /api/complaints/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const comment = await Comment.create({
      complaint: req.params.id,
      user: req.user._id,
      text: text.trim()
    });

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name profileImage role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, addComment };
