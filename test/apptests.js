process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const helperFs = require('./helperFunctions');
const hikesDb = require('../src/db/hikes');
const usersDb = require('../src/db/users');

const should = chai.should();
chai.use(chaiHttp);
const requester = chai.request(server).keepOpen();

// Hikes Tests
describe('Hikes', () => {
  after('close requester', () => requester.close());

  describe('#getHikes', () => {
    it('should return all hikes', (done) => {
      requester.get('/api/hikes')
        .end((err, res) => {
          should.not.exist(err);
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          // todo: don't want to hard code length
          // at some point will want to create hikes here instead of seeding
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
          [oneHike] = res.body;
          done();
        });
    });

    describe('correct id', () => {
      it('should get one hike', (done) => {
        const { hikeid } = oneHike;

        requester.get(`/api/hikes/${hikeid}`)
          .end((err, res) => {
            should.not.exist(err);
            res.should.have.status(200);
            should.exist(res.body);
            res.body.length.should.equal(1);
            [oneHike] = res.body;
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
                [hikeId] = saveResponse.body.hikeIds;
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
            missingFieldResult.error.text.should.equal(`'${hikeMissingField.name}' creation failed`);
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
            hikeid: '123lkj',
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
            blahblah: 'blahblah',
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
              distance: 2,
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
              blahblah: 'blah',
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
              blahblah: 'blah',
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
          describe.skip('nonexistant hike id', () => {});
        });
      });
    });
  });

  describe('#updateHike', () => {
    describe('one hike', () => {
      const newHikeToSave = {
        name: 'Update Me',
        distance: 2,
        difficulty: 2,
      };
      let newHike;
      let newHikeId;

      before('create hike to update', async () => {
        const response = await requester.post('/api/hikes').send(newHikeToSave);
        newHikeId = response.body.hikeIds[0];
        const newHikeRes = await requester.get(`/api/hikes/${newHikeId}`);
        newHike = newHikeRes.body[0];
      });

      after('delete the update hike', async () => {
        await hikesDb.deleteHikeByHikeId(newHikeId);
      });

      describe('one field', () => {
        describe('correctly formatted', () => {
          const updateFields = {
            distance: 11,
          };
          let updateRes;
  
          before('update hike and save response', async () => {
            updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
          });

          after('restore original hike data', () => {
            return hikesDb.updateHike(newHikeId, { distance: newHike.distance });
          });
  
          it('should be successful request', () => {
            should.exist(updateRes);
            updateRes.status.should.equal(201);
            should.exist(updateRes.body);
            should.exist(updateRes.body.hikeId)
            updateRes.body.hikeId.should.equal(newHikeId);
          });

          it('should return new info in new request', async () => {
            const response = await requester.get(`/api/hikes/${newHikeId}`);
            should.exist(response.body);
            const updatedHike = response.body[0];
            updatedHike.distance.should.not.equal(newHike.distance);
            Number(updatedHike.distance).should.equal(updateFields.distance);
          });
        });

        describe('incorrectly formatted', () => {
          describe('non existant field', () => {
            const updateFields = {
              blahblah: 'blah',
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
            });

            it('should be a failure response', () => {
              updateRes.status.should.equal(400);
              should.exist(updateRes.text);
              updateRes.text.should.equal('Invalid fields');
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              should.not.exist(updatedHike.blahblah);
            });
          });

          describe('incorrect update data', () => {
            const updateFields = {
              distance: 'hello',
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`);
            });

            it('should be a failure response', () => {
              updateRes.status.should.equal(400);
            });

            it('should not see changes in following hike requests', async () => {
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
            difficulty: 3,
          };
          let updateRes;
  
          before('update hike and save response', async () => {
            updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
          });

          after('restore fields', () => {
            return hikesDb.updateHike(newHikeId, { hiked: newHike.hiked, difficulty: newHike.difficulty });
          });
  
          it('should be successful request', () => {
            should.exist(updateRes.body);
            updateRes.status.should.equal(201);
            should.exist(updateRes.body.hikeId);
            updateRes.body.hikeId.should.equal(newHikeId);
          });
  
          it('should return new info in new request', async () => {
            const response = await requester.get(`/api/hikes/${newHikeId}`);
            should.exist(response.body);
            const updatedHike = response.body[0];
            (Object.keys(updateFields)).forEach(fld => {
              updatedHike[fld].should.not.equal(newHike[fld]);
              updatedHike[fld].should.equal(updateFields[fld]);
            });
          });
        });

        describe('incorrectly formatted', () => {
          describe('one correct field, one non existant field', () => {
            const updateFields = {
              difficulty: 1,
              blahblah: 'blah',
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
            });

            it('should be a failure response', () => {
              should.exist(updateRes);
              updateRes.status.should.equal(400);
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              (Object.keys(updateFields)).forEach(fld => {
                updateFields[fld].should.not.equal(updatedHike[fld]);
                const fieldsMatch = updatedHike[fld] === newHike[fld];
                fieldsMatch.should.equal(true);
              });
            });
          });

          describe('only non-existant fields', () => {
            const updateFields = {
              doodah: 1,
              blahblah: 'blah',
            };
            let updateRes;

            before('try to update hike and save response', async () => {
              updateRes = await requester.put(`/api/hikes/${newHikeId}`).send(updateFields);
            });

            it('should be a failure response', () => {
              should.exist(updateRes);
              updateRes.status.should.equal(400);
            });

            it('should not see changes in following hike requests', async () => {
              const response = await requester.get(`/api/hikes/${newHikeId}`);
              const updatedHike = response.body[0];
              (Object.keys(updateFields)).forEach(fld => {
                const fieldsMatch = updatedHike[fld] === newHike[fld];
                fieldsMatch.should.equal(true);
                updateFields[fld].should.not.equal(updatedHike[fld]);
              });
            });
          });
        });
      });
    });

    // for now we'll just be able to update one hike at a time
    describe.skip('multiple hikes', () => {
      describe('correctly formatted', () => {});
      describe('incorrectly formatted', () => {
        // I'm thinking save what's correct, return hike info if incorrect
        describe('only one incorrect hike', () => {});
        describe('all incorrectly formatted', () => {
          describe('nonexistant hike id', () => {});
          describe('not-updateable fields', () => {});
        });
      });
    });
  });

  describe('#deleteHike', () => {
    describe('one hike', () => {
      // todo: there are some strange issues with running these tests twice
      // and i need to make sure that it both correctly deletes
      // and correctly re-creates 
      // maybe just renaming variables
      describe('correctly formatted', () => {
        let delResp;
        let hikeToDelete = {
          name: 'Delete Me',
          difficulty: 3,
          distance: 12
        };
        let newHikeId;
        let allHikesWithHikeToDel;

        before('create hike to delete then get new hike to compare', async () => {
          const newHikeIdRes = await requester.post('/api/hikes').send(hikeToDelete);
          newHikeId = newHikeIdRes.body.hikeIds[0];
          const newHikeRes = await requester.get(`/api/hikes/${newHikeId}`);
          newHike = newHikeRes.body;
        });
  
        before('get all hikes for comparison', async () => {
          const allHikesRes = await requester.get('/api/hikes');
          allHikesWithHikeToDel = allHikesRes.body;
        });

        before('delete hike and save response', async () => {
          delResp = await requester.delete(`/api/hikes/${newHikeId}`);
        });

        it('should be a successful response', () => {
          should.exist(delResp);
          should.exist(delResp.status);
          delResp.status.should.equal(200);
        });

        it('should get deleted hike in response', () => {
          should.exist(delResp.body);
          delResp.body.should.be.a('array');
          delResp.body.length.should.equal(1);
          delResp.body[0].should.equal(newHikeId);
        });

        it('should not be able to get deleted hike directly', async () => {
          const deletedHikeRes = await requester.get(`/api/hikes/${newHikeId}`);
          should.exist(deletedHikeRes);
          deletedHikeRes.status.should.equal(404);
        });

        it('should not be in list of all hikes', async () => {
          const allHikesAfterDelRes = await requester.get('/api/hikes');
          (allHikesWithHikeToDel.length).should.not.equal(allHikesAfterDelRes.body.length);
          (allHikesWithHikeToDel.length).should.equal(allHikesAfterDelRes.body.length + 1);
          let hasHike = allHikesAfterDelRes.body.filter(hike => hike.hikeid === newHikeId);
          hasHike.length.should.equal(0);
        });
      });

      describe('incorrectly formatted', () => {
        let hikeToDelete = {
          name: 'Try to Delete Me',
          difficulty: 3,
          distance: 12
        };
        let newHike;
        let newHikeId;
        let allHikesWithHikeToDel;

        before('create hike to delete then get new hike to compare', async () => {
          const newHikeIdRes = await requester.post('/api/hikes').send(hikeToDelete);
          newHikeId = newHikeIdRes.body.hikeIds[0];
          const newHikeRes = await requester.get(`/api/hikes/${newHikeId}`);
          newHike = newHikeRes.body;
        });
  
        before('get all hikes for comparison', async () => {
          const allHikesRes = await requester.get('/api/hikes');
          allHikesWithHikeToDel = allHikesRes.body;
        });

        after('delete extra hike', async () => {
          await hikesDb.deleteHikeByHikeId(newHikeId);
        });

        describe('with non-existant hike id', () => {
          const nonExHikeId = 'zyzzx';
          let delHikeRes;
          
          before('try to delete hike and save response', async () => {
            delHikeRes = await requester.delete(`/api/hikes/${nonExHikeId}`);
          });
          
          it('should not get a successful response', () => {
            should.exist(delHikeRes);
            delHikeRes.status.should.equal(404);
          });

          it('should not change list of all hikes', async () => {
            const allHikesAfterDelRes = await requester.get('/api/hikes');
            allHikesWithHikeToDel.length.should.equal(allHikesAfterDelRes.body.length);
          });
        });

        describe.skip('with extra data sent', () => {
          // this is a placeholder - at some point will want to change the delete function to delete by sending it in the body
        });
      });
    });
    // todo: future functionality
    describe.skip('multiple hikes', () => {
      describe('correctly formatted', () => {

      });
      describe('incorrectly formatted', () => {
        describe('one non-existant id out of multiple', () => {

        });
        describe('all non-existant ids', () => {

        });
      });
    });
  });
});

// users tests
describe('Users', () => {
  after('close requester', () => requester.close());

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
        userByIdRes.body.should.exist;
        userByIdRes.body.length.should.equal(1);
      });

      it('should be a matching user', () => {
        userById.should.exist;
        userById.firstname.should.exist;
        userById.firstname.should.equal(userFromAll.firstname);
        userById.lastname.should.exist;
        userById.lastname.should.equal(userFromAll.lastname);
        userById.userid.should.exist;
        userById.userid.should.equal(userFromAll.userid);
        userById.username.should.exist;
        userById.username.should.equal(userFromAll.username);
      });      
    });

    describe('non-existant id', () => {
      const fakeId = 'fakeid';
      let fakeIdRes;
      
      before('try to get user and save response', async () => {
        fakeIdRes = await requester.get(`/api/users/${fakeIdRes}`);
      });

      it('should not be a successful response', () => {
        fakeIdRes.should.exist;
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

      before('create user and save result', async () => {
        createdUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      after('delete new user', async () => {
        await usersDb.deleteUser(createdUserRes.body.userid);
      });

      it('should be successful', () => {
        createdUserRes.should.exist;
        createdUserRes.status.should.equal(201);
        createdUserRes.body.should.exist;
        createdUserRes.body.userid.should.exist;
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
        createUserRes.should.exist;
        createUserRes.status.should.equal(400);
        createUserRes.text.should.exist;
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
        createUserRes.should.exist;
        createUserRes.status.should.equal(400);
        createUserRes.text.should.exist;
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
        createUserRes.should.exist;
        createUserRes.status.should.equal(400);
        createUserRes.text.should.exist;
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
        usertype: ''
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        createUserRes.should.exist;
        createUserRes.status.should.equal(400);
        createUserRes.text.should.exist;
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
        usertype: 'paid'
      };
      let createUserRes;

      before('try to create user and save response', async () => {
        createUserRes = await requester.post('/api/users').send(newUserSetup);
      });

      it('should be an failure response', () => {
        createUserRes.should.exist;
        createUserRes.status.should.equal(400);
        createUserRes.text.should.exist;
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

  describe('#deleteUser', () => {

  });

  describe('#updateUser', () => {

  });

});
