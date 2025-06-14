const mongoose = require('mongoose');

// Connect to MongoDB directly to test post creation
async function testPostCreation() {
    try {
        // Connect to the database
        await mongoose.connect('mongodb://localhost:27017/blog-content');
        console.log('Connected to MongoDB');

        // Define the schema with the same structure as Blog.ts
        function generateCustomId() {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            return `post_${timestamp}_${randomStr}`;
        }

        function generateSlug(title) {
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
                
            const timestamp = Date.now();
            return `${baseSlug}-${timestamp}`;
        }

        const PostSchema = new mongoose.Schema({
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
            },            id: {
                type: String,
                unique: true
                // Don't make it required here - let middleware handle it
            }
        }, {
            timestamps: true,
            collection: 'posts'
        });

        // Pre-save middleware
        PostSchema.pre('save', function(next) {
            console.log('Pre-save middleware executed for post:', this.title);
            console.log('Current values before generation:', { 
                _id: this._id, 
                id: this.id, 
                slug: this.slug 
            });
            
            // Generate slug from title if not exists
            if (!this.slug && this.title) {
                this.slug = generateSlug(this.title);
                console.log('Generated slug:', this.slug);
            }
            
            // Always generate custom ID if not exists
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

        // Post-save middleware
        PostSchema.post('save', function(doc, next) {
            console.log('Post-save middleware executed for post:', {
                title: doc.title,
                id: doc.id,
                slug: doc.slug,
                _id: doc._id
            });
            next();
        });

        const Post = mongoose.model('Post', PostSchema);

        // Create a test post
        const testPost = new Post({
            title: 'Test Post for ID Generation',
            content: 'This is a test post to verify custom ID generation is working properly.',
            excerpt: 'Testing custom ID generation functionality.',
            categories: ['Test'],
            tags: ['testing', 'debug']
        });

        console.log('Creating test post...');
        const savedPost = await testPost.save();

        console.log('Test post created successfully:');
        console.log('MongoDB _id:', savedPost._id);
        console.log('Custom id:', savedPost.id);
        console.log('Slug:', savedPost.slug);
        console.log('Title:', savedPost.title);

        // Verify in database
        const foundPost = await Post.findById(savedPost._id);
        console.log('\nPost found in database:');
        console.log('MongoDB _id:', foundPost._id);
        console.log('Custom id:', foundPost.id);
        console.log('Slug:', foundPost.slug);

        // Clean up - delete the test post
        await Post.findByIdAndDelete(savedPost._id);
        console.log('\nTest post deleted successfully');

    } catch (error) {
        console.error('Error testing post creation:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

testPostCreation();
