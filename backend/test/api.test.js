const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
process.env.NODE_ENV = 'test';
process.env.PORT = '0'; // Ephemeral port

const { app, server } = require('../server');

describe('API Server & Security Integration Tests', () => {
    let baseUrl;

    before(async () => {
        await new Promise((resolve) => {
            server.listen(0, () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}`;
                resolve();
            });
        });
    });

    after(async () => {
        await new Promise((resolve) => {
            server.close(resolve);
        });
    });

    it('GET /api/health returns 200 and healthy status', async () => {
        const res = await fetch(`${baseUrl}/api/health`);
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'healthy');
        assert.ok(data.uptime !== undefined);
        assert.ok(data.timestamp);
    });

    it('GET / returns 200 operational message and frontend origin reference', async () => {
        const res = await fetch(`${baseUrl}/`);
        const data = await res.json();

        assert.strictEqual(res.status, 200);
        assert.strictEqual(data.status, 'operational');
        assert.strictEqual(data.frontend, 'https://encrypted-chats.onrender.com');
    });

    it('GET /api/nonexistent returns 404 formatted error from notFound middleware', async () => {
        const res = await fetch(`${baseUrl}/api/nonexistent`);
        const data = await res.json();

        assert.strictEqual(res.status, 404);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('Resource Not Found'));
    });

    it('Security headers (Helmet) should be present in HTTP responses', async () => {
        const res = await fetch(`${baseUrl}/api/health`);

        // Helmet headers
        assert.ok(res.headers.get('x-content-type-options'));
        assert.strictEqual(res.headers.get('x-content-type-options'), 'nosniff');
        assert.ok(res.headers.get('x-dns-prefetch-control'));
    });

    it('POST /api/users/register without body fields returns 400 Bad Request', async () => {
        const res = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('Please provide'));
    });

    it('POST /api/users/register with invalid email format returns 400 Bad Request', async () => {
        const res = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'invalid-email-address',
                password: 'validPassword123',
            }),
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('valid email address'));
    });

    it('POST /api/users/register with password under 6 characters returns 400', async () => {
        const res = await fetch(`${baseUrl}/api/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: '123',
            }),
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('at least 6 characters'));
    });

    it('POST /api/users/login without credentials returns 400 Bad Request', async () => {
        const res = await fetch(`${baseUrl}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const data = await res.json();

        assert.strictEqual(res.status, 400);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('email and password'));
    });

    it('GET /api/chats without authorization token returns 401 Unauthorized', async () => {
        const res = await fetch(`${baseUrl}/api/chats`);
        const data = await res.json();

        assert.strictEqual(res.status, 401);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('Not authorized'));
    });

    it('GET /api/messages/12345 without authorization token returns 401 Unauthorized', async () => {
        const res = await fetch(`${baseUrl}/api/messages/12345`);
        const data = await res.json();

        assert.strictEqual(res.status, 401);
        assert.strictEqual(data.success, false);
        assert.ok(data.message.includes('Not authorized'));
    });
});
