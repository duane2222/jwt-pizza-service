const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const originalPassword = 'originalPassword';
const adminUserRegister = { name: 'admin', email: 'admin@gmail.com', password: originalPassword, roles: [{ role: Role.Admin }] }
const testMenuItem = { title: 'spicy pizza', description: 'its spicy', image: 'pizza.png', price: 10.00 };
let testUserAuthToken;

beforeAll(async () => {
    adminUserRegister.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    const addResult = await DB.addUser(adminUserRegister);
    addResult.password = originalPassword;

    const loginRes = await request(app)
        .put('/api/auth')
        .send({ email: addResult.email, password: addResult.password });
    
    expect(loginRes.status).toBe(200);
    
    testUserAuthToken = loginRes.body.token;
});

test('add item', async () => {
        const addRes = await request(app).put('/api/order/menu').set('Content-Type', 'application/json').set('Authorization', 'Bearer ' + testUserAuthToken).send(testMenuItem);
        expect(addRes.status).toBe(200);
        const titles = [];
        addRes.body.forEach((item) => titles.push(item.title));
        expect(titles.includes(testMenuItem.title)).toBeTruthy();
    });

test('get menu', async () => {
    const getRes = await request(app).get('/api/order/menu');
    expect(getRes.status).toBe(200);
    const titles = [];
    getRes.body.forEach((item) => titles.push(item.title));
    expect(titles.includes(testMenuItem.title)).toBeTruthy();
});

test('get order', async () => {
        const getRes = await request(app).get('/api/order').set('Authorization', 'Bearer ' + testUserAuthToken);
        expect(getRes.status).toBe(200);
        expect(getRes.body.dinerId).toBeTruthy();
});