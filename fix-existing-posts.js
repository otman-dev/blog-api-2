const mongoose = require('mongoose');

// Connect to MongoDB and add custom IDs to existing posts
async function fixExistingPosts() {
    try {
        // Connect to the database
        await mongoose.connect('mongodb://localhost:27017/blog-content');
        console.log('Connected to MongoDB');

        // Get the posts collection directly
        const db = mongoose.connection.db;
        const postsCollection = db.collection('posts');

        // Find all posts that don't have a custom id field
        const postsWithoutId = await postsCollection.find({ 
            $or: [
                { id: { $exists: false } },
                { id: null },
                { id: "" }
            ]
        }).toArray();

        console.log(`Found ${postsWithoutId.length} posts without custom ID`);

        if (postsWithoutId.length === 0) {
            console.log('All posts already have custom IDs');
            return;
        }

        // Function to generate unique custom ID
        function generateCustomId() {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            return `post_${timestamp}_${randomStr}`;
        }

        // Update each post with a custom ID
        for (const post of postsWithoutId) {
            const customId = generateCustomId();
            
            const result = await postsCollection.updateOne(
                { _id: post._id },
                { $set: { id: customId } }
            );

            if (result.modifiedCount === 1) {
                console.log(`✅ Updated post "${post.title}" with custom ID: ${customId}`);
            } else {
                console.log(`❌ Failed to update post "${post.title}"`);
            }

            // Small delay to ensure unique timestamps
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Verify the updates
        const remainingWithoutId = await postsCollection.find({ 
            $or: [
                { id: { $exists: false } },
                { id: null },
                { id: "" }
            ]
        }).count();

        console.log(`\n🎉 Migration complete! ${remainingWithoutId} posts still without custom ID`);

        // Show sample of updated posts
        const samplePosts = await postsCollection.find({}, { 
            projection: { title: 1, _id: 1, id: 1 } 
        }).limit(5).toArray();

        console.log('\nSample of posts with custom IDs:');
        samplePosts.forEach(post => {
            console.log(`- ${post.title}`);
            console.log(`  MongoDB _id: ${post._id}`);
            console.log(`  Custom id: ${post.id || 'MISSING!'}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error fixing existing posts:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixExistingPosts();
