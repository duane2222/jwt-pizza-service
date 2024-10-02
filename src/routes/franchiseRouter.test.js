const request = require('supertest');
const app = require('../service');
const { Role, DB } = require('../database/database.js');

const originalPassword = 'originalPassword';
const adminUserRegister = { name: 'admin', email: 'admin@gmail.com', password: originalPassword, roles: [{ role: Role.Admin }] }
const testFranchise = {name: 'pizzaPocket', admins: [{email: 'f@jwt.com'}]};
const testStore = {franchiseId: 1, name: "SLC"};

let testUserAuthToken;
let testUserId;

beforeAll(async () => {
    adminUserRegister.email = Math.random().toString(36).substring(2, 12) + '@test.com';
    testFranchise.name = Math.random().toString(36).substring(2, 12);

    const addResult = await DB.addUser(adminUserRegister);
    addResult.password = originalPassword;
    
    testFranchise.admins[0].email = addResult.email;
    testUserId = addResult.id;

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
        testFranchise.id = createRes.body.id;
});
    
test('get franchise', async () => {
        const getRes = await request(app).get('/api/franchise');
        expect(getRes.status).toBe(200);
        const franch = [];
        getRes.body.forEach((fran) => franch.push(fran.name));
        expect(franch.includes(testFranchise.name)).toBeTruthy();
});

test('create store', async () => {
        testStore.franchiseId = testFranchise.id;
        const createRes = await request(app).post(`/api/franchise/${testFranchise.id}/store`).set('Content-Type', 'application/json').set('Authorization', 'Bearer ' + testUserAuthToken).send(testStore);
        expect(createRes.status).toBe(200);
        expect(createRes.body.name).toBe(testStore.name);
        testStore.id = createRes.body.id;
});

test('delete store', async () => {
        const deleteRes = await request(app).delete(`/api/franchise/${testFranchise.id}/store/${testStore.id}`).set('Authorization', 'Bearer ' + testUserAuthToken);
        expect(deleteRes.status).toBe(200);
        const getRes = await request(app).get('/api/franchise/' + testUserId).set('Authorization', 'Bearer ' + testUserAuthToken);
        expect(getRes.body[0].stores).toEqual([]);
});
