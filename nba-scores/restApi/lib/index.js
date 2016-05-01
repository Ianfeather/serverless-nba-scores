module.exports.getScores = function(event, cb) {
  console.log("event", JSON.stringify(event, null, 2));

  var response = {
    date: event.date
  };

  return cb(null, response);
};
