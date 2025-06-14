const mongoose = require('mongoose');

// Check if custom ID is actually stored in the database
async function verifyCustomIdInDatabase() {
    try {
        // Connect to the same database as the app
        await mongoose.connect('mongodb://adro.ddns.net:27017/otman-blog?authSource=admin');
        console.log('✅ Connected to production MongoDB');

        // Get the posts collection directly
        const db = mongoose.connection.db;
        const postsCollection = db.collection('posts');

        // Find all posts and check their raw structure
        const posts = await postsCollection.find({}).limit(5).toArray();
        
        console.log(`📊 Found ${posts.length} posts in database`);
        console.log('\n📋 Raw database structure (first 2 posts):');
        
        posts.slice(0, 2).forEach((post, index) => {
            console.log(`\n--- Post ${index + 1} ---`);
            console.log('Title:', post.title);
            console.log('MongoDB _id:', post._id);
            console.log('Custom id:', post.id ? `✅ ${post.id}` : '❌ MISSING');
            console.log('Slug:', post.slug);
            console.log('Created At:', post.createdAt);
            console.log('All fields:', Object.keys(post));
        });

        // Check how many posts have custom ID
        const postsWithCustomId = await postsCollection.countDocuments({ id: { $exists: true, $ne: null, $ne: "" } });
        const totalPosts = await postsCollection.countDocuments();
        
        console.log(`\n📈 Statistics:`);
        console.log(`   Total posts: ${totalPosts}`);
        console.log(`   Posts with custom ID: ${postsWithCustomId}`);
        console.log(`   Posts missing custom ID: ${totalPosts - postsWithCustomId}`);

        if (postsWithCustomId === totalPosts) {
            console.log('\n🎉 SUCCESS: All posts have custom ID field stored in database!');
        } else {
            console.log('\n⚠️  Some posts are missing custom ID field in database');
            
            // Show posts without custom ID
            const postsWithoutId = await postsCollection.find({ 
                $or: [
                    { id: { $exists: false } },
                    { id: null },
                    { id: "" }
                ]
            }).limit(3).toArray();
            
            console.log('\n📋 Posts without custom ID:');
            postsWithoutId.forEach((post, index) => {
                console.log(`${index + 1}. ${post.title} (${post._id})`);
            });
        }

    } catch (error) {
        console.error('❌ Error verifying custom ID in database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

verifyCustomIdInDatabase();
