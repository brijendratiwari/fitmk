
starter.controller('UpdatestatsCtrl', function(
  $scope,
  $ionicHistory,
  $ionicViewSwitcher,
  $stateParams,
  $ionicLoading,
  ApiCall,
  Api,
  GetUserDetails,
  AlertFactory,
  DataFormaterFactory,
  ionicTimePicker
) {

  $scope.lastUpdated = "";

  $scope.statsList = {
    Height:0,
    Weight:0,
    Chest:0,
    Waist:0,
    Thighs:0,
    Arms:0,
    BurpeesPerMinute:0,
    Timeper100m:'00:00',
    Timeper5km:'00:00',
    Timeper10km:'00:00'
  };

  var getMeasurements = function() {
    $ionicLoading.show();
    ApiCall.PostCall(Api.method.getMeasurements,
      undefined,
      function(response){
      $ionicLoading.hide();
      console.log('Get Measurements '+JSON.stringify(response));
      if (response.success) {
        var measurements = response.measurements;

        var distance100m = DataFormaterFactory.secondsToHourMinSeondsStr(measurements['distance100m']);
        var distance5km = DataFormaterFactory.secondsToHourMinSeondsStr(measurements['distance5km']);
        var distance10km = DataFormaterFactory.secondsToHourMinSeondsStr(measurements['distance10km']);

        $scope.statsList = {
          Height:parseFloat(measurements['heightm'])*100,
          Weight:parseFloat(measurements['weightkg']),
          Chest:parseFloat(measurements['chest']),
          Waist:parseFloat(measurements['waist']),
          Thighs:parseFloat(measurements['thighs']),
          Arms:parseFloat(measurements['arms']),
          BurpeesPerMinute:parseInt(measurements['burpees_per_min']),
          Timeper100m:distance100m,
          Timeper5km:distance5km,
          Timeper10km:distance100m
        };

        $scope.lastUpdated = measurements['dateadded'];
      }
    },
    function(error) {
      $ionicLoading.hide();
      AlertFactory.showError(JSON.stringify(error));
    }
  );
  };
  var updateMeasurements = function() {
    $ionicLoading.show();
    ApiCall.PostCall(Api.method.insertMeasurements,
    {
      'heightm':parseFloat(($scope.statsList.Height)/100),
      'heightft':parseFloat(($scope.statsList.Height)/30.48),
      'weightkg':parseFloat($scope.statsList.Weight),
      'weightlb':parseFloat(($scope.statsList.Weight)*2.20462),
      'chest':parseFloat($scope.statsList.Chest),
      'waist':parseFloat($scope.statsList.Waist),
      'thighs':parseFloat($scope.statsList.Thighs),
      'arms':parseFloat($scope.statsList.Arms),
      'burpees_per_min':parseInt($scope.statsList.BurpeesPerMinute),
      'distance100m':DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper100m),
      'distance5km':DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper5km),
      'distance10km':DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper10km)
    },
    function(response){
      $ionicLoading.hide();
      console.log('insertMeasurements '+JSON.stringify(response));
      if (response.success) {
        AlertFactory.showSuccess(response.message);
        $ionicHistory.goBack(-1);
      } else {
        AlertFactory.showResponseError(response,"Measurements data not inserted.");
      }
    },
    function(error) {
      $ionicLoading.hide();
      AlertFactory.showError(JSON.stringify(error));
    }
  );
};

getMeasurements();
$scope.updateStats = function() {
  updateMeasurements();
};


$scope.timePer100mPopupShow = function() {
  var ipObj1 = {
    callback: function (val) {      //Mandatory
      $scope.statsList.Timeper100m = DataFormaterFactory.secondsToHourMinSeondsStr(val/60);
      console.log('Call Back '+$scope.statsList.Timeper100m);

    },
    inputTime: DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper100m)*60,   //Optional
    format: 24,         //Optional
    step: 1,           //Optional
    setLabel: 'Set'    //Optional
  };
  ionicTimePicker.openTimePicker(ipObj1);
};
$scope.timePer5kmPopupShow = function() {
  var ipObj2 = {
    callback: function (val) {      //Mandatory
      $scope.statsList.Timeper5km = DataFormaterFactory.secondsToHourMinSeondsStr(val/60);
      console.log('Call Back '+$scope.statsList.Timeper5km);
    },
    inputTime: DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper5km) * 60,   //Optional
    format: 24,         //Optional
    step: 1,           //Optional
    setLabel: 'Set'    //Optional
  };
  ionicTimePicker.openTimePicker(ipObj2);
};
$scope.timePer10kmPopupShow = function() {
  var ipObj3 = {
    callback: function (val) {      //Mandatory
      $scope.statsList.Timeper10km = DataFormaterFactory.secondsToHourMinSeondsStr(val/60);
      console.log('Call Back '+$scope.statsList.Timeper10km);
    },
    inputTime: DataFormaterFactory.hourMinSecondsStrToSeconds($scope.statsList.Timeper10km) * 60,   //Optional
    format: 24,         //Optional
    step: 1,           //Optional
    setLabel: 'Set'    //Optional
  };
  ionicTimePicker.openTimePicker(ipObj3);
};
});
