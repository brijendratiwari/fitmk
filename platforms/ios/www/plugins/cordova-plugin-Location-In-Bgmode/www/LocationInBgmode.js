cordova.define("cordova-plugin-Location-In-Bgmode.LocationInBgmode", function(require, exports, module) {
var exec = require('cordova/exec');

exports.startLocationUpdate = function(success, error, options) {
    exec(success, error, "LocationInBgmode", "startLocationUpdate", [options]);
};
exports.stopLocationUpdate = function(success, error) {
    exec(success, error, "LocationInBgmode", "stopLocationUpdate", []);
};
exports.getCurrentLocation = function(success, error, options) {
    exec(success, error, "LocationInBgmode", "getCurrentLocation", []);
};

});
