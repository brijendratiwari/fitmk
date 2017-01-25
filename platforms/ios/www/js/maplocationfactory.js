var bgPosUpdateInterval = null;
var bgGeo = null;

starter.factory('MapFactory',function(){
  return {
    initializeMap:function(map,centerPointLatLng,zoom) {
      var centerPoint = null;
      if (centerPointLatLng) {
        centerPoint = new google.maps.LatLng(centerPointLatLng.lat, centerPointLatLng.lng);
      }
      var mapOptions = {
        center: centerPoint,
        zoom: zoom,
        panControl:false,
        zoomControl:false,
        draggable:false,
        scrollwheel:false,
        disableDoubleClickZoom:true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return new google.maps.Map(map, mapOptions);
    },
    initializeMapWithUserIneraction:function(map,centerPointLatLng,zoom) {
      var centerPoint = null;
      if (centerPointLatLng) {
        centerPoint = new google.maps.LatLng(centerPointLatLng.lat, centerPointLatLng.lng);
      }
      var mapOptions = {
        center: centerPoint,
        zoom: zoom,
        panControl:true,
        zoomControl:false,
        draggable:true,
        scrollwheel:true,
        disableDoubleClickZoom:false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      return new google.maps.Map(map, mapOptions);
    },

    setMapCenter:function(map,center) {
      var centerLatLng = new google.maps.LatLng(center.lat,center.lng);
      map.setCenter(centerLatLng);
    },
    setZoomLevelByArea:function (map,latlngArr){
      var bounds = new google.maps.LatLngBounds();
      angular.forEach(latlngArr,function(latlng,index){
        bounds.extend(new google.maps.LatLng (latlng.lat,latlng.lng));
      });
      map.setCenter(bounds.getCenter()); //or use custom center
      map.fitBounds(bounds);
      map.setZoom(map.getZoom());
      if(map.getZoom()> 16){
        map.setZoom(16);
      }
    },
    addPolyline:function (coordinates,map) {
      var PathStyle = new google.maps.Polyline({
        path: coordinates,
        strokeColor: "#0B5EA7",
        strokeOpacity: 1.0,
        strokeWeight: 2,
        map: map
      });
      return PathStyle;
    },
    addMarker(title, myLatLng, map) {
      var marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: title
        });
      return marker;
    },
    resetMapPolyline:function (paths) {
      if (paths) {
        angular.forEach(paths,function(PathStyle,index){
          PathStyle.setMap(null);
        });
      }
    }
  };
})

.factory('LocationFactory',function($cordovaGeolocation,AlertFactory){
  return {
    getCurrentLocation:function(successCallBack,errorCallback) {
      if (cordova.plugins.LocationInBgmode) {
        cordova.plugins.LocationInBgmode.getCurrentLocation(
          function(location){
            console.log('Current Position '+JSON.stringify(location));
            if (successCallBack) {
              if (parseFloat(location.lat) != 0 || parseFloat(location.lng) != 0.0) {
                successCallBack(location);
              }
            }
          },
          function(error){
            console.error(error);
            if (errorCallback) {
              errorCallback("Get Current Location Error");
            }
          }
        );
      }
    },
    startBgLocationChangeUpdate:function(successCallBack, errorCallback) { //  only
      if (cordova.plugins.LocationInBgmode) {
        cordova.plugins.LocationInBgmode.startLocationUpdate(
          function(location){
            console.log('Current Position '+JSON.stringify(location));
            if (successCallBack) {
              if (parseFloat(location.lat) != 0 || parseFloat(location.lng) != 0.0) {
                successCallBack(location);
              }
            }
          }, function(error){
            if (errorCallback) {
              errorCallback(error);
            }
            console.error(error);
          },
          {
            'accuracy':0,
            'filter':10,
            'allowBackgroundUpdates':true
          }
        );
      }
    },
    stopBgLocationChangeUpdate:function(){
      if (cordova.plugins.LocationInBgmode) {
        cordova.plugins.LocationInBgmode.stopLocationUpdate(function(response){
          console.log('LocationInBgmode Stopped'+JSON.stringify(response));
        });
      }
    }
  };
});
