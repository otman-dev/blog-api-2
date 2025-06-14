const mongoose = require('mongoose');

// Test script to ensure new posts get custom ID field
async function testCustomIdSaving() {
    try {
        // Use the same connection string as the app
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-content';
        console.log('Connecting to:', MONGODB_URI);
        
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Define the exact same schema as Blog.ts
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
            },
            id: {
                type: String,
                unique: true
            }
        }, {
            timestamps: true,
            collection: 'posts'
        });

        // Pre-save middleware - EXACTLY like Blog.ts
        PostSchema.pre('save', function(next) {
            console.log('🔄 Pre-save middleware executed for post:', this.title);
            console.log('📝 Current values before generation:', { 
                _id: this._id, 
                id: this.id, 
                slug: this.slug 
            });
            
            // Generate slug from title if not exists
            if (!this.slug && this.title) {
                this.slug = generateSlug(this.title);
                console.log('🔗 Generated slug:', this.slug);
            }
            
            // Always generate custom ID if not exists
            if (!this.id) {
                this.id = generateCustomId();
                console.log('🆔 Generated custom ID:', this.id);
            }
            
            // Force set the id if it's still empty
            if (!this.id || this.id === '') {
                this.id = generateCustomId();
                console.log('🔄 Force generated custom ID:', this.id);
            }
            
            console.log('✅ Final values after generation:', { 
                _id: this._id, 
                id: this.id, 
                slug: this.slug 
            });
            next();
        });

        // Post-save middleware
        PostSchema.post('save', function(doc, next) {
            console.log('💾 Post-save middleware executed for post:', {
                title: doc.title,
                id: doc.id,
                slug: doc.slug,
                _id: doc._id
            });
            next();
        });

        const Post = mongoose.model('Post', PostSchema);

        // Create a new test post
        console.log('\n🚀 Creating new test post...');
        const newPost = new Post({
            title: 'Test Custom ID Creation - ' + new Date().toISOString(),
            content: '# Test Post\n\nThis is a test to verify custom ID generation works in the database.',
            excerpt: 'Testing custom ID field creation and saving to MongoDB.',
            categories: ['Testing'],
            tags: ['test', 'custom-id', 'mongodb'],
            status: 'published',
            published: true
        });

        // Save the post
        const savedPost = await newPost.save();
        
        console.log('\n🎉 Post saved successfully!');
        console.log('📋 Saved post details:');
        console.log('   Title:', savedPost.title);
        console.log('   MongoDB _id:', savedPost._id);
        console.log('   Custom id:', savedPost.id);
        console.log('   Slug:', savedPost.slug);

        // Verify in database by querying it back
        console.log('\n🔍 Verifying post in database...');
        const foundPost = await Post.findById(savedPost._id).select('title _id id slug');
        console.log('📋 Found post in database:');
        console.log('   Title:', foundPost.title);
        console.log('   MongoDB _id:', foundPost._id);
        console.log('   Custom id:', foundPost.id);
        console.log('   Slug:', foundPost.slug);

        // Check if custom id exists
        if (foundPost.id) {
            console.log('\n✅ SUCCESS: Custom ID field is saved in the database!');
        } else {
            console.log('\n❌ FAILURE: Custom ID field is NOT saved in the database!');
        }

        // Clean up - delete the test post
        await Post.findByIdAndDelete(savedPost._id);
        console.log('\n🗑️ Test post deleted');

    } catch (error) {
        console.error('❌ Error testing custom ID saving:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testCustomIdSaving();
