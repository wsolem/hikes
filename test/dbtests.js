/*
- Lists
  getListsByUser,
  createList,
  deleteList,
  deleteHikeFromList,
  addHikeToList,

- Trailheads

- Parks

- I need a proper design document
- input validation/verification

also really need to separate out the tests into their own files based on
- hikes, users, trailheads, lists
- helper functions
*/
process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const hikesDb = require('../src/db/hikes');
const usersDb = require('../src/db/users');
const helperFs = require('./helperFunctions');

const should = chai.should();
chai.use(chaiHttp);

const hiddenHikeFields = ['id'];

// Hikes Tests
describe('Hikes', () => {
  describe('#allHikes', () => {
    let allHikes;

    before('get all hikes and save to an object', (done) => {
      hikesDb.allHikes().then((hikes) => {
        allHikes = hikes;
        done();
      });
    });

    it('should be an array of hikes', (done) => {
      allHikes.should.be.an('array');
      allHikes.forEach(hike => (helperFs.isHike((hike), 'allhikes')).should.equal(true));
      done();
    });
  });

  describe('#getHikeByHikeId', () => {
    let hikeId;
    let oneHike;
    let hikesArr;
    before('get all hikes to get id for one', (done) => {
      hikesDb.allHikes().then((hikes) => {
        hikeId = hikes[0].hikeid;
        done();
      });
    });
    before('get hike for tests', (done) => {
      hikesDb.selectHikeByHikeId(hikeId).then((hikes) => {
        hikesArr = hikes;
        oneHike = hikes[0];
        done();
      });
    });

    it('should return one hike', (done) => {
      hikesArr.length.should.equal(1);
      done();
    });
    // Note: update this to include all the correct details
    it('should contain all hike details', (done) => {
      (helperFs.isHike(oneHike)).should.equal(true);
      done();
    });
    // note: update to specifiy which details are not included
    it('should not contain wrong details', () => {
      helperFs.hasHiddenFields(oneHike, hiddenHikeFields).should.equal(false);
    });
  });

  // test variations of hike objects - certain details added, missing, etc.
  describe('#createHike', () => {
    let allHikes;

    before('get all hikes as a baseline', (done) => {
      // make an assertion about the hikes, make note of the number for later tests
      hikesDb.allHikes().then((hikes) => {
        allHikes = hikes;
        done();
      });
    });

    describe('formatted correctly', () => {
      const newHike = {
        name: 'New Hike',
        distance: 4,
        difficulty: 2,
        hikeid: '999999',
      };
      let saveResponse;

      before('create hike correctly and save return object', (done) => {
        hikesDb.saveHike(newHike).then((hikes) => {
          saveResponse = hikes; // this should be used in a test
          done();
        });
      });

      after('delete the recently added hike', (done) => {
        hikesDb.deleteHikeByHikeId(newHike.hikeid).then(done());
      });

      it('should return new hike when get is called ', (done) => {
        hikesDb.selectHikeByHikeId(newHike.hikeid).then((hike) => {
          // hike is an array
          hike.length.should.equal(1);
          helperFs.hikesMatch(newHike, hike[0]).should.equal(true);
          done();
        });
      });

      it('call for all hikes should return new hike', (done) => {
        let allHikesPlus;

        hikesDb.allHikes().then((hikes) => {
          allHikesPlus = hikes;
          (allHikesPlus.length).should.equal(allHikes.length + 1);
          const foundHike = allHikesPlus.filter((hike) => hike.hikeid === newHike.hikeid);
          helperFs.hikesMatch(newHike, foundHike[0]);
          done();
        });
      });

      describe('save two hikes with same name', () => {
        const hikeSameName = {
          name: newHike.name,
          distance: 5,
          difficulty: 1,
          hikeid: '888888',
        };
        let sameHikeResult;

        before('save new hike and keep result', async () => {
          sameHikeResult = await hikesDb.saveHike(hikeSameName);
        });

        it('should get error', () => {
          should.exist(sameHikeResult);
          sameHikeResult.should.be.an.instanceOf(Error);
          should.exist(sameHikeResult.message);
          sameHikeResult.message.should.equal('hikes_name_unique');
        });
      });
    });
    /*
    Some other things to test:
      Creation:
        cannot create a hike with an existing name
        what happens when there are extra fields? - this will be caught in service layer
    */
  });

  describe('#updateHike', () => {
    let oneHike;

    before('get hike to update as a baseline', (done) => {
      hikesDb.allHikes().then((hikes) => {
        hikesDb.selectHikeByHikeId(hikes[0].hikeid).then((hike) => {
          oneHike = hike[0];
          done();
        });
      });
    });

    describe('update one valid field', () => {
      let updatedHike;
      const updatefields = {
        distance: 10,
      };

      before('update one field of hike object and save', (done) => {
        // make sure to save the field that is going to be changed in order to change back
        hikesDb.updateHike(oneHike.hikeid, updatefields).then(() => {
          hikesDb.selectHikeByHikeId(oneHike.hikeid).then((hikes) => {
            updatedHike = hikes[0];
            done();
          });
        });
      });

      after('change the field of hike back to original', (done) => {
        hikesDb.updateHike(oneHike.hikeid, { distance: oneHike.distance }).then(() => {
          done();
        });
      });

      // update only one field, get
      it('should have updated field in hike', (done) => {
        (updatedHike.distance).should.not.equal(oneHike.distance);
        (Number(updatedHike.distance)).should.equal(updatefields.distance);
        done();
      });

      it('should have other fields match original', (done) => {
        (updatedHike.hikeid).should.equal(oneHike.hikeid);
        (updatedHike.difficulty).should.equal(oneHike.difficulty);
        done();
      });
      // what else to check?
    });

    describe('update one non-existant field', () => {
      let updateResponse;
      let updatedHikeNonField;
      const updatefields = {
        derpster: 10,
      };

      before('update one field of hike object and save', (done) => {
        // make sure to save the field that is going to be changed in order to change back
        hikesDb.updateHike(oneHike.hikeid, updatefields).then((updateRes) => {
          updateResponse = updateRes;
          hikesDb.selectHikeByHikeId(oneHike.hikeid).then((hikes) => {
            updatedHikeNonField = hikes[0];
            done();
          });
        });
      });

      it('should fail to save with error message', (done) => {
        updateResponse.should.be.an.instanceOf(Error);
        updateResponse.message.should.equal('failed to update');
        done();
      });

      it('should not change hike object', (done) => {
        (helperFs.hikesMatch(updatedHikeNonField, oneHike)).should.equal(true);
        done();
      });
    });

    // todo: move to service layer
    describe('update multiple valid fields', () => {
      let updatedHike;
      const updatefields = {
        distance: 12,
        difficulty: 1,
      };

      before('update one field of hike object and save', (done) => {
        // make sure to save the field that is going to be changed in order to change back
        hikesDb.updateHike(oneHike.hikeid, updatefields).then(() => {
          hikesDb.selectHikeByHikeId(oneHike.hikeid).then((hikes) => {
            updatedHike = hikes[0];
            done();
          });
        });
      });

      after('change the field of hike back to original', (done) => {
        hikesDb.updateHike(oneHike.hikeid, { distance: oneHike.distance, difficulty: oneHike.difficulty }).then(() => {
          done();
        });
      });

      it('should return hike object with new fields changed', (done) => {
        (helperFs.hikesMatch(oneHike, updatedHike)).should.equal(false);
        Number(updatedHike.distance).should.equal(updatefields.distance);
        Number(updatedHike.difficulty).should.equal(updatefields.difficulty);
        done();
      });

      it('should match original for other fields', (done) => {
        (updatedHike.name).should.equal(oneHike.name);
        (updatedHike.hikeid).should.equal(oneHike.hikeid);
        done();
      });
    });

    describe('update multiple fields with one invalid', () => {
      let updateResponse;
      let updatedHikeNonFields;
      const updatefields = {
        distance: 5,
        derpster: 10,
      };

      before('update one field of hike object and save', (done) => {
        // make sure to save the field that is going to be changed in order to change back
        hikesDb.updateHike(oneHike.hikeid, updatefields).then((updateRes) => {
          updateResponse = updateRes;
          hikesDb.selectHikeByHikeId(oneHike.hikeid).then((hikes) => {
            updatedHikeNonFields = hikes[0];
            done();
          });
        });
      });

      it('should fail to save with error message', (done) => {
        updateResponse.should.be.an.instanceOf(Error);
        updateResponse.message.should.equal('failed to update');
        done();
      });

      it('should not change hike object', (done) => {
        (helperFs.hikesMatch(updatedHikeNonFields, oneHike)).should.equal(true);
        done();
      });
    });
  });

  describe('#deleteByHikeId', () => {
    let allHikes;
    let originalHike;
    let originalHikeId;

    before('get all hikes', (done) => {
      hikesDb.allHikes().then((hikes) => {
        allHikes = hikes;
        originalHikeId = allHikes[0].hikeid;
        done();
      });
    });

    before('get hike object', (done) => {
      hikesDb.selectHikeByHikeId(originalHikeId)
        .then((hikes) => {
          originalHike = hikes[0];
          done();
        });
    });

    describe('non-existant hike id', () => {
      const fakeHikeId = 'xxxxxx';

      before('try to delete hike with fake id and save response', (done) => {
        hikesDb.deleteHikeByHikeId(fakeHikeId).then(() => {
          done();
        });
      });

      it('should be same amount of hikes', (done) => {
        hikesDb.allHikes().then((hikes) => {
          (hikes.length).should.equal(allHikes.length);
          const hikesHikeIds = hikes.map((hike) => hike.hikeid);
          const allHikesHikeIds = allHikes.map((hike) => hike.hikeid);
          (helperFs.compareArrays(hikesHikeIds.sort(), allHikesHikeIds.sort())).should.equal(true);
          done();
        });
      });
    });

    describe('valid hike id', () => {
      let deleteResponse;

      before('delete call ', (done) => {
        hikesDb.deleteHikeByHikeId(originalHikeId).then((res) => {
          deleteResponse = res;
          done();
        });
      });

      after('restore hike', (done) => {
        hikesDb.saveHike(originalHike).then((hike) => {
          done();
        });
      });

      it('should not get error', (done) => {
        deleteResponse.should.not.be.instanceOf(Error);
        done();
      });

      it('should not be able to get hike anymore', (done) => {
        hikesDb.selectHikeByHikeId(originalHikeId).then((res) => {
          res.length.should.equal(0);
          done();
        });
      });

      it('should no longer be in all hikes', (done) => {
        hikesDb.allHikes().then((hikes) => {
          (hikes.length).should.equal((allHikes.length - 1));
          const deletedHike = hikes.filter((hike) => hike.hikeid === originalHikeId);
          (deletedHike.length).should.equal(0);
          done();
        });
      });
    });
  });
});
// TODO: SEPARATE INTO OWN FILE
// Users Tests
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

      // this doesn't work as expected - but this type of check will be done in the service layser
      describe.skip('wrong type of data for field', () => {
        let updateUserRes;
        const updateField = {
          username: 123,
        };

        before('update and save response', async () => {
          updateUserRes = await usersDb.updateUser(userToUpdate.userid, updateField);
        });

        it('should show a successful call', () => {
          should.exist(updateUserRes);
          updateUserRes.should.equal(1);
        });

        it('should not have changed user object', async () => {
          const updatedUserArr = await usersDb.getUserById(userToUpdate.userid);
          const updatedUser = updatedUserArr[0];
          userToUpdateCtrd.username.should.equal(updatedUser.username);
          updatedUser.username.should.not.equal(updateField.username);
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
      // what? there are no tests here?
      describe('all non-existant fields', () => {
        let updatedUserRes;
        const updateField = {
          blahblah: 'blahblahblah',
          blah: 123,
        };
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

// Lists (of hikes) Tests
describe.skip('Lists', () => {
  before('set up hikes, users, and lists', () => {

  });

  after('tear down hikes, users, and lists', () => {

  });

  describe('#getListsByUser', () => {
    describe('correctly formatted request', () => {
      describe('user is list owner', () => {
        before('request list that user owns and save response', () => {

        });
        // todo: correct response info
        it('should have a successful 2xx response', () => {

        });
        it('should return a list associated wiht user id', () => {

        });
  
        it('should contain correct list data', () => {
          // list id
          // list name
          // array of hike names/ids
          // name of owner
          // other users associated with list
        });
      });
      describe('user does not own list', () => {
        before('request list that user does not own and save response', () => {

        });
         // todo: correct response info
        it('should have a successful 2xx response', () => {

        });
        it('should return a list associated wiht user id', () => {

        });
  
        it('should contain correct list data', () => {
          // list id
          // list name
          // array of hike names/ids
          // name of owner
        });

      });
    });
    describe('user does not have any lists', () => {
      before('make request and save response', () => {

      });
      it('should have successful response', () => {

      });
      // todo : make sure the response is correct
      it('list object shoud be empty', () => {

      });
    })
    describe('user does not exist', () => {
      before('make request and save response', () => {

      });
      // todo: double check response
      it('should have failed response', () => {

      });
      it('should not return lists', () => {

      });
    });
    // in the future - add service layer logic to confirm that the user can only request their own lists
    // gonna have to add in some stuff with cookies or something
  });

  describe('#createList', () => {
    describe('correctly formatted', () => {
      before('create list and save response', () => {

      });
      it('should have a successful response', () => {

      });
      it('should have list info in response', () => {

      });
      it('should show the user who created it as owner', () => {

      });
      it('should be in list of all hikes associated wtih user', () => {

      });
      it('should match requested list info', () => {
        // request list and compare
      });
    });
    describe('non-existant user', () => {
      before('request create list and save object', () => {

      });
      it('should be a failed response', () => {

      });
      // any other tests???????
    });
    describe('no hikes sent', () => {
      before('creaet list and save response', () => {

      });
      it('should create empty list', () => {

      });
      // anything else?
    });
  });

  describe('#deleteList', () => {
    describe('correctly formatted', () => {
      before('add list to delete', () => {

      });
      before('delete request and save response', () => {

      });
      it('should have successful response', () => {

      });
      it('should return list object', () => {

      });
      it('should not be able to request deleted list', () => {

      });
      it('shoudl not longer be in lsti of lists', () => {

      });
    });
    describe('user does not own the list', () => {
      before('add list to delete', () => {

      });
      before('delete request and save response', () => {

      });
      it('should have a failure response', () => {
        // should say that can't delete a list you don't own
      });
      it('should still be in list of lists', () => {

      });
      it('should still be able to request list', () => {

      });
    });
    // ok, any other good delet errors?
    
  });

  describe('#removeHikeFromList', () => {
    describe('remove one hike', () => {

      describe('correctly formated', () => {
        before('create one hike to remove', () => {

        });
        before('remove request and save response', () => {

        });
        it('should have successful response', () => {

        });
        it('should have info for removed hike returned', () => {

        });
        it('should no longer show up in list of hikes', () => {

        });

      });
      describe('hike does not exist', () => {
        before('create one hike to remove', () => {

        });
        before('remove request and save response', () => {

        });
        it('shoud have a fail response', () => {

        });
        it('should not change list', () => {

        });
      });
    });
    describe('remove array of hikes', () => {
      describe('correctly formated', () => {
        before('create two hikes to remove', () => {

        });
        before('remove request and save response', () => {

        });
        it('should have successful response', () => {

        });
        it('should have info for removed hikes returned', () => {

        });
        it('should no longer show up in list of hikes', () => {

        });

      });
      describe('at least one hike does not exist', () => {
        before('create hikes to remove', () => {

        });
        before('remove request and save response', () => {

        });
        it('shoud have a fail response', () => {

        });
        it('should not change list', () => {

        });
      });
    });

    describe('user does not exist', () => {
      before('create hike to remove', () => {

      });
      before('remove request', () => {

      });
      it('should get failure response', () => {

      });
    });
    describe('list does not exist', () => {
      before('create hike to remove', () => {

      });
      before('remove request', () => {

      });
      it('should get failure response', () => {

      });
      it('list of lists shoudl not change', () => {

      });
    });
    describe('hike does not exist', () => {
      before('create hike to remove', () => {

      });
      before('remove request', () => {

      });
      it('should get failure response', () => {

      });
      it('list of hikes shoudl not change', () => {

      });
    });

  });
  
  describe('#addHikeToList', () => {
    before('create a list', () => {

    });
    describe('list does not exist', () => {
      before('create hike to add', () => {

      });
      before('request to add hike', () => {

      });
      it('should have failure response', () => {

      });

    });
    describe('hike does not exist', () => {
      before('request to add hike', () => {

      });
      it('should have failure response', () => {

      });
    });

    describe('single hike', () => {
      before('create hike to add', () => {

      });
      before('request to add hike', () => {

      });
      it('shoudl get success response', () => {

      });
      it('should be in list', () => {

      });
    });
    describe('array of hikes', () => {
      before('create hikes to add', () => {

      });
      describe('one or more hikes does not exist', () => {
        before('request to add hikes', () => {

        });
        it('should get failure response', () => {

        });
        it('should not be added to list', () => {

        });
      });
      describe('one or more hikes already in list', () => {
        before('create new hike', () => {

        });
        before('request to add hikes', () => {

        });
        it('should get success response', () => {

        });
        it('hike should only be added once', () => {

        });
      });
      describe('all new hikes', () => {
        before('create new hikes', () => {

        });
        before('request to add hikes', () => {

        });
        it('should get success response', () => {

        });
        it('hikes should be added to list', () => {

        });
      });
    });
  });
  /*
  addHikeToList,
  likely many other list functions to include, may service layer too
    such as change owner, add user, add comments
  */
});
