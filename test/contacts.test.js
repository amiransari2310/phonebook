const model = require('../models/contacts.model');
const userModel = require('../models/users.model');
const { insertManyInDb } = require('../services/crud.service');
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../index');
const { users, contacts: allContacts } = require('./mockData');
let contacts = allContacts.slice(0, 2);
let token, userId;

describe('/contacts', () => {
    beforeEach(async () => {
        try {
            await model.deleteMany({});
            await userModel.deleteMany({});
            if (!token) {
                const user = await userModel.create(users[0]);
                userId = user._id;
                const loginResponse = await request(app).post('/auth/login').send({ user: users[0].userName, password: users[0].password });
                const { body: { data: { token: newToken } = {} } = {} } = loginResponse;
                token = newToken;
            }
        } catch (err) {
            console.log('Error While deleteMany() In beforEach() Of Contacts => ', err);
        }
    });

    describe('GET /', () => {
        it('should return all contacts of user/admin', async () => {
            await model.deleteMany({});
            contacts = contacts.map(contact => { return { ...contact, user: userId } });
            await model.insertMany(contacts);
            const res = await request(app).get('/contacts').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(2);
        });

        it('should return no contacts', async () => {
            const res = await request(app).get('/contacts').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.length).to.equal(0);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return error with 500', async () => {
            const res = await request(app).get('/contacts?filter=invalidJson').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.statusCode).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetching Contacts Records.');
        });

        it('should return success when using query params', async () => {
            contacts = contacts.map(contact => { return { ...contact, user: userId } });
            await model.insertMany(contacts);
            const res = await request(app).get('/contacts?filter={"name":"admincontact"}&page=0&count=1&sort=name').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(200);
            expect(res.body.data.length).to.equal(1);
        });
    });

    describe('GET /:id', () => {
        it('should return single object', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const res = await request(app).get(`/contacts/${doc._id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no contact record found', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).get(`/contacts/${_id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data).to.equal(null);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).get(`/contacts/invalidId`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Fetchig Contacts Record.');
        });
    });

    describe('POST /', () => {
        it('should create a record in db', async () => {
            delete contacts[0].user;
            const res = await request(app).post(`/contacts`).send(contacts[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
        });

        it('should return validation error', async () => {
            const { name, ...contact } = contacts[0];
            const res = await request(app).post(`/contacts`).send(contact).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
        });
    });

    describe('PUT /', () => {
        it('should update a record in db', async () => {
            const doc = await model.create({...contacts[0], user: userId });
            let recordToUpdate = contacts[0];
            recordToUpdate.name = 'updatedName';
            const res = await request(app).put(`/contacts/${doc._id}`).send(recordToUpdate).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data.name).to.equal('updatedName');
        });

        it('should return contact record not found', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).put(`/contacts/${_id}`).send(contacts[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return validation error', async () => {
            const { name, ...contact } = contacts[0];
            const doc = await model.create({ ...contacts[0], user: userId });
            const { _id } = doc;
            const res = await request(app).put(`/contacts/${_id}`).send({ ...contact, user: userId }).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(400);
        });

        it('should return server error 500', async () => {
            const res = await request(app).put(`/contacts/invalidId`).send(contacts[0]).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Updating Contacts Record.');
        });
    });

    describe('DELETE /:id', () => {
        it('should remove single object', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const res = await request(app).delete(`/contacts/${doc._id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no contact record found', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).delete(`/contacts/${_id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });

        it('should return server error 500', async () => {
            const res = await request(app).delete(`/contacts/invalidId`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(500);
            expect(res.body.message).to.equal('Error While Deleting Contacts Record.');
        });
    });

    describe('DELETE /:id', () => {
        it('should remove single object', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const res = await request(app).delete(`/contacts/${doc._id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.data._id).to.equal(doc._id.toString());
        });

        it('should return no contact record found', async () => {
            const doc = await model.create({ ...contacts[0], user: userId });
            const { _id } = doc;
            await doc.remove({ _id });
            const res = await request(app).delete(`/contacts/${_id}`).set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.statusCode).to.equal(204);
        });
    });

    describe('insertMany Method', () => {
        it('should insert multiple records in db', async () => {
            contacts = contacts.map(contact => { return { ...contact, user: userId } });
            const res = await insertManyInDb(contacts, 'contacts');
            expect(res.length).to.equal(2);
        });
    });
});