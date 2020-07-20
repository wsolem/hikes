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
const { update } = require('../knex');

// Hikes Tests
describe.only('Hikes', () => {
  after('close requester', () => requester.close());

  describe('#getHikes', () => {
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
                hikeId = saveResponse.body.hikeIds[0];
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
          it('should be successful post', () => {
            should.exist(saveResponse);
            saveResponse.status.should.equal(201);
            should.exist(hikeId);
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

      describe('improperly formatted', () => {
        describe('missing a required field', () => {
          const hikeMissingField = {
            name: 'Missing a field',
            difficulty: 2,
          };
          let missingFieldResult;

          before('try to save hike', (done) => {
            requester.post('/api/hikes')
              .send(hikeMissingField)
              .end((err, res) => {
                should.not.exist(err);
                should.exist(res);
                missingFieldResult = res;
                done();
              });
          });

          it('should get a failure', () => {
            missingFieldResult.status.should.equal(400);
            should.exist(missingFieldResult.error);
            should.exist(missingFieldResult.error.text);
            // todo: this string and any other used, errors, etc., should be saved somewhere
            // missingFieldResult.error.text.should.equal('Incorrectly formatted Hike');
            missingFieldResult.error.text.should.equal(`'${hikeMissingField.name}' creation failed`)
          });

          it('should not be found in list of all hikes', (done) => {
            let hikes;
            requester.get('/api/hikes').then((res) => {
              should.exist(res);
              hikes = res.body;
              (hikes.length).should.equal(allHikes.length);
              const hikesSaved = hikes.filter(hike => hike.name === hikeMissingField.name);
              hikesSaved.length.should.equal(0);
              done();
            });
          });
        });
        // ok, serioulsy, i need to rephrase this 
        describe('save hike with custom hike id', () => {
          const hikeCustomId = {
            name: 'Has hikeid already added',
            difficulty: 2,
            distance: 2,
            hikeid: '123lkj'
          };
          let withHikeIdRes;

          before('try to create hike and save response', (done) => {
            requester.post('/api/hikes')
              .send(hikeCustomId)
              .end((err, res) => {
                should.not.exist(err);
                withHikeIdRes = res;
                done();
              });
          });

          it('should get a failed response', () => {
            withHikeIdRes.status.should.equal(400);
            should.exist(withHikeIdRes.error);
            should.exist(withHikeIdRes.error.text);
            // withHikeIdRes.error.text.should.equal('Incorrectly formatted Hike');
            withHikeIdRes.error.text.should.equal(`'${hikeCustomId.name}' creation failed`);
          });

          it('should not be found in list of all hikes', (done) => {
            let hikes;
            requester.get('/api/hikes').then((res) => {
              should.exist(res);
              hikes = res.body;
              (hikes.length).should.equal(allHikes.length);
              const hikesSaved = hikes.filter(hike => hike.name === withHikeIdRes.name);
              hikesSaved.length.should.equal(0);
              done();
            });
          });
        });

        describe('with field that does not exist', () => {
          const hikeNonExistantField = {
            name: 'Hike With Non-existant field',
            difficulty: 2,
            distance: 2,
            blahblah: 'blahblah'
          };
          let hikeNonExistantFldRes;

          before('try to create hike and save response', (done) => {
            requester.post('/api/hikes')
              .send(hikeNonExistantField)
              .end((err, res) => {
                should.not.exist(err);
                hikeNonExistantFldRes = res;
                done();
              });
          });

          it('should get a failed response', () => {
            hikeNonExistantFldRes.status.should.equal(400);
            should.exist(hikeNonExistantFldRes.error);
            should.exist(hikeNonExistantFldRes.error.text);
            // hikeNonExistantFldRes.error.text.should.equal('Incorrectly formatted Hike');
            hikeNonExistantFldRes.error.text.should.equal(`'${hikeNonExistantField.name}' creation failed`)
          });

          it('should not be found in list of all hikes', (done) => {
            let hikes;
            requester.get('/api/hikes').then((res) => {
              should.exist(res);
              hikes = res.body;
              (hikes.length).should.equal(allHikes.length);
              const hikesSaved = hikes.filter(hike => hike.name === hikeNonExistantField.name);
              hikesSaved.length.should.equal(0);
              done();
            });
          });
        });
      });      
    });

    describe('multiple hikes', () => {
      describe('properly formatted', () => {
        let hikeIds;
        let saveResponse;
        const newHikes = [
          {
            name: 'New Hike One',
            distance: 1,
            difficulty: 2,
          },
          {
            name: 'New Hike Two',
            distance: 3,
            difficulty: 4,
          }
        ];

        before('create hikes and save response', (done) => {
          requester.post('/api/hikes')
            .send(newHikes)
            .end((err, res) => {
              should.not.exist(err);
              should.exist(res);
              saveResponse = res;
              should.exist(saveResponse.body);
              hikeIds = saveResponse.body.hikeIds;
              done();
            });
        });

        after('delete recently added hike', async () => {
          const deleteHikes = await hikeIds.map(hikeId => hikesDb.deleteHikeByHikeId(hikeId));
          Promise.all(deleteHikes);
        });

        it('should be a successful post', () => {
          should.exist(saveResponse);
          saveResponse.status.should.equal(201);
          should.exist(hikeIds);
        });
        
        it('should be able to get new hikes', async () => {
          const newlySavedHikes = hikeIds.map(async (hikeId) => await requester.get(`/api/hikes/${hikeId}`));
          Promise.all(newlySavedHikes).then(hikes => {
           hikes.map(hike => {
             should.exist(hike.body);
             (newHikes.filter(newHike => newHike.name === hike.body[0].name)).length.should.equal(1);
           });
          });
        });
        
        it('should be in list of all hikes', async () => {
          const allHikesAdded = await requester.get('/api/hikes');
          should.exist(allHikesAdded.body);
          allHikesAdded.body.length.should.equal(allHikes.length + newHikes.length);
          // const newHikeNames = newHikes.map(hike => hike.name);
          const allHikesAddedNames = (allHikesAdded.body).map(hike => hike.name);
          ((newHikes.map(hike => hike.name)).every(hikeName => allHikesAddedNames.includes(hikeName))).should.equal(true);
        });
      });

      describe('improperly formatted', () => {
        let allHikes;

        before('get all hikes and save for baseline', async () => {
          const allHikesRes = await requester.get('/api/hikes');
          allHikes = allHikesRes.body;
        });
        // can do a loop cause we have almost identical tests here
        // I'm thinking save what's correct, return hike info if incorrect
        describe('one correctly formatted, other incomplete', () => {
          const partiallyCompleteHikes = [
            {
              name: 'Proper Hike',
              difficulty: 2,
              distance: 2,
            },
            {
              name: 'Missing info Hike',
              distance: 2
            }
          ];
          let savedResponse;
          let newHikeIds;
          let newHikeErrs;

          before('make request and save response', async () => {
            savedResponse = await requester.post('/api/hikes')
              .send(partiallyCompleteHikes);
              newHikeIds = savedResponse.body.hikeIds;
              newHikeErrs = savedResponse.body.hikeErrs;
          });

          after('delete recently saved hike/s', async () => {
            await hikesDb.deleteHikeByHikeId(newHikeIds[0]);
          });

          it('should get a successful response', () => {
            should.exist(savedResponse);
            savedResponse.status.should.equal(201);
          });

          it('should only save correct hike', () => {
            should.exist(newHikeIds);
            newHikeIds.length.should.equal(1);
          });

          it('should get a error response for incorrect hike', () => {
            should.exist(newHikeErrs);
            newHikeErrs.length.should.equal(1);
            newHikeErrs[0].should.equal(`'${partiallyCompleteHikes[1].name}' creation failed`);
          });

          it('should be able to get correct hike ', async () => {
            let savedHike = await requester.get(`/api/hikes/${newHikeIds[0]}`);
            should.exist(savedHike.body[0]);
            (savedHike.body[0].name).should.equal(partiallyCompleteHikes[0].name);
          });

          it('should have correct hike in list of all hikes', async () => {
            const allHikesAddedRes = await requester.get('/api/hikes');
            const allHikesAdded = allHikesAddedRes.body;
            (allHikesAdded.length).should.equal(allHikes.length + 1);
            const addedHikeNames = (allHikesAdded.filter(hike => hike.name === partiallyCompleteHikes[0].name));
            const notAddedHikeNames = (allHikesAdded.filter(hike => hike.name === partiallyCompleteHikes[1].name));
            addedHikeNames.length.should.equal(1);
            notAddedHikeNames.length.should.equal(0);
          });
        });

        describe('one correct, other with nonexistant fields', () => {
          const partiallyCompleteHikes = [
            {
              name: 'Proper Hike',
              difficulty: 2,
              distance: 2,
            },
            {
              name: 'non-existant field Hike',
              difficulty: 2,
              distance: 2,
              blahblah: 'blah'
            }
          ];
          let savedResponse;
          let newHikeErrs;
          let newHikeIds;

          before('make request and save response', async () => {
            savedResponse = await requester.post('/api/hikes')
              .send(partiallyCompleteHikes);
              newHikeIds = savedResponse.body.hikeIds;
              newHikeErrs = savedResponse.body.hikeErrs;
          });

          after('delete recently saved hike/s', async () => {
            await hikesDb.deleteHikeByHikeId(newHikeIds[0]);
          });

          it('should get a successful response', () => {
            should.exist(savedResponse);
            savedResponse.status.should.equal(201);
          });

          it('should only save correct hike', () => {
            should.exist(newHikeIds);
            newHikeIds.length.should.equal(1);
          });

          it('should get a error response for incorrect hike', () => {
            should.exist(newHikeErrs);
            newHikeErrs.length.should.equal(1);
            newHikeErrs[0].should.equal(`'${partiallyCompleteHikes[1].name}' creation failed`);
          });

          it('should be able to get correct hike ', async () => {
            let savedHike = await requester.get(`/api/hikes/${newHikeIds[0]}`);
            should.exist(savedHike.body[0]);
            (savedHike.body[0].name).should.equal(partiallyCompleteHikes[0].name);
          });

          it('should have correct hike in list of all hikes', async () => {
            const allHikesAddedRes = await requester.get('/api/hikes');
            const allHikesAdded = allHikesAddedRes.body;
            (allHikesAdded.length).should.equal(allHikes.length + 1);
            const addedHikeNames = (allHikesAdded.filter(hike => hike.name === partiallyCompleteHikes[0].name));
            const notAddedHikeNames = (allHikesAdded.filter(hike => hike.name === partiallyCompleteHikes[1].name));
            addedHikeNames.length.should.equal(1);
            notAddedHikeNames.length.should.equal(0);
          });
        });

        describe('only incorrect', () => {
          const incorrectHikes = [
            {
              name: 'Missing field Hike',
              difficulty: 2,
            },
            {
              name: 'non-existant field Hike',
              difficulty: 2,
              distance: 2,
              blahblah: 'blah'
            }
          ];
          let savedResponse;
          let newHikeErrs;
          let newHikeIds;

          before('make request and save response', async () => {
            savedResponse = await requester.post('/api/hikes')
              .send(incorrectHikes);
              newHikeIds = savedResponse.body.hikeIds;
              newHikeErrs = savedResponse.body.hikeErrs;
          });

          it('should get a failed response', () => {
            console.log(savedResponse.body)
            savedResponse.status.should.equal(400);
            should.not.exist(newHikeIds);
            should.exist(newHikeErrs);
            newHikeErrs.length.should.equal(incorrectHikes.length);
          });

          it('should not change all hikes', async () => {
            const allHikesAddedRes = await requester.get('/api/hikes');
            const allHikesAdded = allHikesAddedRes.body;
            should.exist(allHikesAdded);
            allHikesAdded.length.should.equal(allHikes.length);
            (incorrectHikes.filter(hike => allHikesAdded.includes(hike.name))).length.should.equal(0);
          });
          // describe('nonexistant hike id', () => {

          // });
          // describe('nonexistant fields', () => {

          // });
        });
      });
    });
  });

  describe('#updateHike', () => {
    describe('one hike', () => {
      const newHikeToSave = {
        name: 'Update Me',
        distance: 2,
        difficulty: 2
      };
      let newHike;
      before('create hike to update', async () => {
        const response = await requester.post('/api/hikes').send(newHikeToSave);
        const newHikeId = response.body[0];
        const newHikeRes = await requester.get(`/api/hikes/${newHikeId}`);
        newHike = newHikeRes.body[0];
      });

      after('delete the update hike', async () => {
        await hikesDb.deleteHikeByHikeId(newHikeId);
      });

      describe('one field', () => {
        describe('correctly formatted', () => {
          const updateFields = {
            distance: 11
          };
          let updateRes;
  
          before('update hike and save response', async () => {
            updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
          });

          after('restore original hike data', () => {
            // use hikesdb for this
          });
  
          it('should be successful request', () => {
            should.exist(updateRes);
            updateRes.status.should.equal(201); // double check if this is what I really want
            should.exist(updateRes.body);
            updateRes.body[0].should.equal(newHikeId);
          });

          it('should return new info in new request', async () => {
            const response = await requester.get(`/api/hikes/${newHikeId}`);
            should.exist(response.body);
            const updatedHike = response.body[0];
            updatedHike.distance.should.not.equal(newHike.distance);
            updatedHike.distance.should.equal(updateFields.distance);
          });
        });
        describe('incorrectly formatted', () => {
          describe('non existant field', () => {
            const updateFields = {
              blahblah: 'blah'
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`);
            });

            it('should be a failure response', () => {
              updateRes.status.should.equal(400);
              console.log(updateRes.body); // double checking what I'm getting back
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              should.not.exist(updatedHike.blahblah);
            });

          });
          // does this make sense here?
          describe('incorrect update data', () => {
            const updateFields = {
              distance: 'hello'
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`);
            });

            it('should be a failure response', () => {
              updateRes.status.should.equal(400);
              console.log(updateRes.body); // double checking what I'm getting back
            });

            it('should not see changes in following hike requests', () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              updatedHike.distance.should.not.equal(updateFields.distance);
              updatedHike.distance.should.equal(newHike.distance);
            });
          });
        });
      });
      describe('multiple fields', () => {
        describe('correctly formatted', () => {
          const updateFields = {
            hiked: true,
            difficulty: 3
          };
          let updateRes;
  
          before('update hike and save response', async () => {
            updateRes = await requester.put(`/api/hikes/${newHikeId}`);
          });

          after('restore fields', () => {
            // use hikesdb for this
          });
  
          it('should be successful request', () => {
            should.exist(updateRes);
            updateRes.status.should.equal(201); // double check this is the response i actually want
            should.exist(updateRes.body);
            updateRes.body[0].should.equal(newHikeId);// 
          });
  
          it('should return new info in new request', async () => {
            const response = await requester.get(`/api/hikes/${newHikeId}`);
            should.exist(response.body);
            const updatedHike = response.body[0];
            // double check this makes sense
            (updateFields.keys).forEach(fld => {
              updatedHike[fld].should.not.equal(newHike[fld]);
              updatedHike[fld].should.equal(updateFields[fld]);
            });
          });
        });
        describe('incorrectly formatted', () => {
          describe('one correct field, one non existant field', () => {
            const updateFields = {
              difficulty: 1,
              blahblah: 'blah'
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
            });

            it('should be a failure response', () => {
              should.exist(updateRes);
              updateRes.status.should.equal(400); // again double check
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              (updateFields.keys).forEach(fld => {
                updatedHike[fld].should.equal(newHike[fld]);
                updatedHike[fld].should.not.equal(updateFields[fld]);
              });
            });

          });
          // does this make sense here?
          describe('only non-existant fields', () => {
            const updateFields = {
              doodah: 1,
              blahblah: 'blah'
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
            });

            it('should be a failure response', () => {
              should.exist(updateRes);
              updateRes.status.should.equal(400); // again double check
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              (updateFields.keys).forEach(fld => {
                updatedHike[fld].should.equal(newHike[fld]);
                updatedHike[fld].should.not.equal(updateFields[fld]);
              });
            });

          });
        });
      });
    });

    // for now we'll just be able to update one hike at a time
    describe.skip('multiple hikes', () => {
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

  describe.skip('#deleteHike', () => {
    describe('one hike', () => {
      let hikeToDelete = {
        name: 'Delete Me',

      };
      before('create hike to delete', (done) =>{

      });

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
