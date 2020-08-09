process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const hikesDb = require('../../src/db/hikes');
const helperFs = require('../helperFunctions');

const should = chai.should();
chai.use(chaiHttp);

const hiddenHikeFields = ['id'];

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
      allHikes.forEach((hike) => (helperFs.isHike((hike), 'allhikes')).should.equal(true));
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