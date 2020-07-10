'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var should = chai.should();
var chaiHttp = require('chai-http');
var server = require('../server');
chai.use(chaiHttp);
const requester = chai.request(server).keepOpen();
const helperFs = require('./helperFunctions');
const hikesDb = require('../src/db/hikes');
const { createSandbox } = require('sinon');
// const { request } = require('express');

// Hikes Tests
describe.only('Hikes', function() {
  after('close requester', () => requester.close());

  describe.skip('#getHikes', function() {

    it('should return all hikes', (done) => {
      requester.get('/api/hikes')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          res.body.length.should.equal(3);
          res.body.map((hike) => (helperFs.isHike(hike, 'allhikes')).should.equal(true));
          done();
        });
    });
  });

  describe('#getHikeByHikeId', () => {
    let oneHike;
    
    before('get all hikes and save', (done) => {
      requester.get('/api/hikes')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          should.exist(res.body);
          oneHike = res.body[0];
          done();
        });
    });

    describe('correct id', () => {
      it('should get one hike', (done) => {
        const hikeid = oneHike.hikeid
        
        requester.get(`/api/hikes/${hikeid}`)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            should.exist(res.body);
            res.body.length.should.equal(1);
            oneHike = res.body[0];
            (helperFs.isHike(oneHike)).should.eq(true);
            done();
          });
      }); 
    });

    describe('incorrect id', () => {
      const fakeid = 'xxxxxx';

      it('should not return a hike', (done) => {
        requester.get(`/api/hikes/${fakeid}`)
          .end((err, res) => {
            should.not.exist(err);
            should.exist(res);
            res.should.have.status(404);
            should.exist(res.body.error);
            res.body.error.should.eq('This resource does not exist');
            done();
          });
      });
    });
  });

  describe('#createHike', () => {
    let allHikes;

    before('get all hikes as baseline', (done) => {
      requester.get('/api/hikes')
        .end((err, res) => {
          should.not.exist(err);
          should.exist(res);
          allHikes = res.body;
          done();
        });
    });

    describe('one hike', () => {
      describe('properly formatted', () => {

        describe('should create one hike', () => {
          let hikeId;
          let saveResponse;
          const newHike = {
            name: 'New Hike',
            distance: 4,
            difficulty: 2,
          };
          before('save hike', (done) => {
            requester.post('/api/hikes')
              .send(newHike)
              .end((err, res) => {
                should.not.exist(err);
                should.exist(res);
                saveResponse = res;
                should.exist(saveResponse.body);
                console.log('saveResponse.body',saveResponse.body);
                hikeId = saveResponse.body.hikeid;
                done();
              });
          });

          after('delete recently added hike', (done) => {
            hikesDb.deleteHikeByHikeId(hikeId).then((response) => {
              // I just wanna see if this works at all
              done();
            });
          });

          // take a look at what we get back from request
          it('should be successful post', (done) => {
            should.exist(saveResponse);
            saveResponse.status.should.equal(201);
            should.exist(hikeId);
            done();
          });

          it('should be able to get new hike', (done) => {
            let newlyAddedHike;
            requester.get(`/api/hikes/${hikeId}`)
              .end((err, res) => {
                should.not.exist(err);
                should.exist(res);
                should.exist(res.body);
                newlyAddedHike = res.body[0];
                newlyAddedHike.name.should.equal(newHike.name);
                newlyAddedHike.hikeid.should.equal(hikeId);
                done();
              });
          });

          it('should be in list of all hikes', (done) => {
            let allHikesAdded;

            requester.get('/api/hikes')
              .end((err, res) => {
                should.not.exist(err);
                allHikesAdded = res.body;
                let newlyAddedHike = allHikesAdded.find((hike) => hike.hikeid === hikeId);
                should.exist(newlyAddedHike);
                let creatingHike = { ...newHike };
                creatingHike.hikeid = hikeId;
                (helperFs.hikesMatch(newlyAddedHike, creatingHike)).should.equal(true); 
                done();
              });
          });
        });
      });

      describe.skip('improperly formatted', () => {

      });      
    });

    describe('multiple hikes', () => {
      describe('properly formatted', () => {

      });

      describe('imporperly formatted', () => {
        // I'm thinking save what's correct, return hike info if incorrect
        describe('one correct, other incorrect', () => {

        });
        describe('multiple incorrect', () => {
          describe('nonexistant hike id', () => {

          });
          describe('nonexistant fields', () => {

          });
        });
      });
    });

  });

  describe('#updateHike', () => {
    describe('one hike', () => {
      describe('correctly formatted', () => {

      });
      describe('incorrectly formatted', () => {

      });
    });

    describe('multiple hikes', () => {
      describe('correctly formatted', () => {

      });

      describe('incorrectly formatted', () => {
        // I'm thinking save what's correct, return hike info if incorrect
        describe('only one incorrect hike', () => {

        });
        describe('all incorrectly formatted', () => {
          describe('nonexistant hike id', () => {

          });
          describe('not-updateable fields', () => {

          });
        });
      });
    });
    
  });

  describe('#deleteHike', () => {
    describe('one hike', () => {
      describe('correctly formatted', () => {

      });
      describe('incorrectly formatted', () => {

      });
    });
    describe('multiple hikes', () => {
      describe('correctly formatted', () => {

      });
      describe('incorrectly formatted', () => {
        describe('one non-existant id out of multiple', () => {

        });
        describe('all non-existant ids', () => {
          
        })
      });
    });
  });
});
