'use strict';

// Require Logic
var lib = require('./lib');

// Lambda Handler
module.exports.scores = function(event, context, callback) {
  lib.getScores(event, function(error, result) {
    if (error) {
      console.error(error);
      callback(new Error('Couldn\'t fetch the scores.'));
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
        "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
      },
      body: JSON.stringify(result),
    };

    callback(null, response);
  });
};
