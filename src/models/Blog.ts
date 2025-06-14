import mongoose from 'mongoose';
import dbConnect from '@/lib/db/contentDb';

export interface IPost extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  id: string; // Custom ID field (different from MongoDB's _id)
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  categories: string[];
  tags: string[];
  status: string;
  publishedAt: Date;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Function to generate unique custom ID (different from slug)
function generateCustomId(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `post_${timestamp}_${randomStr}`;
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
  },  publishedAt: {
    type: Date,
    default: Date.now
  },
  published: {
    type: Boolean,
    default: true
  },
  id: {
    type: String,
    unique: true
    // Don't make it required or add validation - pre-save middleware will handle it
  }
}, {
  timestamps: true,
  collection: 'posts' // Specify the collection name
});

// Add toJSON transform after schema creation
PostSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    // Ensure both _id and custom id are included in JSON output
    ret._id = ret._id.toString(); // Convert ObjectId to string for JSON
    // Ensure custom id exists - this is a safety net
    if (!ret.id) {
      ret.id = generateCustomId();
      console.warn('ToJSON: Had to generate missing custom ID');
    }
    return ret;
  }
});

// Pre-save middleware to generate slug and custom ID
PostSchema.pre('save', function(this: IPost, next) {
  console.log('Pre-save middleware executed for post:', this.title);
  
  // Generate slug from title if not exists
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
    console.log('Generated slug:', this.slug);
  }
  
  // Always ensure custom ID exists (separate from slug and _id)
  if (!this.id) {
    this.id = generateCustomId();
    console.log('Generated custom ID:', this.id);
  }
  
  console.log('Final values after generation:', { 
    _id: this._id, 
    id: this.id, 
    slug: this.slug 
  });
  next();
});

// Pre-validate middleware to ensure id is set before validation
PostSchema.pre('validate', function(next) {
  // Ensure id is set before validation runs
  if (!this.id) {
    this.id = generateCustomId();
    console.log('Pre-validate: Set custom ID:', this.id);
  }
  next();
});

// Post-save middleware for debugging
PostSchema.post('save', function(doc: IPost, next) {
  console.log('Post-save middleware executed for post:', {
    title: doc.title,
    id: doc.id,
    slug: doc.slug,
    _id: doc._id
  });
  next();
});

// Get model from content database connection
const getBlogModel = async () => {
  const connection = await dbConnect();
  return connection.models.Post || connection.model<IPost>('Post', PostSchema);
};

export default getBlogModel;
