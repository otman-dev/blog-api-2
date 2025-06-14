// Test API endpoint for creating posts
const testApiPost = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // You may need to add authentication headers here
            },
            body: JSON.stringify({
                title: 'API Test Post with Custom ID',
                content: 'This is a test post created via the API to verify custom ID generation.',
                excerpt: 'Testing API post creation with custom ID.',
                categories: ['API', 'Testing'],
                tags: ['api', 'test', 'custom-id'],
                status: 'published',
                published: true
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('API Post Creation Result:', result);
            
            if (result.success) {
                console.log('Post created successfully:');
                console.log('MongoDB _id:', result.data._id);
                console.log('Custom id:', result.data.id);
                console.log('Slug:', result.data.slug);
                console.log('Title:', result.data.title);
            }
        } else {
            console.error('Failed to create post:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('Error testing API post creation:', error);
    }
};

// Test Groq generation
const testGroqGeneration = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/blogs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                generateWithGroq: true
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Groq Generation Result:', result);
            
            if (result.success) {
                console.log('Generated post created successfully:');
                console.log('MongoDB _id:', result.data._id);
                console.log('Custom id:', result.data.id);
                console.log('Slug:', result.data.slug);
                console.log('Title:', result.data.title);
            }
        } else {
            console.error('Failed to generate post:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error details:', errorText);
        }
    } catch (error) {
        console.error('Error testing Groq generation:', error);
    }
};

console.log('Testing API post creation...');
testApiPost().then(() => {
    console.log('\nTesting Groq generation...');
    return testGroqGeneration();
});
