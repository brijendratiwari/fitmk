# LocationInBgmode

## Background Location Plugin for iOS and android

#### cordova.plugins.LocationInBgmode

### startLocationUpdate

```
var successCallBack = function(response){
  // response Json Object {'lat':32.00254, 'lng':45.2350}
};
var errorCallback = function(error) {
  // do something
};
var options = {
  'accuracy':20,
  'filter':5,
  'allowBackgroundUpdates':true
};
cordova.plugins.LocationInBgmode.startLocationUpdate(successCallBack,errorCallback,options);

```
### stopLocationUpdate
```
var successCallBack = function(response){
  // {'success':true}
};
var errorCallback = function(error) {
  // do something
};
cordova.plugins.LocationInBgmode.stopLocationUpdate(successCallBack,errorCallback);

```
