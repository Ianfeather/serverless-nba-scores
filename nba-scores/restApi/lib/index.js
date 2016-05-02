const request = require('request');
var doc = require('dynamodb-doc');
var dynamodb = new doc.DynamoDB();
const BEARER = process.env.BEARER_TOKEN;

console.log("bearer", BEARER)

const stage = process.env.SERVERLESS_STAGE;

const tableName = 'nba-scores-' + stage;

module.exports.getScores = function(event, cb) {

  var dateUrl = 'https://erikberg.com/events.json?date=' + event.date + '&sport=nba';

  var opts = {
        auth: {
          bearer: BEARER
        },
        headers: {
          'User-Agent': 'ianfeather'
        }
      },
      response;


  var getParams = {
    AttributesToGet: [
      "games"
    ],
    TableName : tableName,
    Key : {
      "date" : event.date
    }
  };

  console.log(getParams)
  dynamodb.getItem(getParams, function(err, data) {
    if (err) {
      // Something has gone wrong with dynamo
      console.log('ERROR: Dynamo failed: ' + err);
      return cb(null, { error: error })
    }

    if (data.Item) {
      // We have games already stored in the db
      console.log("SUCCESS: Retrieved data from db", data);
      return cb(null, { games: data.Item.games, fromCache: true });
    }

    // If not cached, fetch from api
    request.get(dateUrl, opts, function (error, response, body) {

      if (error || response.statusCode !== 200) {
        // Something has gone wrong with the api
        // TODO: Handle rate limiting
        console.log('ERROR: API error: ' + err);
        return cb(null, { error: error });
      }

      var result = JSON.parse(body);

      var games = result.event.map(function(game) {
        var diff = game.home_points_scored - game.away_points_scored;

        return {
          home: {
            name: game.home_team.abbreviation,
            score: game.home_points_scored
          },
          away: {
            name: game.away_team.abbreviation,
            score: game.away_points_scored
          },
          close: diff < 10 && diff > -10
        }
      });

      // If any of the scores are -1 it means the game is still ongoing
      // Avoid caching it if that's the case

      var ongoingGames = games.filter(function(game) {
        return game.home.score === -1
      });

      if (ongoingGames.length > 0) {
        return cb(null, { games: games, fromCache: false });
      }

      // Cache the result so that we don't incur rate limiting issues with the api

      var dynamoData = {
          TableName: tableName,
          Item: {
            games: games,
            date: event.date
          }
      };

      dynamodb.putItem(dynamoData, function(err, data) {
          if (err) {
              console.log('ERROR: Dynamo failed: ' + err);
              return cb(null, { error: error })
          } else {
              console.log('Dynamo Success: ' + JSON.stringify(data, null, '  '));
              // TODO: Set in headers
              return cb(null, { games: games, fromCache: false });
          }
      });
    });
  });
};
