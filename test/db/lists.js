process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
// const hikesDb = require('../../src/db/hikes');
// const usersDb = require('../../src/db/users');
const helperFs = require('../helperFunctions');

const should = chai.should();
chai.use(chaiHttp);

const hiddenHikeFields = ['id'];

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