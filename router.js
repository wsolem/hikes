'use strict';

/* 
determines which page to load based on url
*/

function route (req, res, handle, pathname) {
  console.log('hello')
  if (typeof handle[pathname] === 'function') {
    // add loggind for request handler here
    handle[pathname](req, res); // let me look into doing something a little bit nicer
    // should i use returns???
  } else {
    // TODO: add in a logger instead of console.log
    console.log(`No path for ${pathname}`);
    // TODO: include a 404 page
  }
}

exports.route = route;