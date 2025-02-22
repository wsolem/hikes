// I'm sure I can come up with something prettier here
const compareArrays = (arr1, arr2) => {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
};

const isUser = (userObject, userStyle) => {
  const keys = (Object.keys(userObject)).sort();
  const expectedKeys = userStyle === 'allUsers'
    ? ['firstname', 'lastname', 'userid', 'username'].sort()
    : ['email', 'firstname', 'lastname', 'userid', 'username', 'usertype'].sort();
  return (keys.length === expectedKeys.length) && compareArrays(keys, expectedKeys);
};

// create a match function that can be reused
const usersMatch = (userA, userB) => {
  const keys = (Object.keys(userA)).sort();
  let key;
  let userAField;
  let userBField;
  for (let itr = 0; itr < keys.length; itr++) {
    key = keys[itr];
    userAField = userA[key];
    userBField = userB[key];
    if (userAField !== userBField) {
      return false;
    }
  }
  return true;
};

const isHike = (hikeObject, hikeStyle) => {
  const keys = (Object.keys(hikeObject)).sort();
  // lazy, put it in order that it is in tabe and sorting
  const expectedKeys = hikeStyle === 'allhikes'
    ? ['name', 'distance', 'difficulty', 'hikeid'].sort()
    : ['name', 'distance', 'hiked', 'date', 'description', 'difficulty', 'hikeid', 'regions', 'parks', 'trailheads', 'tags'].sort();

  return (keys.length === expectedKeys.length) && compareArrays(keys, expectedKeys);
};

// um i can definitly pretty this mess up
const hasHiddenFields = (hikeObject, hiddenHikeFields) => {
  const keys = (Object.getOwnPropertyNames(hikeObject)).sort();

  for (let kitr = 0; kitr < keys.length; kitr++) {
    for (let hitr = 0; hitr < keys.length; hitr++) {
      if (keys[kitr] === hiddenHikeFields[hitr]) {
        return true;
      }
    }
  }
  return false;
};

// update to be more general
const hikesMatch = (hikeA, hikeB) => {
  const keys = (Object.keys(hikeA)).sort();
  let key;
  let hikeAField;
  let hikeBField;
  for (let itr = 0; itr < keys.length; itr++) {
    key = keys[itr];
    hikeAField = hikeA[key];
    hikeBField = hikeB[key];
    if (key === 'difficulty' || key === 'distance') {
      hikeBField = Number(hikeBField);
      hikeAField = Number(hikeAField);
    }
    if (Array.isArray(hikeAField) && Array.isArray(hikeBField)) {
      if (!compareArrays(hikeAField, hikeBField)) {
        return false;
      }
    } else if (hikeAField !== hikeBField) {
      return false;
    }
  }
  return true;
};

module.exports = {
  compareArrays,
  isHike,
  hasHiddenFields,
  hikesMatch,
  isUser,
  usersMatch,
};
