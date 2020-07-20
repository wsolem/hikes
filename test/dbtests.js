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

// var chai = require('chai');
// // var should = chai.should();
// var chaiHttp = require('chai-http');
// // var server = require('../server');
// chai.use(chaiHttp);

const hikesDb = require('../src/db/hikes');
const helperFs = require('./helperFunctions');
const hikes = require('../src/db/hikes');
const { should } = require('chai');
// const { deleteHike } = require('../src/app/hikes');
// const { on, update } = require('../knex');
// const { updateHike, allHikes } = require('../src/db/hikes');

// TODO: extract out 

// // I'm sure I can come up with something prettier here
// const compareArrays = (arr1, arr2) => {
//   for (let i = 0; i < arr1.length; i++) {
//     if (arr1[i] !== arr2[i]) {
//       return false;
//     }
//   }
//   return true;
// }

// const isHike = (hikeObject, hikeStyle) => {
//   const keys = (Object.getOwnPropertyNames(hikeObject)).sort();
//   // lazy, put it in order that it is in tabe and sorting
//   const expectedKeys = hikeStyle === 'allhikes' ?
//     [ 'name', 'distance', 'difficulty', 'hikeid' ].sort() : 
//     [ 'name', 'distance', 'hiked', 'date', 'difficulty', 'hikeid', 'regions', 'parks', 'trailheads', 'tags'].sort();
  
//   return (keys.length === expectedKeys.length) && helperFs.compareArrays(keys, expectedKeys);
// }

const hiddenHikeFields = [ 'id' ]; // i'm sure i'll find more to add here
// // um i can definitly pretty this mess up
// const hasHiddenFields = (hikeObject, hiddenHikeFields) => {
//   const keys = (Object.getOwnPropertyNames(hikeObject)).sort();

//   for(let kitr = 0; kitr < keys.length; kitr++) {
//     for(let hitr = 0; hitr < keys.length; hitr++) {
//       if(keys[kitr] === hiddenHikeFields[hitr]) {
//         return true;
//       }
//     }
//   }
//   return false;
//   // keys.forEach((key) => {
//   //   hiddenHikeFields.forEach((field) => {
//   //     if (key === field) {
//   //       return true;
//   //     }
//   //   });
//   // });
//   // return false;
// }

// // update to be more general
// const hikesMatch = (hikeA, hikeB) => {
//   const keys = (Object.getOwnPropertyNames(hikeA)).sort();
//   let key;
//   let hikeAField;
//   let hikeBField;
//   for(let itr = 0; itr < keys.length; itr++) {
//     key = keys[itr];
//     hikeAField = hikeA[key];
//     hikeBField = hikeB[key];
//     if (key === 'difficulty' || key === 'distance') {
//       hikeBField = Number(hikeBField);
//       hikeAField = Number(hikeAField);
//     }
//     if (Array.isArray(hikeAField) && Array.isArray(hikeBField)) {
//       if (!helperFs.compareArrays(hikeAField, hikeBField)) {
//         return false;
//       }
//     } else if (hikeAField !== hikeBField) {
//       return false;
//     }
//   }
//   return true;
// }

// Hikes Tests
describe('Hikes', () => {
  // ok, before and after might be handled in the pre-test script
  // before('set up all hikes ', () => {
  //   // let setupHikes = hikesSetup();
  //   // console.log('setup hikes ', setupHikes);
  //   //
  // });

  // after('tear down hikes', () => {

  // });

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
      allHikes.forEach(hike => (helperFs.isHike(hike, 'allhikes')).should.equal(true));
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
    before('get hike for tests', () => {
      hikesDb.selectHikeByHikeId(hikeid).then((hikes) => {
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
        hikeid: '999999'
      };
      let saveResponse;
      before('create hike correctly and save return object', (done) => {
        hikesDb.saveHike(newHike).then((hikes) => {
          saveResponse = hikes;
          done();
        });
      });

      after('delete the recently added hike', (done) => {
        hikesDb.deleteHikeByHikeId(newHike.hikeid).then(done());
      });
      // put this in service layer tests
      // // double check what the response is
      // it('should get a 2XX response', () => {

      // });
      // todo: move this test to service layer tests
      // it('should have a hikeid added', () => {

      // });

      // test what i get back? maybe saveResponse is not an error?

      it('should return new hike when get is called ', (done) => {
        hikesDb.selectHikeByHikeId(newHike.hikeid).then((hike) => {
          // hike is an array
          hike.length.should.equal(1);
          helperFs.hikesMatch(newHike, hike[0]).should.equal(true);
          done();
        })
      });
      
      it('call for all hikes should return new hike', (done) => {
        // test that the number of hikes is one larger than from before
        // test that the name or hikeid matches new hike in list
        let allHikesPlus;
        hikesDb.allHikes().then(hikes => {
          allHikesPlus = hikes;
          (allHikesPlus.length).should.equal(allHikes.length + 1);
          let foundHike = allHikesPlus.filter((hike) => {
            return hike.hikeid === newHike.hikeid;
          });
          helperFs.hikesMatch(newHike, foundHike[0]);
          done();
        })
      });
      describe('save two hikes with same name', () => {
        const hikeSameName = {
          name: newHike.name,
          distance: 5,
          difficulty: 1,
          hikeid: '888888'
        };
        let sameHikeResult;

        before('save new hike and keep result', (done) => {
          hikesDb.saveHike(hikeSameName).then(() => {
            // nothing is expected to happen
            done();
          }).catch((err) => {
            sameHikeResult = err;
            done()
          });
        });

        it('should get error', () => {
          sameHikeResult.should.exist;
          sameHikeResult.should.be.an.instanceOf(Error);
          sameHikeResult.constraint.should.exist;
          sameHikeResult.constraint.should.equal('hikes_name_unique');
        });
      });
    });
    // do i need to do all the required fields missing?
    // TODO: moved this to service layer
    // describe.only('missing a field', () => {
    //   const hikeWithMissingField = {
    //     name: 'Hike wiht missing field',
    //     difficulty: 2,
    //     hikeid: '888888'
    //   };
    //   let saveResponse;
    //   before('create hike incorrectly and save return object', (done) => {
    //     hikesDb.saveHike(hikeWithMissingField).then((hikes) => {
    //       console.log('hikes', hikes);
    //       saveResponse = hikes;
    //       done();
    //     });
    //   });

    //   after('delete the recently added hike', (done) => {
    //     hikesDb.deleteHikeByHikeId(hikeWithMissingField.hikeid).then(done());
    //   });

    //   // check response - 
    //   it('should fail to save', () => {
    //     console.log('!!!!!!!!!!!',saveResponse);
    //   });

    //   it('response message should indicate failure to save', () => {

    //   });

    //   it('call for all hikes should not return malformed hike', () => {
    //     // test that the number of hikes is same as before
    //     // test that there is not a name with teh same hike
    //   });
    // });
    /*
    Some other things to test:
      Creation:
        cannot create a hike with an existing name
        what happens when there are extra fields?
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
      let updatefields = {
        distance: 10
      }
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
      let updatefields = {
        derpster: 10
      }
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
      // after('change the field of hike back to original', (done) => {
      //   hikesDb.updateHike(oneHike.hikeid, { distance: oneHike.distance }).then(() => {
      //     done();
      //   });
      // });
      
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

    // this should be service layer i think
    // describe('update one protected field', () => {
    //   before('update field and save response to object', () => {

    //   });
      
    //   it('should fail to save', () => {

    //   });
    //   // specific to protected field
    //   it('should have error message', () => {

    //   });

    //   it('should not change hike object', () => {
    //     // get hike object and compare to one saved in before
    //   });
    // });

    // todo: move to service layer
    describe('update multiple valid fields', () => {
      let updatedHike;
      let updatefields = {
        distance: 12,
        difficulty: 1
      }
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
      // what else??
    });

    describe('update multiple fields with one invalid', () => {
      let updateResponse;
      let updatedHikeNonFields;
      let updatefields = {
        distance: 5,
        derpster: 10
      }
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
    // for invalid fields - also need to test for invlaid input for each field
    // this should be a service level test

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
    //todo: add test in service layer that checks if the hike exists
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
          let hikesHikeIds = hikes.map((hike) => hike.hikeid);
          let allHikesHikeIds = allHikes.map((hike) => hike.hikeid);
          (helperFs.compareArrays(hikesHikeIds.sort(), allHikesHikeIds.sort())).should.equal(true);
          done();
        });
      });
      // any other tests?
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
        })
        // in case there are other tests later
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
          let deletedHike = hikes.filter((hike) => hike.hikeid === originalHikeId);
          (deletedHike.length).should.equal(0);
          done();
        });
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
