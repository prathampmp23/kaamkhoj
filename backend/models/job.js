const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobName: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  minAge: {
    type: Number,
    required: true
  },
  skillsRequired: {
    type: [String],
    default: []
  },
  experience: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Job', jobSchema);
