process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const usersDb = require('../../src/db/users');
const helperFs = require('../helperFunctions');

const should = chai.should();
chai.use(chaiHttp);

const hiddenHikeFields = ['id'];

describe('Users', () => {
  describe('#allUsers', () => {
    let allUsers;

    before('get users call & save to object', async () => {
      allUsers = await usersDb.allUsers();
    });

    it('should be an array of valid users', () => {
      allUsers.should.be.an('array');
      allUsers.forEach((user) => (helperFs.isUser(user, 'allUsers')).should.equal(true));
    });
  });
  // get get user id from list in before
  describe('#getUserById', () => {
    let allUsers;
    let userFromAll;

    before('get all users for comparison', async () => {
      allUsers = await usersDb.allUsers();
      userFromAll = allUsers[0];
    });

    describe('properly formatted request', () => {
      let user;

      before('get user object and save return', async () => {
        user = await usersDb.getUserById(userFromAll.userid);
      });

      it('should return one hike', () => {
        should.exist(user);
        user.should.be.an('array');
        user.length.should.equal(1);
      });

      // should match from one from list from before
      it('should have expected name and user id', () => {
        should.exist(user[0].username);
        user[0].username.should.equal(userFromAll.username);
        should.exist(user[0].userid);
        user[0].userid.should.equal(userFromAll.userid);
      });
      // make sure it doesn't have sensitive fields
      it('should only have expected fields', () => {
        (helperFs.isUser(user[0])).should.equal(true);
      });
    });

    describe('with non-existent user', () => {
      let getUserBadId;
      const nonExistantUserId = 'blahblahblah';

      before('request user and save response', async () => {
        getUserBadId = await usersDb.getUserById(nonExistantUserId);
      });

      it('should not include a user object', () => {
        should.exist(getUserBadId);
        getUserBadId.length.should.equal(0);
      });
    });
  });

  describe('#createUser', () => {
    let allUsers;

    before('get array of all users for comparison in later tests', async () => {
      allUsers = await usersDb.allUsers();
    });

    describe('correctly formatted', () => {
      const wellFormattedUser = {
        firstname: 'Louise',
        email: 'tina@me.com',
        userid: '333lll',
        username: 'leweeze',
        lastname: 'Belcher',
        usertype: 'free',
      };
      let newUser;

      before('create user and save response', async () => {
        const createUserResponse = await usersDb.createUser(wellFormattedUser);
        should.exist(createUserResponse);
      });

      after('delete new user', async () => {
        await usersDb.deleteUser(newUser.userid);
      });

      it('should be able to get new user and it should match user object to save', async () => {
        const newUserRes = await usersDb.getUserById(wellFormattedUser.userid);
        newUserRes.should.be.an('array');
        newUserRes.length.should.equal(1);
        newUser = newUserRes[0];
        should.exist(newUser);
        helperFs.isUser(newUser).should.equal(true);
        helperFs.usersMatch(wellFormattedUser, newUser).should.equal(true);
      });

      it('new user should be in list of all users', async () => {
        const allUsersWithNew = await usersDb.allUsers();
        (allUsers.length).should.equal(allUsersWithNew.length - 1);
        const foundUser = allUsersWithNew.filter((user) => user.userid === newUser.userid);
        helperFs.usersMatch(newUser, foundUser[0]);
      });
    });

    describe('missing required field', () => {
      const userMissingReqField = {
        firstname: 'Louise',
        email: 'tina@me.com',
        userid: '333lll',
        lastname: 'Belcher',
        usertype: 'free',
      };
      let createUserResponse;

      before('try to create new user', async () => {
        createUserResponse = await usersDb.createUser(userMissingReqField);
      });

      it('should be an error response', () => {
        createUserResponse.should.be.an.instanceOf(Error);
      });

      it('should not be able to get user', async () => {
        const newUser = await usersDb.getUserById(userMissingReqField.userid);
        newUser.should.be.an('array');
        newUser.length.should.equal(0);
      });
    });

    // describe.skip('trying to add an existing user', () => {
    //   const existingUser = {...allUsers[0]};
    //   let sameUser;

    //   before('try to create user and save object', async () => {
    //     sameUser = usersDb.createUser(existingUser);
    //   });

    //   it('should return an error', () => {
    //     sameUser.should.be.an.instanceOf(Error);
    //   });

    //   it('should not affect length of all users', async () => {
    //     const allUsersAfterCreate = await usersDb.allUsers();
    //     (allUsersAfterCreate.length).should.equal(allUsers.length);
    //   });
    // });
  });

  describe('#deleteUser', () => {
    const userToDelete = {
      firstname: 'Delete',
      email: 'blah@blah.com',
      userid: '4343bcd',
      username: 'someuser',
      lastname: 'Me',
      usertype: 'free',
    };
    let newUser;
    let allUsers;

    before('add user to delete', async () => {
      newUser = await usersDb.createUser(userToDelete); // why isn't this used in a test?
    });

    before('get all users array for a baseline', async () => {
      allUsers = await usersDb.allUsers();
    });

    after('delete user if not already deleted', async () => {
      // i know, i know... this is what the test is for. just need to clean up
      await usersDb.deleteUser(userToDelete.userid);
    });

    describe('non-existant user id', () => {
      const nonExistantUserId = 'blahblahblah';
      let delUserRes;

      before('make request and save response', async () => {
        delUserRes = await usersDb.deleteUser(nonExistantUserId);
      });

      it('should return that zero were deleted', () => {
        should.exist(delUserRes);
        delUserRes.should.equal(0);
      });

      it('list of users should not have changed', async () => {
        const allUsersAfterDel = await usersDb.allUsers();
        (allUsersAfterDel.length).should.equal(allUsers.length);
        const usersUserIds = allUsers.map((user) => user.userid);
        const usersAfterDelIds = allUsersAfterDel.map((user) => user.userid);
        (helperFs.compareArrays(usersUserIds.sort(), usersAfterDelIds.sort())).should.equal(true);
      });
    });

    describe('correctly formatted request', () => {
      let delUserRes;

      before('make request and save response', async () => {
        delUserRes = await usersDb.deleteUser(userToDelete.userid);
      });

      it('should have a return indicating success', () => {
        should.exist(delUserRes);
        delUserRes.should.equal(1);
      });

      it('should no longer be able to get user', async () => {
        const userAfterDel = await usersDb.getUserById(userToDelete.userid);
        should.exist(userAfterDel);
        userAfterDel.length.should.equal(0);
      });

      it('should no longer be in list of all users', async () => {
        const allUsersAfterDel = await usersDb.allUsers();
        allUsers.length.should.equal(allUsersAfterDel.length + 1);
        const deletedUser = allUsersAfterDel.filter((user) => user.userid === userToDelete.userid);
        deletedUser.length.should.equal(0);
      });
    });
  });

  describe('#updateUser', () => {
    const userToUpdate = {
      username: 'sprout',
      firstname: 'Sprout',
      lastname: 'Solem',
      userid: 'spr123',
      usertype: 'paid',
    };
    let userToUpdateCtrd;

    before('create new user to update', async () => {
      await usersDb.createUser(userToUpdate);
      const userToUpdateCtrdRes = await usersDb.getUserById(userToUpdate.userid);
      userToUpdateCtrd = userToUpdateCtrdRes[0];
    });

    after('delete updated user', async () => {
      await usersDb.deleteUser(userToUpdate.userid);
    });

    describe('update one field', () => {
      describe('updateable field', () => {
        let updateUserRes;
        const updateField = {
          lastname: 'Smith',
        };

        before('update user and save return', async () => {
          updateUserRes = await usersDb.updateUser(userToUpdate.userid, updateField);
        });

        after('reset field', async () => await usersDb.updateUser(userToUpdate.userid, { lastname: userToUpdate.lastname }));

        it('should have a return indicating success', () => {
          should.exist(updateUserRes);
          updateUserRes.should.equal(1);
        });

        it('should see change when getting user object', async () => {
          const updatedUserArr = await usersDb.getUserById(userToUpdate.userid);
          const updatedUser = updatedUserArr[0];
          should.exist(updatedUser);
          (helperFs.isUser(updatedUser)).should.equal(true);
          (updatedUser.userid).should.equal(userToUpdate.userid);
          (updatedUser.lastname).should.equal(updateField.lastname);
          (updatedUser.lastname).should.not.equal(userToUpdate.lastname);
        });
      });

      describe('non-existant field', () => {
        let updateUserRes;
        const updateField = {
          blah: 'blahblahblah',
        };

        before('update and save response', async () => {
          updateUserRes = await usersDb.updateUser(userToUpdate.userid, updateField);
        });

        it('should indicate failure in response', () => {
          should.exist(updateUserRes);
          updateUserRes.should.be.instanceOf(Error);
        });

        it('should not change fields when getting user', async () => {
          const updatedUserRes = await usersDb.getUserById(userToUpdate.userid);
          const updatedUser = updatedUserRes[0];
          should.not.exist(updatedUser.blah);
          (helperFs.usersMatch(userToUpdateCtrd, updatedUser)).should.equal(true);
        });
      });
    });
    // I'm pretty sure these tests are incomplete
    describe('multiple fields', () => {
      describe('one nonexistant field, one updateable field', () => {
        let updatedUserRes;
        const updateFields = {
          blahblah: 'blahblahblah',
          usertype: 'free',
        };

        before('update and save return object', async () => {
          updatedUserRes = await usersDb.updateUser(userToUpdate.userid, updateFields);
        });

        it('should be an error', () => {
          should.exist(updatedUserRes);
          updatedUserRes.should.be.instanceOf(Error);
        });

        it('should not have changed user object', async () => {
          const updatedUserArr = await usersDb.getUserById(userToUpdate.userid);
          const updatedUser = updatedUserArr[0];
          (helperFs.usersMatch(updatedUser, userToUpdateCtrd)).should.equal(true);
        });
      });

      describe('all non-existant fields', () => {
        let updatedUser;
        let updateRet;
        const updateFields = {
          blahblah: 'blahblahblah',
          blah: 123,
        };

        before('try to update and save return', async () => {
          updateRet = await usersDb.updateUser(userToUpdate.userid, updateFields);
        });

        it('should get a return indicating that nothing was updated', () => {
          should.exist(updateRet);
          updateRet.should.be.an.instanceOf(Error);
        });

        it('should not have changed user', async () => {
          const updatedUserArr = await usersDb.getUserById(userToUpdate.userid);
          updatedUser = updatedUserArr[0];
          (helperFs.usersMatch(updatedUser, userToUpdateCtrd)).should.equal(true);
        });
      });

      describe('all updateable fields', () => {
        let updateUserRes;
        const updateFields = {
          lastname: 'Smith',
          firstname: 'striker',
        };

        before('update and save return object', async () => {
          updateUserRes = await usersDb.updateUser(userToUpdate.userid, updateFields);
        });

        it('should be successful', () => {
          should.exist(updateUserRes);
          updateUserRes.should.equal(1);
        });

        it('should match update', async () => {
          const updatedUserArr = await usersDb.getUserById(userToUpdate.userid);
          const updatedUser = updatedUserArr[0];
          updatedUser.lastname.should.equal(updateFields.lastname);
          updatedUser.firstname.should.equal(updateFields.firstname);
          updatedUser.lastname.should.not.equal(userToUpdateCtrd.lastname);
          updatedUser.firstname.should.not.equal(userToUpdateCtrd.firstname);
        });
      });
    });
  });
});