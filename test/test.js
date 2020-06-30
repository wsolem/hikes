'use strict';
/*
Starting with a to do list for testing

Database
- Code to setup a test database

- Users
  getUser,
  getUserById,
  createUser,
  deleteUser,
  updateUser,

- Lists
  getListsByUser,
  createList,
  deleteList,
  deleteHikeFromList,
  addHikeToList,

- Hikes
    getHikes,
    getHikeByHikeId,
    createHike,
    updateHike,
    deleteHikeByHikeId,

- Trailheads


Note: I really need to separate the database layer from the service layer
- I need a proper design document
- input validation/verification
- do some helper functions

also really need to separate out the tests into their own files based on 
- db, service layer
- hikes, users, trailheads, lists
- helper functions 
*/

const assert = require('assert');
const { deepStrictEqual } = require('assert');


// Hikes Tests
describe('Hikes', () => {
  before('set up all hikes ', () => {

  });

  after('tear down hikes', () => {

  });

  describe('#getHikes()', () => {
    it('should get all hikes', () => {

    });
  });

  describe('#getHikeByHikeId()', () => {
    before('get the hike and save for tests', () => {

    });

    it('should return one hike', () => {

    });
    // Note: update this to include all the correct details
    it('should contain all hike details', () => {

    });
    // note: update to specifiy which details are not included
    it('should not contain wrong details', () => {

    });
  });

  // test variations of hike objects - certain details added, missing, etc.
  describe('#createHike()', () => {
    before('get all hikes as a baseline', () => {
      // make an assertion about the hikes, make note of the number for later tests
    });
    describe('formatted correctly', () => {
      before('create hike correctly and save return object', () => {

      });

      after('delete the recently added hike', () => {

      });
      // double check what the response is
      it('should get a 2XX response', () => {

      });
      // double check about the specific values returned
      it('should return hike object', () => {

      });

      it('should have a hikeid added', () => {

      });

      it('separate get hike call with new hike id should return hike', () => {

      });
      
      it('call for all hikes should return new hike', () => {
        // test that the number of hikes is one larger than from before
        // test that the name or hikeid matches new hike in list
      });
    });
    // do i need to do all the required fields missing?
    describe('missing a field', () => {
      before('create hike incorrectly and save return object', () => {

      });
      // check response - 
      it('should fail to save', () => {

      });

      it('response message should indicate failure to save', () => {

      });

      it('call for all hikes should not return malformed hike', () => {
        // test that the number of hikes is same as before
        // test that there is not a name with teh same hike
      });
    });
    /*
    Some other things to test:
      Creation:
        cannot create a hike with an existing name
        what happens when there are extra fields?
    */

  });

  describe('#updateHike()', () => {
    before('get hike to update as a baseline', () => {

    });
    
    describe('update one valid field', () => {
      
      before('update one field of hike object and save', () => {
        // make sure to save the field that is going to be changed in order to change back
      });
      after('change the field of hike back to original', () => {

      });
      // update only one field, get 
      it('should return hike object with updated field', () => {
        // only testing that there is a returned hike object and that it has changed field
      });
      it('should match original other than new field', () => {

      });
      // what else to check?
    });

    describe('update one non-existant field', () => {
      before('update field and save response to object', () => {

      });
      
      it('should fail to save', () => {

      });
      // should say field doesn't exist
      it('should have error message', () => {

      });

      it('should not change hike object', () => {
        // get hike object and compare to one saved in before
      });
    });

    describe('update one protected field', () => {
      before('update field and save response to object', () => {

      });
      
      it('should fail to save', () => {

      });
      // specific to protected field
      it('should have error message', () => {

      });

      it('should not change hike object', () => {
        // get hike object and compare to one saved in before
      });
    });

    describe('update multiple valid fields', () => {
      before('update a hike object', () => {
        // make sure to save fields that wll be changed to set back to original in after
      });
   
      after('restore hike object', () => {

      });

      it('should return hike object with new fields changed', () => {

      });

      it('should match original for other fields', () => {

      });
      // what else??
    });

    describe('update multiple fields with one invalid', () => {
      before('update object call', () => {

      });

      it('should fail to save', () => {

      });
      // should note which field is incorrect
      it('should have error message', () => {

      });

      it('should not change hike object', () => {
        // get hike object and compare to one saved in before
      });
    });
    // for invalid fields - also need to test for invlaid input for each field
    // this should be a service level test

  });

  describe('#deleteByHikeId()', () => {
    before('get hike object', () => {
      // saved to restore later - 
    });
    
    before('get all hikes for number', () => {

    });

    describe('non-existant hike id', () => {
      before('generate new id and try to delete', () => {

      });

      it('should return error', () => {

      });

      it('should be same amount of hikes', () => {
        // get all hikes for number and compare to oen from before
      });
      // any other tests?
    });

    describe('valid hike id', () => {
      before('delete call ', () => {
        // use hike id gotten from before above
      });

      after('restore hike', () => {
        // in case there are other tests later
      });

      it('should get back hike object', () => {
        // should return the hike object that was deleted - double check about which fields
      });

      it('should not be able to get hike anymore', () => {
        // request with saved hike id should return an error
      });

      it('should no longer be in all hikes', () => {
        // erquest for all hikes should be one shorter
      });
      // i feel like there should be more tests
    });
  });
});

// Users Tests
describe('Users', () => {
  before('set up users', () => {

  });
  after('tear down users', () => {

  });
  /// um, i don't actually have a function for this yet
  describe('#getAllUsers', () => {
    before('get users call & save to object', () => {

    });
    it('should match list of uses in setup', () => {

    });
    it('should only include valid fields', () => {

    });
  });
  // get get user id from list in before
  describe('#getUserById', () => {
    describe('properly formatted request', () => {
      before('get user object and save return', () => {

      });
      // todo: fix to reflect expected response
      it('should have a successful response', () => {

      });
      // should match from one from list from before
      it('should have expected name and user id', () => {

      });
      // make sure it doesn't have sensitive fields
      it('should only have expected fields', () => {

      });

    });
    describe('with non-existent user', () => {
      before('request user and save response', () => {

      });
      // todo: make sure i know the expected response 
      it('should have a failed response and message', () => {

      });
      it('should not include the user object', () => {

      });
    });
  });
  
  describe('#createUser', () => {
    describe('correctly formatted', () => {
      before('create user and save response', () => {

      });
      after('delete new user', () => {

      });
      it('should have a successful response', () => {

      });
      it('should have a user id generated and returned', () => {

      });
      it('should match object saved', () => {

      });
      // get list of all users
      it('new user should be in list of all users', () => {

      });
    });

    describe('missing required fields', () => {
      before('create user request and save response', () => {

      });
      // todo: make sure it has correct response
      it('should have a failure response', () => {

      });
      it('should not have new user in response', () => {

      });
      // get list of all users
      it('should not be in list of all users', () => {

      });
    });
    describe('has incorrect fields', () => {
      before('create user request and save response', () => {

      });
      // todo: make sure it has correct response
      it('should have a failure response', () => {

      });
      it('should not have new user in response', () => {

      });
      // get list of all users
      it('should not be in list of all users', () => {

      });
    });
  });

  describe('#deleteUser', () => {
    before('add user to delete', () => {
      // make sure to save in object for following tests
    });
    describe('non-existant user id', () => {
      before('make request and save response', () => {

      });
      it('should be a failure response', () => {

      });
      it('list of users should not have changed', () => {
      });
    });
    // how many ways can this be incorrectly formatted?
    describe('incorrectly formatted request', () => {
      before('make request and save response', () => {

      });
      it('should be a failure response', () => {

      });
      // request user by user id from before
      it('should return user when requested by id', () => {

      });
      it('should still be in list of all users', () => {
        // check both for user in list and length
      });
    });
    describe('correctly formatted request', () => {
      before('make request and save response', () => {

      });
      it('should have a successful response', () => {
        // response and should have some limited user object
      });
      it('should no longer be able to request object', () => {
        // 4xx response for user id
      });
      it('should no longer be in list of all users', () => {
        // request all users, should be one shorter
      });
    });
  });

  describe('#updateUser', () => {
    describe('update one field', () => {
      describe('updateable field', () => {
        before('update request and save respnose', () => {
        });
        it('should be successful', () => {

        });
        it('should match update', () => {

        });
        it('should see update in new request', () => {

        });
      });
      describe("multiple updateable fields", () => {
        before('update request and save respnose', () => {
        });
        it('should be successful', () => {

        });
        it('should match update', () => {

        });
        it('should see update in new request', () => {

        });
      });
      // todo: service layer to test incorrect input for fields
      describe('protected field', () => {
        before('request and save object', () => {

        });
        it('should have a failure response', () => {

        });
        it('should not match update in new request', () => {

        });
      });
      describe('multiple fields with at least one protected field', () => {
        before('request and save object', () => {

        });
        it('should have a failure response', () => {

        });
        it('should not match update in new request', () => {

        });
      });
    })
  })
});


// describe('Array', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });
