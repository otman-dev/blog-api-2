import mongoose from 'mongoose';

export interface IPost extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  categories: string[];
  tags: string[];
  status: string;
  publishedAt: Date;
  id: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Function to generate unique slug from title
function generateSlug(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
    
  // Add timestamp to ensure uniqueness
  const timestamp = Date.now();
  return `${baseSlug}-${timestamp}`;
}

const PostSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot be more than 300 characters']
  },
  author: {
    type: String,
    default: 'Mouhib Otman'
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  published: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'posts' // Specify the collection name
});

// Pre-save middleware to generate slug and id
PostSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
  this.id = this.slug;
  next();
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
