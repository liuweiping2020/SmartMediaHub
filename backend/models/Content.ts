import mongoose from 'mongoose';

const platformPublishStatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  publishedAt: { type: Date },
  message: { type: String },
  postUrl: { type: String },
}, { _id: false });

const contentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['article', 'video'], default: 'article' },
  fileUrl: { type: String },
  platforms: [{ type: String }],
  publishStatus: { type: mongoose.Schema.Types.Mixed, default: {} },
  scheduledTime: { type: Date },
  status: { type: String, enum: ['draft', 'published', 'scheduled'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Content', contentSchema);
