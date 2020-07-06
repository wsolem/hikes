'use strict';

// todo: refactor to put all service layer tests (eg, responses) into their own files
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
process.env.NODE_ENV = 'test';

var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../server');
chai.use(chaiHttp);

// blerg

const hikesDb = require('../db/hikes');
const hikes = require('../db/hikes');
// const assert = require('assert');
// const expect = require('chai').expect;
// const should = require('chai').should();
// need to includ should library i think
// the fuck? 
// const { deepStrictEqual } = require('assert');
// const { delete } = require('../db/dbSetup');

// need to include dbSetup
// const hikes = [
//   {
//     name: 'Mountain Top',
//     distance: 3,
//     difficulty: 3
//   },
//   {
//     name: 'Beachside',
//     distance: 2,
//     difficulty: 2
//   },
//   {
//     name: 'River Walk',
//     distance: 3,
//     difficulty: 1
//   }
// ];
let res = {
  send: (data) => data,
  status: (data) => {
    this.status = data;
    this.json = (hikes) => hikes;
    return this;
  }
};
let req = {

};
// // const debSetup = () => {

// // }

// // hmm but the issue sort of is that this is already seeded, so is this even necessary??
// const hikesSetup = () => {
//   // i suppose I 

//   // create a bunch of hikes
//   // name: string
//   // regions: string || string[] --> string[]
//   // distance: number
//   // hiked: boolean
//   // date: date
//   // difficulty: integer
//   // hikeid: null --> uuid
//   // parks: string || string[] --> string[]
//   // trailheads: string || string[] --> string[]
//   // tags: string || string[] --> string[]
  
//   // i want to create and destroy a test database
//   let req = {
//     body: hikes
//   };
//   // let res = {};

//   // for each post
//   // for(let i = 0; i < hikes.length; i++) {
//   hikesDb.createHike(req, res);
//   // }
// };

// The reason I'm having a hard time is cause I'm doing the functions wrong!!!!!!!!
// i need to separate out the database from the return

// Hikes Tests
describe('Hikes', () => {
  before('set up all hikes ', () => {
    // let setupHikes = hikesSetup();
    // console.log('setup hikes ', setupHikes);
    //
  });

  after('tear down hikes', () => {

  });

  describe.only('#getHikes()', () => {
    let allHikes;
    // let allHikesResponse;
    // let req = {};
    before('get all hikes and save to an object', (done) => {
      allHikes = hikesDb.getHikes(req,res);
      // should.exist(allHikes);
      // allHikes.should.be.an('array');
      console.log('ALL HIKES!!!!!!!!!!!!!!!!!!!!!!!!', allHikes)
      done();

      /*
      chai.request(server)
    .get('/api/v1/shows')
    .end(function(err, res) {
    res.should.have.status(200) */


    // ACtually, this should be in services not databse layer
      // chai.request(server)
      //   .get('/hikes')
      //   .end((err, response) => {
      //     should.not.exist(err);
      //     should.exist(response);
      //     // response.should.have.status(200);
      //     allHikesResponse = response;
      //     allHikes = response.body;
      //     done();
      //   });
    });

    // should be services not db layer
    // it('should have 200 response', (done) => {
    //   allHikesResponse.should.have.status(200);
    //   done();
    // })
    it('should get all hikes', (done) => {
      // console.log(allHikes);
      allHikes.should.be.an('array');
      done();
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

// Lists (of hikes) Tests
describe('Lists', () => {
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

// describe('Array', function () {
//   describe('#indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       assert.equal([1, 2, 3].indexOf(4), -1);
//     });
//   });
// });
