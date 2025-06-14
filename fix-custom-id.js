const mongoose = require('mongoose');

// Function to generate unique custom ID
function generateCustomId() {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `post_${timestamp}_${randomStr}`;
}

async function fixCustomIds() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/blog-content');
        console.log('Connected to MongoDB');

        // Get the posts collection directly
        const db = mongoose.connection.db;
        const postsCollection = db.collection('posts');

        // 1. First, let's see how many posts exist and which ones are missing the id field
        const totalPosts = await postsCollection.countDocuments();
        const postsWithoutId = await postsCollection.countDocuments({ id: { $exists: false } });
        const postsWithId = await postsCollection.countDocuments({ id: { $exists: true } });

        console.log(`\nTotal posts: ${totalPosts}`);
        console.log(`Posts with custom id: ${postsWithId}`);
        console.log(`Posts without custom id: ${postsWithoutId}`);

        // 2. Update all posts that don't have the custom id field
        if (postsWithoutId > 0) {
            console.log(`\nUpdating ${postsWithoutId} posts to add custom id field...`);
            
            const postsToUpdate = await postsCollection.find({ id: { $exists: false } }).toArray();
            
            for (const post of postsToUpdate) {
                const customId = generateCustomId();
                
                await postsCollection.updateOne(
                    { _id: post._id },
                    { $set: { id: customId } }
                );
                
                console.log(`Updated post "${post.title}" with custom id: ${customId}`);
            }
            
            console.log(`\n✅ Successfully updated ${postsWithoutId} posts with custom ids`);
        } else {
            console.log('\n✅ All posts already have custom id fields');
        }

        // 3. Verify the updates
        const finalPostsWithId = await postsCollection.countDocuments({ id: { $exists: true } });
        console.log(`\nFinal verification: ${finalPostsWithId} posts now have custom id field`);

        // 4. Show a sample of posts with their ids
        console.log('\nSample posts with custom ids:');
        const samplePosts = await postsCollection.find({}, { title: 1, id: 1, _id: 1 }).limit(3).toArray();
        samplePosts.forEach(post => {
            console.log(`Title: ${post.title}`);
            console.log(`MongoDB _id: ${post._id}`);
            console.log(`Custom id: ${post.id}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error fixing custom IDs:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Also create a test function to create a new post and verify it gets the custom id
async function testNewPostCreation() {
    try {
        console.log('\n=== Testing New Post Creation ===');
        await mongoose.connect('mongodb://localhost:27017/blog-content');
        
        // Import the Blog model (this will use our fixed model)
        const getBlogModel = require('./src/models/Blog.js').default;
        const Post = await getBlogModel();

        // Create a new post
        const newPost = new Post({
            title: 'Test Post for Custom ID Verification',
            content: 'This post is created to verify that custom IDs are being saved to the database.',
            excerpt: 'Testing custom ID functionality in production.',
            categories: ['Testing'],
            tags: ['test', 'custom-id', 'verification'],
            status: 'published',
            published: true
        });

        console.log('Creating new post...');
        const savedPost = await newPost.save();

        console.log('New post created:');
        console.log(`Title: ${savedPost.title}`);
        console.log(`MongoDB _id: ${savedPost._id}`);
        console.log(`Custom id: ${savedPost.id}`);
        console.log(`Slug: ${savedPost.slug}`);

        // Verify it's actually in the database
        const foundPost = await Post.findById(savedPost._id);
        console.log('\nPost retrieved from database:');
        console.log(`Custom id from database: ${foundPost.id}`);
        console.log(`Has custom id field: ${foundPost.id ? 'YES' : 'NO'}`);

        // Clean up - delete the test post
        await Post.findByIdAndDelete(savedPost._id);
        console.log('\nTest post deleted');

    } catch (error) {
        console.error('Error testing new post creation:', error);
    } finally {
        await mongoose.disconnect();
    }
}

// Run both functions
async function runAll() {
    await fixCustomIds();
    await testNewPostCreation();
}

runAll();
