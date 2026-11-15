const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Quiz description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'General Knowledge'
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    timeLimit: {
      type: Number,
      required: [true, 'Time limit in minutes is required'],
      min: [1, 'Time limit must be at least 1 minute'],
      max: [180, 'Time limit cannot exceed 180 minutes'],
      default: 10
    },
    passingScore: {
      type: Number,
      min: [0, 'Passing score must be at least 0%'],
      max: [100, 'Passing score cannot exceed 100%'],
      default: 60
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
      }
    ],
    totalQuestions: {
      type: Number,
      default: 0
    },
    participationCount: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
