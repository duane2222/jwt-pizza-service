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


test('get menu', async () => {
    const getRes = await request(app).get('/api/order/menu');
    const titles = [];
    getRes.body.forEach((item) => titles.push(item.title));
    expect(titles.includes(testMenuItem.title)).toBeTruthy();
});