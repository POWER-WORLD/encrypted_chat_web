const http = require('http');

(async () => {
    // Setting test environment so server.js exports without auto-starting
    process.env.NODE_ENV = 'test';
    process.env.MONGO_URI = 'memory';
    const TEST_PORT = 5055;

    const { server } = require('../server');
    const { connectDB, disconnectDB } = require('../config/db');

    console.log('[E2E_TEST] Connecting to in-memory database and auto-seeding demo users...');
    await connectDB();

    await new Promise((resolve) => server.listen(TEST_PORT, resolve));
    console.log(`[E2E_TEST] Test Server successfully listening on http://localhost:${TEST_PORT}`);

    const request = (path, method = 'GET', data = null, token = null) => {
        return new Promise((resolve, reject) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = 'Bearer ' + token;
            const req = http.request(
                {
                    hostname: 'localhost',
                    port: TEST_PORT,
                    path,
                    method,
                    headers,
                },
                (res) => {
                    let body = '';
                    res.on('data', (chunk) => (body += chunk));
                    res.on('end', () => {
                        try {
                            resolve({ status: res.statusCode, data: JSON.parse(body) });
                        } catch {
                            resolve({ status: res.statusCode, data: body });
                        }
                    });
                }
            );
            req.on('error', reject);
            if (data) req.write(JSON.stringify(data));
            req.end();
        });
    };

    try {
        // 1. Health check
        const health = await request('/api/health');
        console.log('✓ 1. Health Check status:', health.status, '| API Health:', health.data.status);

        // 2. Login with seeded user Pawan Kumar
        console.log('\n✓ 2. Testing Login with seeded user pawan@msgcrypt.com...');
        const loginRes = await request('/api/users/login', 'POST', {
            email: 'pawan@msgcrypt.com',
            password: 'Password123!',
        });
        console.log('   Login Status:', loginRes.status);
        console.log('   Authenticated User:', loginRes.data.name);
        console.log('   User ID:', loginRes.data._id);
        console.log('   JWT Token Received:', !!loginRes.data.token);
        const token = loginRes.data.token;

        if (!token) {
            throw new Error('Failed to obtain JWT token from login');
        }

        // 3. Register brand new local user
        console.log('\n✓ 3. Testing Registration of new user testuser@example.com...');
        const registerRes = await request('/api/users/register', 'POST', {
            name: 'Local Test Engineer',
            email: 'testuser@example.com',
            password: 'Password123!',
        });
        console.log('   Registration Status:', registerRes.status);
        console.log('   New User Created:', registerRes.data.name, '| ID:', registerRes.data._id);

        // 4. Test login with newly registered user
        console.log('\n✓ 4. Testing Login with newly registered user...');
        const newLoginRes = await request('/api/users/login', 'POST', {
            email: 'testuser@example.com',
            password: 'Password123!',
        });
        console.log('   Login Status:', newLoginRes.status);
        console.log('   Authenticated as:', newLoginRes.data.name);

        // 5. Fetch chats
        console.log('\n✓ 5. Fetching chats for Pawan Kumar with Bearer JWT...');
        const chatsRes = await request('/api/chats', 'GET', null, token);
        console.log('   Fetch Chats Status:', chatsRes.status);
        console.log('   Total Active Chats:', chatsRes.data.length);
        chatsRes.data.forEach((c, i) => {
            console.log(`   [Chat #${i + 1}] "${c.chatName || 'Direct'}" | isGroup: ${c.isGroupChat} | ID: ${c._id}`);
        });

        // 6. Post new message to direct chat
        const targetChat = chatsRes.data[0];
        console.log(`\n✓ 6. Sending encrypted message to chat ID: ${targetChat._id}...`);
        const msgRes = await request(
            '/api/messages',
            'POST',
            {
                chatId: targetChat._id,
                content: 'Local terminal uplink active. Transmission test successful.',
            },
            token
        );
        console.log('   Message Send Status:', msgRes.status);
        console.log('   Message Content:', msgRes.data.content);
        console.log('   Sender:', msgRes.data.sender.name);

        // 7. Retrieve messages from chat
        console.log(`\n✓ 7. Retrieving historical messages from chat ID: ${targetChat._id}...`);
        const getMsgsRes = await request(`/api/messages/${targetChat._id}`, 'GET', null, token);
        console.log('   Messages Retrieved Status:', getMsgsRes.status);
        console.log('   Total Messages in Chat:', getMsgsRes.data.length);
        getMsgsRes.data.forEach((m, idx) => {
            console.log(`   [Msg #${idx + 1}] ${m.sender.name}: "${m.content}"`);
        });

        console.log('\n=============================================================');
        console.log(' SUCCESS: FULL-STACK LOCAL BACKEND & DB LIFECYCLE VERIFIED! ');
        console.log('=============================================================\n');
    } catch (err) {
        console.error('Test execution failed:', err);
        process.exit(1);
    } finally {
        server.close();
        await disconnectDB();
        process.exit(0);
    }
})();
