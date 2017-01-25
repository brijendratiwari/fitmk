starter.controller('PastSessionCtrl', function(
  $scope,
  $stateParams,
  $ionicLoading,
  $ionicHistory,
  ApiCall,Api,
  GetUserDetails,
  PastSessionsFactory,MapFactory,AlertFactory
){


  $scope.deviceType = (ionic.Platform.isIOS()?'iOS':(ionic.Platform.isAndroid()?'Android':'Other'));

  angular.forEach(PastSessionsFactory.PastSessionsList,function(pastSession,index){
    if (pastSession.id == $stateParams.pastsessionid) {
      $scope.pastSessionData = pastSession;
      console.log('Past Session Id '+pastSession.id);
      $scope.pastSessionData.map = null;

      if ($scope.pastSessionData.latLngArr.length > 0) {
        var startPoint = $scope.pastSessionData.latLngArr[0];
        var latLng = {lat:startPoint.lat, lng:startPoint.lng};

        var mapOptions = {
          center: latLng,
          zoom: 17,
          panControl:false,
          zoomControl:false,
          draggable:false,
          scrollwheel:false,
          disableDoubleClickZoom:true,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        $scope.pastSessionData.map = MapFactory.initializeMap(document.getElementById("pastSessionMap"),latLng,17);
        var PathStyle = MapFactory.addPolyline($scope.pastSessionData.latLngArr,$scope.pastSessionData.map);
        if(!$scope.pastSessionData.paths) {
          $scope.pastSessionData.paths = [];
        }
        $scope.pastSessionData.paths.push(PathStyle);

        MapFactory.setZoomLevelByArea($scope.pastSessionData.map,$scope.pastSessionData.latLngArr);
      }
    }
  });

  $scope.deleteSession = function(id) {
    var sessionDeleteConfirm = function(confirm) {
      if (confirm) {
        deleteSession(id);
      }
    };
    AlertFactory.showConfirmPromt('Delete Session','Are you sure you want to delete this session?',sessionDeleteConfirm);
  };
  function deleteSession(id) {
    $ionicLoading.show();
    ApiCall.GetCall(Api.method.deleteSession+'/'+GetUserDetails().passhash+'/'+id,undefined,function(response){
      $ionicLoading.hide();
      console.log('Delete Session '+JSON.stringify(response));
      if (response.success) {
        var sessions = response.sessions;
        PastSessionsFactory.setSessions(sessions);
        PastSessionsFactory.DeletedSessionId = $stateParams.pastsessionid;
        $ionicHistory.goBack(-1);
      }
    },function(error){
      $ionicLoading.hide();
    });
  }
});
