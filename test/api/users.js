process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const helperFs = require('../helperFunctions');
const usersDb = require('../../src/db/users');

const should = chai.should();
chai.use(chaiHttp);
const requester = chai.request(server).keepOpen();

describe('Users', () => {
  // todo: add tests for allUsers restrictions by usertype
  describe('#allUsers', () => {
    let allUsersRes;
    let allUsers;

    before('get all users and save object', async () => {
      allUsersRes = await requester.get('/api/users');
      allUsers = allUsersRes.body;
    });

    it('should be a successful response', () => {
      should.exist(allUsersRes);
      allUsersRes.status.should.equal(200);
    });

    it('should return all users', () => {
      should.exist(allUsers);
      allUsers.should.be.an('array');
      allUsers.length.should.equal(3);
      allUsers.map((user) => (helperFs.isUser(user, 'allUsers')).should.equal(true));
    });
  });

  describe('#getUserById', () => {
    describe('successful', () => {
      let allUsers;
      let userFromAll;
      let userByIdRes;
      let userById;

      before('get all users as baseline and save user for comparison', async () => {
        const allUsersRes = await requester.get('/api/users');
        allUsers = allUsersRes.body;
        userFromAll = allUsers[0];
      });

      before('get user by id and save', async () => {
        userByIdRes = await requester.get(`/api/users/${userFromAll.userid}`);
        userById = userByIdRes.body[0];
      });

      it('should have a succesful response', () => {
        should.exist(userByIdRes);
        userByIdRes.status.should.equal(200);
        should.exist(userByIdRes.body);
        userByIdRes.body.length.should.equal(1);
      });

      it('should be a matching user', () => {
        should.exist(userById);
        should.exist(userById.firstname);
        userById.firstname.should.equal(userFromAll.firstname);
        should.exist(userById.lastname);
        userById.lastname.should.equal(userFromAll.lastname);
        should.exist(userById.userid);
        userById.userid.should.equal(userFromAll.userid);
        should.exist(userById.username);
        userById.username.should.equal(userFromAll.username);
      });
    });

    describe('non-existant id', () => {
      const fakeId = 'fakeid';
      let fakeIdRes;

      before('try to get user and save response', async () => {
        fakeIdRes = await requester.get(`/api/users/${fakeId}`);
      });

      it('should not be a successful response', () => {
        should.exist(fakeIdRes);
        fakeIdRes.status.should.equal(404);
      });
    });
  });

  describe('#createUser', () => {
    let allUsers;

    before('get all users for comparison', async () => {
      const allUsersRes = await requester.get('/api/users');
      allUsers = allUsersRes.body;
    });

    describe('successful user', () => {
      const newUserSetup = {
        username: 'lindab',
        firstname: 'Linda',
        lastname: 'Belcher',
        email: 'lindab@bobs.com',
        usertype: 'paid',
      };
      let createdUserRes;
      let newUser;

      before('create user and save result', async () => {
        createdUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      after('delete new user', async () => {
        await usersDb.deleteUser(createdUserRes.body.userid);
      });

      it('should be successful', () => {
        should.exist(createdUserRes);
        createdUserRes.status.should.equal(201);
        should.exist(createdUserRes.body);
        should.exist(createdUserRes.body.userid);
      });

      it('should be able to get new user', async () => {
        const newUserRes = await requester.get(`/api/users/${createdUserRes.body.userid}`);
        newUser = newUserRes.body[0];
        (helperFs.isUser(newUser)).should.equal(true);
        // const allFields = newUserSetup.every((field) => newUser.includes(field));
        const setupKeys = Object.keys(newUserSetup);
        const misMatchedFields = setupKeys.filter((key) => newUserSetup[key] !== newUser[key]);
        misMatchedFields.length.should.equal(0);
      });

      it('should be in all users', async () => {
        const allUsersWithNewRes = await requester.get('/api/users');
        const allUsersWithNew = allUsersWithNewRes.body;
        allUsersWithNew.length.should.equal(allUsers.length + 1);
        const hasNew = allUsersWithNew.filter((user) => user.username === newUserSetup.username);
        hasNew.length.should.equal(1);
      });
    });

    describe('missing field/s', () => {
      const newUserSetup = {
        username: 'BobB',
        firstname: 'Bob',
        lastname: 'Belcher',
        email: 'bob@bobs.com',
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        should.exist(createUserRes);
        createUserRes.status.should.equal(400);
        should.exist(createUserRes.text);
        createUserRes.text.should.equal(`User ${newUserSetup.username} not created`);
      });

      it('should not change list of all users', async () => {
        const allUsersAfterCreateRes = await requester.get('/api/users');
        const allUsersAfterCreate = allUsersAfterCreateRes.body;
        allUsersAfterCreate.length.should.equal(allUsers.length);
        const hasCreatedUser = allUsersAfterCreate.filter((user) => user.username === newUserSetup.username);
        hasCreatedUser.length.should.equal(0);
      });
    });

    describe('non-existant field/s', () => {
      const newUserSetup = {
        username: 'BobB',
        firstname: 'Bob',
        lastname: 'Belcher',
        email: 'bob@bobs.com',
        usertype: 'paid',
        fakeField: 'this field should not exist',
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        should.exist(createUserRes);
        createUserRes.status.should.equal(400);
        should.exist(createUserRes.text);
        createUserRes.text.should.equal(`User ${newUserSetup.username} not created`);
      });

      it('should not change list of all users', async () => {
        const allUsersAfterCreateRes = await requester.get('/api/users');
        const allUsersAfterCreate = allUsersAfterCreateRes.body;
        allUsersAfterCreate.length.should.equal(allUsers.length);
        const hasCreatedUser = allUsersAfterCreate.filter((user) => user.username === newUserSetup.username);
        hasCreatedUser.length.should.equal(0);
      });
    });

    describe('invalid field value/s', () => {
      const newUserSetup = {
        username: 'BobB',
        firstname: 'Bob',
        lastname: 'Belcher',
        email: 'bob@bobs.com',
        usertype: 123,
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        should.exist(createUserRes);
        createUserRes.status.should.equal(400);
        should.exist(createUserRes.text);
        createUserRes.text.should.equal(`User ${newUserSetup.username} not created`);
      });

      it('should not change list of all users', async () => {
        const allUsersAfterCreateRes = await requester.get('/api/users');
        const allUsersAfterCreate = allUsersAfterCreateRes.body;
        allUsersAfterCreate.length.should.equal(allUsers.length);
        const hasCreatedUser = allUsersAfterCreate.filter((user) => user.username === newUserSetup.username);
        hasCreatedUser.length.should.equal(0);
      });
    });

    describe('empty field/s', () => {
      const newUserSetup = {
        username: 'BobB',
        firstname: 'Bob',
        lastname: 'Belcher',
        invalidField: 'bob@bobs.com',
        usertype: '',
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        should.exist(createUserRes);
        createUserRes.status.should.equal(400);
        should.exist(createUserRes.text);
        createUserRes.text.should.equal(`User ${newUserSetup.username} not created`);
      });

      it('should not change list of all users', async () => {
        const allUsersAfterCreateRes = await requester.get('/api/users');
        const allUsersAfterCreate = allUsersAfterCreateRes.body;
        allUsersAfterCreate.length.should.equal(allUsers.length);
        const hasCreatedUser = allUsersAfterCreate.filter((user) => user.username === newUserSetup.username);
        hasCreatedUser.length.should.equal(0);
      });
    });
    // todo: use email validator
    describe.skip('invalid email field', () => {
      const newUserSetup = {
        username: 'BobB',
        firstname: 'Bob',
        lastname: 'Belcher',
        email: 'not an email',
        usertype: 'paid',
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        should.exist(createUserRes);
        createUserRes.status.should.equal(400);
        should.exist(createUserRes.text);
        createUserRes.text.should.equal(`User ${newUserSetup.username} not created`);
      });

      it('should not change list of all users', async () => {
        const allUsersAfterCreateRes = await requester.get('/api/users');
        const allUsersAfterCreate = allUsersAfterCreateRes.body;
        allUsersAfterCreate.length.should.equal(allUsers.length);
        const hasCreatedUser = allUsersAfterCreate.filter((user) => user.username === newUserSetup.username);
        hasCreatedUser.length.should.equal(0);
      });
    });
  });

  describe.skip('#deleteUser', () => {
  });

  describe.skip('#updateUser', () => {
  });
});