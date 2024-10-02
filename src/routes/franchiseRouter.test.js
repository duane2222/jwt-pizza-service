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
    const addResult = await DB.addUser(adminUserRegister);
    addResult.password = originalPassword;

    const loginRes = await request(app)
        .put('/api/auth')
        .send({ email: addResult.email, password: addResult.password });
    
    expect(loginRes.status).toBe(200);
    
    testUserAuthToken = loginRes.body.token;
    testUserId = addResult.id;

    testFranchise.name = Math.random().toString(36).substring(2, 12);
    testFranchise.admins[0].email = addResult.email;
    
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
        const names = [];
        getRes.body.forEach((fran) => names.push(fran.name));
        expect(names.includes(testFranchise.name)).toBeTruthy();
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
        expect(getRes.body[0].stores).toStrictEqual([]);
});
