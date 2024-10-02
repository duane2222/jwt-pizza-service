const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const originalPassword = 'originalPassword';
const adminUserRegister = { name: 'admin', email: 'admin@gmail.com', password: originalPassword, roles: [{ role: Role.Admin }] }
const testFranchise = {name: 'pizzaPocket', admins: [{email: 'f@jwt.com'}]};
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

test('create franchise', async () => {
        const createRes = await request(app).post('/api/franchise').set('Content-Type', 'application/json').set('Authorization', 'Bearer ' + testUserAuthToken).send(testFranchise);
        expect(createRes.status).toBe(200);
        expect(createRes.body.name).toBe(testFranchise.name);
});
    
test('get franchises', async () => {
        const getRes = await request(app).get('/api/franchise');
        expect(getRes.status).toBe(200);
        const names = [];
        getRes.body.forEach((fran) => names.push(fran.name));
        expect(names.includes(testFranchise.name)).toBeTruthy();
});
