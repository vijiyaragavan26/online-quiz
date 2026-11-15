const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    options: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length === 4 && v.every(opt => typeof opt === 'string' && opt.trim().length > 0);
        },
        message: 'A question must have exactly 4 non-empty options.'
      },
      required: true
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer index (0-3) is required'],
      min: 0,
      max: 3
    },
    explanation: {
      type: String,
      default: '',
      trim: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', questionSchema);
