function GoogleFit() {
}
var exec = require('cordova/exec');

GoogleFit.prototype.getStuff1 = function (startTime, endTime, datatypes, height, weight, successCallback, failureCallback) {
  exec(successCallback,
    failureCallback,
    "GoogleFit",
    "getStuff1",
    [{
      "startTime" : startTime,
      "endTime" : endTime,
      "datatypes": datatypes,
      "height": height,
      "weight": weight
    }]);
  };


  GoogleFit.prototype.getStuff2 = function (startTime, endTime, datatypes, dataaggregations, durationBucket, timeUnitBucket, typeBucket, height, weight, successCallback, failureCallback) {
    exec(successCallback,
      failureCallback,
      "GoogleFit",
      "getStuff2",
      [{
        "startTime" : startTime,
        "endTime" : endTime,
        "datatypes": datatypes,
        "dataaggregations": dataaggregations,
        "durationBucket": durationBucket,
        "timeUnitBucket": timeUnitBucket,
        "typeBucket": typeBucket,
        "height": height,
        "weight": weight
      }]);
    };

    GoogleFit.prototype.startActivityDataLiveUpdate = function(successCallback, failureCallback, options) {
      exec(successCallback, failureCallback, "GoogleFit", "startActivityDataLiveUpdate", [options]);
    };

    GoogleFit.prototype.stopActivityDataLiveUpdate = function(successCallback, failureCallback, options) {
      exec(successCallback, failureCallback, "GoogleFit", "startActivityDataLiveUpdate", [options]);
    };

    GoogleFit.prototype.startActivityDataRecording = function(successCallback, failureCallback, options) {
      exec(successCallback, failureCallback, "GoogleFit", "startActivityDataRecording", [options]);
    };

    GoogleFit.prototype.stopActivityDataRecording = function(successCallback, failureCallback, options) {
      exec(successCallback, failureCallback, "GoogleFit", "stopActivityDataRecording", [options]);
    };

    GoogleFit.install = function () {
      if (!window.plugins) {
        window.plugins = {};
      }

      window.plugins.googlefit = new GoogleFit();
      return window.plugins.googlefit;
    };

    cordova.addConstructor(GoogleFit.install);
