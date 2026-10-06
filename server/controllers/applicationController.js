const Application = require('../models/Application');

// CREATE — Add a new job application
exports.createApplication = async (req, res) => {
  try {
    const { company, role, status, dateApplied, jobLink, notes } = req.body;

    const application = await Application.create({
      user: req.userId, // comes from auth middleware
      company,
      role,
      status,
      dateApplied,
      jobLink,
      notes,
    });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// READ — Get all applications for the logged-in user
exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(applications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// UPDATE — Edit an existing application
exports.updateApplication = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    Object.assign(application, req.body);
    await application.save();

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE — Remove an application
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.uploadResume = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.resumeUrl = req.file.path;
    application.resumeName = req.file.originalname;
    await application.save();

    res.status(200).json(application);
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.addPrepNote = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const { question, answer } = req.body;
    application.prepNotes.push({ question, answer });
    await application.save();

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePrepNote = async (req, res) => {
  try {
    const application = await Application.findOne({ _id: req.params.id, user: req.userId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.prepNotes = application.prepNotes.filter(
      (note) => note._id.toString() !== req.params.noteId
    );
    await application.save();

    res.status(200).json(application);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};