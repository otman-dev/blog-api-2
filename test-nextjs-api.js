// Test the actual Next.js API to see if custom ID is being saved
const fetch = require('node-fetch');

async function testNextJsApi() {
    try {
        console.log('🚀 Testing Next.js API for custom ID saving...');
        
        // First, let's check if the server is running
        try {
            const healthCheck = await fetch('http://localhost:3000/api/blogs', {
                method: 'GET'
            });
            console.log('📡 API Health Check Status:', healthCheck.status);
        } catch (error) {
            console.log('❌ Server not running on localhost:3000');
            console.log('Please start the server with: npm run dev');
            return;
        }

        // Test creating a post directly (without authentication for now)
        const testPost = {
            title: 'API Test Post - Custom ID Check',
            content: '# API Test\n\nTesting if custom ID is saved through the API.',
            excerpt: 'Testing custom ID through Next.js API endpoint.',
            categories: ['API Testing'],
            tags: ['api', 'test', 'next-js'],
            status: 'published',
            published: true
        };

        console.log('📤 Sending POST request to API...');
        const response = await fetch('http://localhost:3000/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPost)
        });

        const responseText = await response.text();
        console.log('📡 API Response Status:', response.status);
        console.log('📄 API Response Body:', responseText);

        if (response.status === 401) {
            console.log('🔐 Authentication required. Let\'s try with Groq generation...');
            
            // Try Groq generation which might have different auth requirements
            const groqResponse = await fetch('http://localhost:3000/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ generateWithGroq: true })
            });

            const groqResponseText = await groqResponse.text();
            console.log('📡 Groq API Response Status:', groqResponse.status);
            console.log('📄 Groq API Response Body:', groqResponseText);
        }

        // If successful, let's also fetch all posts to see if our custom ID is there
        if (response.ok) {
            console.log('📥 Fetching all posts to verify custom ID...');
            const getAllResponse = await fetch('http://localhost:3000/api/blogs');
            const allPostsData = await getAllResponse.json();
            
            if (allPostsData.success && allPostsData.data) {
                console.log(`📊 Found ${allPostsData.data.length} posts in database`);
                
                // Check the latest post for custom ID
                const latestPost = allPostsData.data[0];
                if (latestPost) {
                    console.log('📋 Latest post details:');
                    console.log('   Title:', latestPost.title);
                    console.log('   MongoDB _id:', latestPost._id);
                    console.log('   Custom id:', latestPost.id || '❌ MISSING!');
                    console.log('   Slug:', latestPost.slug);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error testing Next.js API:', error.message);
    }
}

testNextJsApi();
