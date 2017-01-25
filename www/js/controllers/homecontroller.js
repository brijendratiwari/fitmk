starter.controller('HomeCtrl', function(
  $scope,
  $rootScope,
  $ionicScrollDelegate,
  $ionicPlatform,
  $ionicLoading,
  $cordovaGeolocation,
  Api,
  $cordovaCalendar,
  AlertFactory,
  ApiCall,
  SessionManager,DateFormat,
  HealthKitDataFactory,GoogleFitDataFactory,DataFormaterFactory,MapFactory,LocationFactory,PastSessionsFactory,DailyCountFactory,
  GetUserDetails, GetMeasurementDetails, SetMeasurementDetails,
  SharedData
  ) {

  function apply(){
    if(!$scope.$$phase) {
      $scope.$apply();
    }
  }

  // setTimeout(function(){
  //   $rootScope.$broadcast('OnNotification', {'type':'session','id':65250});
  // }, 3000);

  var allDatasActivityId = [1,2,3,4];
  $scope.session_active = false;

  $scope.toggleLastSession = function() {
    $scope.session_active = !$scope.session_active;
    $ionicScrollDelegate.resize();
    if ($scope.session_active) {
      var elementHeight = document.querySelector(".activity-list .item-stable").offsetHeight;
      scrollToPos = elementHeight;
      $ionicScrollDelegate.scrollTo(0, scrollToPos, true);
    }
    apply();
  };

  var dateParts = (new Date() + "").split(" ");
  $scope.currentsess = null;

  $scope.user_sessions =  [];

  $scope.mysessions = false;

  $scope.toggleMySession = function() {
    $scope.mysessions = !$scope.mysessions;
    $ionicScrollDelegate.resize();
    // if ($scope.mysessions) {
    //   var elementHeight = document.querySelector(".activity-list .item-stable").offsetHeight;
    //   scrollToPos = elementHeight;// * (parseInt(activity.id)-1);
    //   $ionicScrollDelegate.scrollTo(0, scrollToPos, true);
    // }
    apply();
  };

  $scope.isForeground = true;

  $scope.deviceReady = false;

  ionic.Platform.ready(function() {
    $scope.deviceReady = true;
    var stopMultipleCall = false;

    if (ionic.Platform.isAndroid()) {
      GoogleFitDataFactory.startActivityDataRecording(
        function(success){
          $ionicLoading.show();
          if (!stopMultipleCall) {
            stopMultipleCall = true;

            getWorkoutDataFromPlugin($scope.activitylist, function(success){
              stopMultipleCall = false;

              $ionicLoading.hide();
            });
            console.log('startActivityDataRecording'+success);
          }
          
        },
        function (error) {
          console.log('startActivityDataRecording'+error);
        }
        );
    }
  });

  $ionicPlatform.on('resume', function(){

    getWorkoutDataFromPlugin($scope.activitylist);
    $scope.isForeground = true;
  });

  $ionicPlatform.on('pause', function(){
    $scope.isForeground = false;
  });

  $scope.$on('$ionicView.afterEnter', function(){

    var deviceReadyCheckTimer = setInterval(function(){
     if ($scope.deviceReady) {
       clearInterval(deviceReadyCheckTimer);
       deviceReadyCheckTimer = null;

       $ionicLoading.show();
       getWorkoutDataFromPlugin($scope.activitylist, function(success){
        $ionicLoading.hide();
      });
       $ionicScrollDelegate.resize();

       $scope.activitylist[0].target = parseFloat(GetUserDetails().target_steps);
       $scope.activitylist[1].target = parseFloat(DataFormaterFactory.convertCalToKcal(GetUserDetails().target_cals));
       $scope.activitylist[2].target = parseFloat(GetUserDetails().target_kms);
       if ($scope.activitylist[3]) {
         $scope.activitylist[3].target = parseFloat(GetUserDetails().target_flights);
       }

       if (PastSessionsFactory.sessions) {
         setSessionsResponse(PastSessionsFactory.sessions);
       }
     }
   },100);
  });

  var sessionDataforCalender;
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function getBookedSessions() {
   $ionicLoading.show();
   ApiCall.PostCall(Api.method.getBookedSessions,
    undefined,
    function(response){
      $ionicLoading.hide();


      if (response.success) {
        if (response.sessions.length > 0) {
          var sess = arrangeSess(response.sessions);
          $scope.currentsess = sess[0];
          var dateParts = $scope.currentsess.SessionDate.split('-');

          $scope.currentsess.SessionDate = dateParts[2] + " " + months[parseInt(dateParts[1]) - 1] + " " + dateParts[0]
          $scope.user_sessions = sess.splice(1);
        } else {
          $scope.currentsess = null;
          $scope.user_sessions = [];
        }
      } else {
        $scope.currentsess = null;
        $scope.user_sessions = [];
      }
    },
    function(error){

    });
 }

 function arrangeSess(arrsessions) {
  var sessions = [];
  arrsessions.forEach(function(sess, idx){

    sessions.push(sess);
    if ((sessions.length - 1) != 0) {
      var pos = (sessions.length - 1);
      var myDt = new Date(sess.SessionDate + 'T' + sess.SessionStartTime);
      var compArr = sessions.slice();
      compArr.forEach(function(sess_in, inner_idx){
        if (typeof sess_in != "undefined"){
          var compdate = new Date(sess_in.SessionDate + 'T' + sess_in.SessionStartTime);
          if (myDt.getTime() < compdate.getTime()) {
            var tmp = sessions[inner_idx];
            sessions[inner_idx] = sessions[pos];
            sessions[pos] = tmp;
          }
        }
      })
    }
  });
  return sessions;
}



function getMeasurements() {
  $ionicLoading.show();
  ApiCall.PostCall(Api.method.getMeasurements ,undefined,
    function(response){
      $ionicLoading.hide();
      console.log('Get Measurements '+JSON.stringify(response));
      if (response.success) {
        var measurements = response.measurements;
        if (measurements) {
          SetMeasurementDetails(measurements);
        }
      }
      getSessions();
    },
    function(error){
      getSessions();
    });
}
getMeasurements();

var isDailyCountAddingInProgress = false;

function addDailyCount() {
  var addedDateStr = DateFormat.dateToStrType2WithTimeZero(DailyCountFactory.GetAddedDate());
  var todayDateStr = DateFormat.dateToStrType2WithTimeZero(new Date());
  if (addedDateStr != todayDateStr && GetUserDetails().passhash) {

    var yesterday = DateFormat.dateByAddingDayInCurrentDate(-1);
    var steps,calories,km,target;

    if (ionic.Platform.isIOS()) {
      var startDate = yesterday;
      var endDate = yesterday;
      var aggregation = 'day';

      HealthKitDataFactory.getSteps(startDate,endDate,aggregation,function(data){
        steps = HealthKitDataFactory.dataManager.getTotalQuantity(data);
        console.log('Daily Count Total Steps'+ steps);
        addDailyCountToApi(steps,calories,km,target,yesterday,new Date());
      });
      HealthKitDataFactory.getCalories(startDate,endDate,aggregation,function(data){
        var kcalories = HealthKitDataFactory.dataManager.getTotalQuantity(data);
        calories = kcalories*1000;
        console.log('Daily Count Total calories'+ calories);
        addDailyCountToApi(steps,calories,km,target,yesterday,new Date());
      });
      HealthKitDataFactory.getWalkRun(startDate,endDate,aggregation,function(data){
        km = HealthKitDataFactory.dataManager.getTotalQuantity(data);
        console.log('Daily Count Total km'+ km);
        addDailyCountToApi(steps,calories,km,target,yesterday,new Date());
      });
      HealthKitDataFactory.getFloors(startDate,endDate,aggregation,function(data){
        target = HealthKitDataFactory.dataManager.getTotalQuantity(data);
        console.log('Daily Count Total target'+ target);
        addDailyCountToApi(steps,calories,km,target,yesterday,new Date());
      });
    } else if (ionic.Platform.isAndroid()) {
      var startTime = DateFormat.dateByAddingDayInCurrentDate(-1).getTime();
      var endTime = DateFormat.dateByAddingDayInCurrentDate(0).getTime();
      GoogleFitDataFactory.getAllData(startTime,endTime,'DAYS',function(responseData) {
        steps = GoogleFitDataFactory.dataManager.getTotalValue(responseData.stepsData).toFixed(0);
        calories = GoogleFitDataFactory.dataManager.getTotalValue(responseData.caloriesData).toFixed(1);
        km = GoogleFitDataFactory.dataManager.getTotalValue(responseData.distanceData).toFixed(2);
        target = 0;
        addDailyCountToApi(steps,calories,km,target,yesterday,new Date());
      });
    }
  }
}

function addDailyCountToApi(steps,calories,km,target,date,dateadded) {
  if (!isDailyCountAddingInProgress) {

    if (steps != undefined && calories != undefined && km != undefined && target != undefined && date != undefined && dateadded != undefined) {
      $ionicLoading.show();
      isDailyCountAddingInProgress = true;

      ApiCall.PostCall(Api.method.addDailyCount,
      {
        "steps": steps,
        "calories": calories,
        "km": km,
        "target": target,
        "date": DateFormat.dateToStrType2WithTimeZero(date),
        "dateadded": DateFormat.dateToStrType2WithTimeZero(dateadded)
      },
      function (response) {
        isDailyCountAddingInProgress = false;
        $ionicLoading.hide();
        console.log('Daily Count Response '+JSON.stringify(response));
        if (response.success) {
          if ($rootScope.getLastSynchTime) {
            $rootScope.getLastSynchTime();
          }          

          getWorkoutDataFromPlugin($scope.activitylist);

          DailyCountFactory.SetAddedDate(dateadded);
          console.log('Daily Count Added Success '+response.message);
        } else {
          console.log('Add Daily Count Error '+response.message);
        }
      },
      function(error) {
        isDailyCountAddingInProgress = false;
        $ionicLoading.hide();
        console.log('Daily Count not added '+response.message);
      }
      );
    }
  }
}

function getHealthDailyCountDataFromApi() {
  ApiCall.PostCall(Api.method.getDailyCounts,
    undefined,
    function(response){
      $ionicLoading.hide();
      console.log('Get DailyCounts '+JSON.stringify(response));
      if (response.success) {
        var dailyCountsArr = response.daily_counts;
        if (response.daily_counts.length > 7) {
          dailyCountsArr = response.daily_counts.slice(response.daily_counts.length-7, response.daily_counts.length);
        }

        var healthDataArr = [[],[],[],[]];
        for (var i = 7; i > 0 ; i--) {
          var startDateStr = DateFormat.dateToStrType2WithTimeZero(DateFormat.dateByAddingDayInCurrentDate(-i)).replace(' ','T');
          var endDateStr = DateFormat.dateToStrType2WithTimeZero(DateFormat.dateByAddingDayInCurrentDate(-i+1)).replace(' ','T');
          angular.forEach(healthDataArr, function(healthData,index){
            healthData.push({
              "endDate": endDateStr,
              "quantity": 0.0,
              "startDate": startDateStr
            });
          });
        }

        angular.forEach(dailyCountsArr, function(dailyCount,index){
          var quantityArr = [dailyCount.steps,dailyCount.calories,dailyCount.km,dailyCount.target];
          var dailyCountDateStr = dailyCount.date.replace(' ','T');
              // var endDateStr = DateFormat.dateToStrType2WithTimeZero(new Date(new Date().setDate(new Date(startDateStr).getDate()+1))).replace(' ','T');
              var dailyCountDateStrWithTimeZero = DateFormat.dateToStrType2WithTimeZero(new Date(dailyCountDateStr));

              angular.forEach(healthDataArr, function(healthData,index){
                for (var i = 0; i < healthData.length; i++) {
                  var startDateWithTimeZero = DateFormat.dateToStrType2WithTimeZero(new Date(healthData[i].startDate));
                  if (startDateWithTimeZero == dailyCountDateStrWithTimeZero) {
                    healthData[i].quantity = parseFloat(quantityArr[index]);
                    break;
                  }
                }
              });
            });

        console.log('Health Data Arr '+JSON.stringify(healthDataArr));
        angular.forEach(healthDataArr, function(healthData,index){
          setiOSHealthkitDataToActivity((index+1),healthData);
        });
      }
    });
}

/********************************************************************************************/
/************************************   Activity   ******************************************/
/********************************************************************************************/
$scope.activitylist = [];
$scope.activitylist.push({
  id:'1',
  chartType:'chart-bar',
  completed:'0 %',
  hlabels:[],
  data:[],
  count:'',
  unit:'steps',
  icon:'shoesicon.png',
  show:false,
  colors:[],
  options:{},
  mostactive:'',
  currentvalue:'',
  plotType:'week',
  target:parseFloat(GetUserDetails().target_steps)
});
$scope.activitylist.push({
  id:'2',
  chartType:'chart-bar',
  completed:'0 %',
  hlabels:[],
  data:[],
  count:'',
  unit:'kcal',
  icon:'caloriesicon.png',
  show:false,
  colors:[],
  options:{},
  mostactive:'',
  currentvalue:'',
  plotType:'week',
  target:DataFormaterFactory.convertCalToKcal(GetUserDetails().target_cals)
});
$scope.activitylist.push({
  id:'3',
  chartType:'chart-bar',
  completed:'0 %',
  hlabels:[],
  data:[],
  count:'',
  unit:'km',
  icon:'runningicon.png',
  show:false,
  colors:[],
  options:{},
  mostactive:'',
  currentvalue:'',
  plotType:'week',
  target:parseFloat(GetUserDetails().target_kms)
});

if (ionic.Platform.isIOS()) {
  $scope.activitylist.push({
    id:'4',
    chartType:'chart-bar',
    completed:'0%',
    count:'',
    hlabels:[],
    data:[],
    unit:'floors',
    icon:'floor.png',
    show:false,
    colors:[],
    options:{},
    mostactive:'',
    currentvalue:'',
    plotType:'week',
    target:parseFloat(GetUserDetails().target_flights)
  });
}

function getWorkoutDataFromPlugin(activities, callBack) {
  if (ionic.Platform.isIOS()) {
    HealthKitDataFactory.isHealthKitAvailable(function(success){
      if (success) {
        var requestCount = 0;
        var responseCount = 0;

        angular.forEach(activities,function(activity,index){
          var startDate,endDate = new Date();
          var aggregation = 'day';

          if (activity.plotType == 'day') {
            aggregation = 'hour';
            startDate = DateFormat.dateByAddingDayInCurrentDate(0);
            endDate = DateFormat.dateByAddingDayInCurrentDate(1);
          } else if (activity.plotType == 'week'){
            startDate = new Date(new Date().getTime() - 6*24*60*60*1000);
          } else if (activity.plotType == 'month'){
            startDate = DateFormat.dateByAddingMonthInCurrentDate(-1);
          } else if (activity.plotType == 'year'){
            startDate = DateFormat.dateByAddingMonthInCurrentDate(-11);
          }


          if (activity.id == '1' || activity.id == 1) {
            requestCount++;
            HealthKitDataFactory.getSteps(startDate,endDate,aggregation,function(data){
              responseCount++;
              checkProcess();
              console.log('Step Count data Days'+aggregation+' : '+ JSON.stringify(data));
              setiOSHealthkitDataToActivity(activity.id, data);
            });
          }
          if (activity.id == '2' || activity.id == 2) {
            requestCount++;
            HealthKitDataFactory.getCalories(startDate,endDate,aggregation,function(data){
              responseCount++;
              checkProcess();
              console.log('Calorie data'+aggregation+' : '+ JSON.stringify(data));
              setiOSHealthkitDataToActivity(activity.id, data);
            });
          }
          if (activity.id == '3' || activity.id == 3) {
            requestCount++;
            HealthKitDataFactory.getWalkRun(startDate,endDate,aggregation,function(data){
              responseCount++;
              checkProcess();
              console.log('Walk/Run data Days'+aggregation+' : '+ JSON.stringify(data));
              setiOSHealthkitDataToActivity(activity.id, data);
            });
          }
          if (activity.id == '4' || activity.id == 4) {
            requestCount++;
            HealthKitDataFactory.getFloors(startDate,endDate,aggregation,function(data){
              responseCount++;
              checkProcess();
              console.log('Flights data Days'+aggregation+' : ' + JSON.stringify(data));
              setiOSHealthkitDataToActivity(activity.id, data);
            });
          }
          
        });

        function checkProcess() {
          if (requestCount == responseCount) {
            if (callBack) {
              callBack(true);
            }
          }
        }
      } else {
        if (callBack) {
          callBack(false);
        }
        getHealthDailyCountDataFromApi();
      }
    });
  }
  else if (ionic.Platform.isAndroid()) {
    if (activities.length > 0) {    
     var plotTypes = ["day", "week", "month", "year"];

     var requestDataArr = [];

     for(var i = 0; i < plotTypes.length; i++) {
      var plotType = plotTypes[i];
      var filteredActivity = [];
      angular.forEach(activities,function(activity,index){
        if (activity.plotType == plotType) {
          filteredActivity.push(activity);
        }
      });

      if (filteredActivity.length == 0) {
        continue;
      }

      var startTime = startTimeAggrByPlotTypeForAndroid(plotType).startTime;
      var endTime = new Date().getTime();
      var aggregation = startTimeAggrByPlotTypeForAndroid(plotType).aggregation;

      requestDataArr.push({
        startTime:startTime,
        endTime:endTime,
        aggregation:aggregation,
        plotType:plotType,
        filteredActivity:filteredActivity
      });

    }

    requestForData();

    function requestForData() {
      if (requestDataArr.length > 0) {
        GoogleFitDataFactory.getAllData(requestDataArr[0].startTime, requestDataArr[0].endTime, requestDataArr[0].aggregation, function(responseData) {

          angular.forEach(requestDataArr[0].filteredActivity,function(activity,index){
            if (activity.plotType == requestDataArr[0].plotType) {
              if (activity.id == '1') {
                setAndroidGoogleFitDataToActivity(1,responseData.stepsData);
              }
              if (activity.id == '2') {
                setAndroidGoogleFitDataToActivity(2,responseData.caloriesData);
              }
              if (activity.id == '3') {
                setAndroidGoogleFitDataToActivity(3,responseData.distanceData);
              }
            }
          });

          requestDataArr.shift();
          requestForData();
        },
        function(error) {
          if (callBack) {
            callBack(false);
          }
          getHealthDailyCountDataFromApi();
        });
      } else {
        if (callBack) {
          callBack(true);
        }
      }
    }
  }
} else {
  getHealthDailyCountDataFromApi();
}
}

function setDataForPlotType(activities, responseData, plotType) {
  if (activities[0].plotType == plotType) {
    setAndroidGoogleFitDataToActivity(1,responseData.stepsData);
  }
  if (activities[1].plotType == plotType) {
    setAndroidGoogleFitDataToActivity(2,responseData.caloriesData);
  }
  if (activities[2].plotType == plotType) {
    setAndroidGoogleFitDataToActivity(3,responseData.distanceData);
  }
}


function startTimeAggrByPlotTypeForAndroid(plotType) {
  var startTime = '';
  var aggregation = '';

  if (plotType == 'day') {
    startTime = DateFormat.dateByAddingDayInCurrentDate(0).getTime();
    aggregation = 'HOURS';
  } else if (plotType == 'week') {
    startTime = DateFormat.dateByAddingDayInCurrentDate(-6).getTime();
    aggregation = 'DAYS';
  } else if (plotType == 'month') {
    startTime = DateFormat.dateByAddingMonthInCurrentDate(-1).getTime();
    aggregation = 'DAYS';
  } else if (plotType == 'year') {
    startTime = DateFormat.dateByAddingMonthInCurrentDate(-11).getTime();
    aggregation = 'DAYS';
  }

  return {
    startTime:startTime,
    aggregation:aggregation
  };
}

function setAndroidGoogleFitDataToActivity(id, data) {
  angular.forEach($scope.activitylist,function(activity,index){
    if (activity.id == id) {
      var quanData;
      var days;
      var count = GoogleFitDataFactory.dataManager.getTotalValue(data);
      var max = 0;
      var target = activity.target;
      var currentvalue = 0;
      var completed = 0;

      if (activity.plotType == 'day') {
        quanData = GoogleFitDataFactory.dataManager.getValuesByHours(data,2);
        days = GoogleFitDataFactory.dataManager.getHours(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForDay(quanData);
        activity.mostactive = null;
        currentvalue = count;        
      } else if (activity.plotType == 'week') {
        quanData = GoogleFitDataFactory.dataManager.getValuesByDay(data,2);
        days = GoogleFitDataFactory.dataManager.getDays(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForWeek(quanData,activity.target);
        currentvalue = quanData[quanData.length-1];        
      } else if (activity.plotType == 'month') {
        quanData = GoogleFitDataFactory.dataManager.getValuesByDay(data,2);
        days = GoogleFitDataFactory.dataManager.getMonthDays(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForWeek(quanData,activity.target);
        currentvalue = quanData[quanData.length-1];        
      } else if (activity.plotType == 'year') {
       quanData = GoogleFitDataFactory.dataManager.getValuesByDayForYear(data,2);
       days = GoogleFitDataFactory.dataManager.getYears(data);
       activity.colors = HealthKitDataFactory.dataManager.getColorsForYear(quanData, data, activity.target, 'start');
       currentvalue = data[data.length-1].fields[0].value;
     }

     if (target == 0 || !target) {
      completed = 0;
    } else {
      completed = (currentvalue/target)*100;
    }


    var fixedTo = 1;
    if (activity.unit == 'floors' || activity.unit == 'steps') {
      fixedTo = 0;
    }
    if (activity.unit == 'km') {
      fixedTo = 2;
    }
    activity.currentvalue = DataFormaterFactory.putThousandsSeparators(parseFloat(currentvalue).toFixed(fixedTo));
    activity.count = DataFormaterFactory.putThousandsSeparators(count.toFixed(fixedTo));
    activity.hlabels = days;
    activity.completed = completed.toFixed(0)+'%';
    
    if (activity.plotType == 'day') {
      activity.data = quanData;
    } else if (activity.plotType == 'week' || activity.plotType == 'month' || activity.plotType == 'year') {
      activity.data = [quanData];
      max = Math.max.apply(Math, quanData);
      angular.forEach(quanData, function(value,index) {
        if (value == max) {
          activity.mostactive = days[index];
        }
      });
    }

    var maxVal = parseInt(max);
    activity.options = HealthKitDataFactory.dataManager.getOptions(maxVal);
    apply();
  }
});
}

function setiOSHealthkitDataToActivity(id, data) {
  angular.forEach($scope.activitylist,function(activity,index){
    if (activity.id == id) {
      var quanData;
      var days;
      var count = HealthKitDataFactory.dataManager.getTotalQuantity(data);
      var max = 0;
      var target = activity.target;
      var currentvalue = 0;
      var completed = 0;

      if (activity.plotType == "day") {
        quanData = HealthKitDataFactory.dataManager.getQuantityByHours(data,1);
        days = HealthKitDataFactory.dataManager.getHours(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForDay(quanData);
        activity.mostactive = null;
        currentvalue = count;
      } else if (activity.plotType == "month") {
        quanData = HealthKitDataFactory.dataManager.getQuantitiesByDay(data,1);
        days = HealthKitDataFactory.dataManager.getMonthDays(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForWeek(quanData,activity.target);
        currentvalue = quanData[quanData.length-1];
      } else if (activity.plotType == "year") {
        quanData = HealthKitDataFactory.dataManager.getQuantitiesByDayForYear(data,1);
        days = HealthKitDataFactory.dataManager.getYears(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForYear(quanData, data, activity.target, 'startDate');
        currentvalue = data[data.length-1].quantity;
      } else {
        quanData = HealthKitDataFactory.dataManager.getQuantitiesByDay(data,1);
        days = HealthKitDataFactory.dataManager.getDays(data);
        activity.colors = HealthKitDataFactory.dataManager.getColorsForWeek(quanData,activity.target);
        currentvalue = quanData[quanData.length-1];
      }

      if (target == 0 || !target) {
        completed = 0;
      } else {
        completed = (currentvalue/target)*100;
      }

      var fixedTo = 1;
      if (activity.unit == 'floors' || activity.unit == 'steps') {
        fixedTo = 0;
      }
      if (activity.unit == 'km') {
        fixedTo = 2;
      }
      activity.currentvalue = DataFormaterFactory.putThousandsSeparators(parseFloat(currentvalue).toFixed(fixedTo));
      activity.count = DataFormaterFactory.putThousandsSeparators(count.toFixed(fixedTo));
      activity.hlabels = days;
      activity.completed = completed.toFixed(0)+'%';
      activity.data = activity.plotType?quanData:[quanData];
      if (activity.plotType == 'day') {
        activity.data = quanData;
      } else if (activity.plotType == 'week' || activity.plotType == 'month' || activity.plotType == 'year') {
       activity.data = [quanData];
       max = Math.max.apply(Math, quanData);
       angular.forEach(quanData,function(value,index){
        if (value == max) {
          activity.mostactive = days[index];
        }
      });
     }
     var maxVal = parseInt(max);
     activity.options = HealthKitDataFactory.dataManager.getOptions(maxVal);

     apply();
   }
 });
}

$scope.toggleActivity = function(activity) {
  var scrollToPos = 0;
  for (var i = 0; i < $scope.activitylist.length; i++) {
    if ($scope.activitylist[i].id == activity.id) {
      $scope.activitylist[i].show = !activity.show;
    } else {
      $scope.activitylist[i].show = false;
    }
  }
  $ionicScrollDelegate.resize();
  if (activity.show) {
    var elementHeight = document.querySelector(".activity-list .item-stable").offsetHeight;
    scrollToPos = elementHeight * (parseInt(activity.id));
    $ionicScrollDelegate.scrollTo(0, scrollToPos, true);
  }
  apply();
};
$scope.plotAggregation = function(activity, type) {
  if (activity.plotType != type) {
    activity.plotType = type;

    $ionicLoading.show();
    getWorkoutDataFromPlugin([activity], function(success){
      $ionicLoading.hide();
    });
  }
};

/********************************************************//********************************************************/
/************************************************    Session   ****************************************************/

      // $scope.session = {
      //   lastSession:{},
      //   pastSessions:[],
      //   title:'No Sessions Yet',
      //   subTitle:'0.0',
      //   unit:'km',
      //   icon:'sessions.png',
      //   show:true,
      //   isSessionStart:false,
      //   sessionsCount:0
      // };

      $scope.session = {
        title:'No Sessions Yet',
        subTitle:'0.0',
        unit:'km',
        icon:'sessions.png',
        isSessionStart:false,

        lastSession:null,
        pastSessions:null,
        deviceType: (ionic.Platform.isIOS()?'iOS':(ionic.Platform.isAndroid()?'Android':'Other'))
      };

      function getSessions() {
        $ionicLoading.show();
        ApiCall.PostCall(Api.method.getAllSessions,
          undefined,
          function(response) {
            $ionicLoading.hide();
            if (response.success) {
              var sessions = response.sessions;
              setSessionsResponse(sessions);
              console.log("Sessions "+JSON.stringify(response));
            }
            addDailyCount();
          },
          function(error) {
            $ionicLoading.hide();
            console.log("Session not recieved");
            addDailyCount();
          }
          );
      }

      function deleteSession(id) {
        $ionicLoading.show();
        ApiCall.PostCall(Api.method.deleteSession,
        {
          email:GetUserDetails().email,
          sessionDataId:id
        },
        function(response){
          $ionicLoading.hide();
          console.log('Delete Session '+JSON.stringify(response));
          if (response.success) {
            var sessions = response.sessions;
            setSessionsResponse(sessions);
          } else {
            AlertFactory.showResponseError(response.message);
          }
        },
        function(error){
          $ionicLoading.hide();
        });
      }

      function setSessionsResponse(sessions) {
        if (sessions) {
          PastSessionsFactory.sessions = sessions.slice();
        }

        $ionicScrollDelegate.resize();
        
        if (sessions.length > 0) {
          sessions.reverse();
          var pastSessionsList = [];

          if ($scope.session.isSessionStart) {
            pastSessionsList = sessions;
          }
          else {
              // last session
              var lastSessionData = sessions[0];
              var lastSessionStartDate = DateFormat.strType2ToDate(lastSessionData.sessionstart);
              var lastSessionEndDate = DateFormat.strType2ToDate(lastSessionData.sessionend);

              $scope.session.title = DateFormat.dateToStrType3(lastSessionStartDate);
              $scope.session.subTitle = parseFloat(lastSessionData.distance_walk_run).toFixed(2);

              var durationStr = DataFormaterFactory.getDurationsStr(lastSessionEndDate, lastSessionStartDate);

              $scope.session.lastSession = {
                id:lastSessionData.id,
                sessionstart:DateFormat.dateToStrType3(DateFormat.strType2ToDate(lastSessionData.sessionstart)),
                calories:parseFloat(lastSessionData.calories_burned).toFixed(1),
                steps:lastSessionData.step_count,
                kms:parseFloat(lastSessionData.distance_walk_run).toFixed(2),
                floors:lastSessionData.flights_climbed,
                durations:durationStr,
                show:false,
                latLngArr:JSON.parse(lastSessionData.sessiongps),
                map:null,
                paths:[],
                unit:'km',
                speed:DataFormaterFactory.getSpeed(durationStr,parseFloat(lastSessionData.distance_walk_run).toFixed(2)),
                isCompleteStepGoal:false
              };

              if ($scope.session.lastSession.latLngArr.length>0) {
                var startPoint = $scope.session.lastSession.latLngArr[0];
                var latLng = {lat:startPoint.lat, lng:startPoint.lng}
                if ($scope.session.lastSession.map) {
                  $scope.session.lastSession.map = null;
                }
                $scope.session.lastSession.map = MapFactory.initializeMap(document.getElementById("map"),latLng,12);
                var PathStyle = MapFactory.addPolyline($scope.session.lastSession.latLngArr,$scope.session.lastSession.map);
                $scope.session.lastSession.paths.push(PathStyle);
                MapFactory.setZoomLevelByArea($scope.session.lastSession.map,$scope.session.lastSession.latLngArr);
              }

              if (sessions.length > 1) {
                pastSessionsList = sessions.slice(1, sessions.length);
              }
            }

            //past session
            if (pastSessionsList.length > 0) {
              var pastSessionsFormated = [];
              angular.forEach(pastSessionsList,function(pastSession,index){

                var durationStr = DataFormaterFactory.getDurationsStr(DateFormat.strType2ToDate(pastSession.sessionend), DateFormat.strType2ToDate(pastSession.sessionstart));
                var pastSessionData = {
                  id:pastSession.id,
                  sessionstart:DateFormat.dateToStrType3(DateFormat.strType2ToDate(pastSession.sessionstart)),
                  calories:parseFloat(pastSession.calories_burned).toFixed(1),
                  steps:pastSession.step_count,
                  kms:parseFloat(pastSession.distance_walk_run).toFixed(2),
                  floors:pastSession.flights_climbed,
                  durations:DataFormaterFactory.getDurationsStr(DateFormat.strType2ToDate(pastSession.sessionend), DateFormat.strType2ToDate(pastSession.sessionstart)),
                  show:false,
                  latLngArr:JSON.parse(pastSession.sessiongps),
                  map:null,
                  paths:[],
                  speed:DataFormaterFactory.getSpeed(durationStr,parseFloat(pastSession.distance_walk_run).toFixed(2)),
                  unit:'km'
                };
                pastSessionsFormated.push(pastSessionData);
              });
              $scope.session.pastSessions = pastSessionsFormated;
              PastSessionsFactory.setPastSessionsList(pastSessionsFormated.slice());
            } else {
              $scope.session.pastSessions = null;
            }
          } else {
            if (!$scope.session.isSessionStart) {
              $scope.session.title = 'No Sessions Yet';
              $scope.session.subTitle = '0.0';
              $scope.session.lastSession = null;
            }
            $scope.session.pastSessions = null;
          }

          $ionicScrollDelegate.resize();
          apply();

        }

        $scope.startSession = function() {
          $scope.session.isSessionStart = !$scope.session.isSessionStart;

          if ($scope.session.isSessionStart) {
            setSessionsResponse(PastSessionsFactory.sessions);

            $scope.session.lastSession = {
              'id':-1,
              'sessionstart':DateFormat.dateToStrType3(new Date()),
              'calories':0.0,
              'steps':0,
              'kms':0.0,
              'floors':0,
              'durations':'00:00:00',
              'latLngArr':[],
              'paths':[],
              'unit':'km',
              'isCompleteStepGoal':false,
              'speed':0
            };

            $scope.session.title = $scope.session.lastSession.sessionstart;
            $scope.session.subTitle = 0.0;

            var startDate = new Date();
            SessionManager.SetStartTime(startDate.toString());

            var getLocationUpdate = function(latLng) {
              if ($scope.session.lastSession.latLngArr.length == 0) {
                $scope.session.lastSession.latLngArr.push(latLng);
              } else {
                var lastLocation = $scope.session.lastSession.latLngArr[$scope.session.lastSession.latLngArr.length-1];
                var dis = DataFormaterFactory.getDistance(latLng.lat,latLng.lng, lastLocation.lat, lastLocation.lng) * 1000;
                if (dis >= 20) {
                  $scope.session.lastSession.latLngArr.push(latLng);
                  // MapFactory.setZoomLevelByArea($scope.session.lastSession.map,$scope.session.lastSession.latLngArr);
                }

                var PathStyle = MapFactory.addPolyline([lastLocation, latLng],$scope.session.lastSession.map);
                $scope.session.lastSession.paths.push(PathStyle);
                MapFactory.setMapCenter($scope.session.lastSession.map,latLng);
                var latLng = new google.maps.LatLng(latLng.lat, latLng.lng);
                $scope.session.lastSession.marker.setPosition(latLng);
              }
              apply();
            };

            if ($scope.session.lastSession.marker) {
              $scope.session.lastSession.marker.setMap(null);
              $scope.session.lastSession.marker = null;
            }

            var currentLocationSuccess = function(currentLatLng){
              if (!$scope.session.lastSession.map) {
                $scope.session.lastSession['map'] = MapFactory.initializeMap(document.getElementById("map"),currentLatLng,16);
              }
              $scope.session.lastSession.latLngArr.push(currentLatLng);

              var markerImage = new google.maps.MarkerImage('img/point-icon.png',
                new google.maps.Size(25, 25),
                new google.maps.Point(0, 0),
                new google.maps.Point(12.5, 12.5));

              //Wait until the map is loaded
              google.maps.event.addListenerOnce($scope.session.lastSession.map, 'idle', function(){
                var latLng = new google.maps.LatLng(currentLatLng.lat, currentLatLng.lng);
                $scope.session.lastSession.marker = new google.maps.Marker({
                  map: $scope.session.lastSession.map,
                  animation: google.maps.Animation.DROP,
                  position: latLng,
                  icon: markerImage
                });

                LocationFactory.startBgLocationChangeUpdate(getLocationUpdate);
                startSessionDataTimer();
              });
            };
            var currentLocationError = function (error) {
              $scope.session.lastSession.map = null;
              startSessionDataTimer();
            };
            LocationFactory.getCurrentLocation(currentLocationSuccess,currentLocationError);
            $ionicScrollDelegate.resize();
          }
          else {
            stopSessionDataTimer();
            saveSessionData();
          }
        };

        function stopSessionDataTimer() {
          LocationFactory.stopBgLocationChangeUpdate();
          clearInterval($scope.updateTimer);
          $scope.updateTimer = null;

          clearInterval($scope.durationTimer);
          $scope.durationTimer = null;

          GoogleFitDataFactory.stopActivityDataLiveUpdate(function(success){
            console.log('stopActivityDataLiveUpdate'+success);
          },
          function (error) {
            console.log('stopActivityDataLiveUpdate'+error);
          });
        }

        function startSessionDataTimer() {
          if (!$scope.updateTimer) {
            // var totalDistance = 0;
            // var totalSteps = 0;
            var startDate = new Date();
            //
            // GoogleFitDataFactory.startActivityDataLiveUpdate(function(response){
            //   var field = response.field;
            //   if (field == "distance") {
            //     totalDistance = parseFloat(totalDistance) + parseFloat(response.value);
            //   }
            //   if (field == "steps") {
            //     totalSteps = totalSteps + parseFloat(response.value);
            //   }
            //   console.log('startActivityDataLiveUpdate'+JSON.stringify(response));
            // },
            // function (error) {
            //   console.log('startActivityDataLiveUpdate'+error);
            // });

            // update timer and fetch health data
            $scope.updateTimer = setInterval(function(){

              getSessionHealthData(startDate, new Date());
              if (ionic.Platform.isAndroid()) {
                // new code
                // var distanceInM = parseFloat(totalDistance);
                // var distanceInKM = parseFloat(distanceInM/1000).toFixed(2);
                // var totalCalories = DataFormaterFactory.getCalories(startDate,new Date(),distanceInKM,GetMeasurementDetails().weightkg);
                // setLiveSessionData(startDate, new Date(),totalSteps,distanceInKM,totalCalories,undefined);
              }

              apply();
            }, 5000);

            $scope.durationTimer = setInterval(function(){
              if (!GetUserDetails().passhash) {
                stopSessionDataTimer();
              }
              $scope.session.lastSession.durations = DataFormaterFactory.getDurationsStr(new Date(),startDate);
              $scope.session.subTitle = parseFloat($scope.session.lastSession.kms).toFixed(1);
              $scope.session.lastSession.speed = DataFormaterFactory.getSpeed(DataFormaterFactory.getDurationsStr(new Date(),startDate),parseFloat($scope.session.lastSession.kms).toFixed(2));

              apply();
            }, 1000);
          }
        }

        function saveSessionData () {
          var startDate = new Date(SessionManager.GetStartTime());

          if (!$scope.session.lastSession.latLngArr) {
            $scope.session.lastSession.latLngArr = [];
          }

          var latLng = $scope.session.lastSession.latLngArr[0];
          if (!latLng) {
            latLng = {lat:0.0,lng:0.0};
          }
          $ionicLoading.show();

          var lastSession = $scope.session.lastSession;
          ApiCall.PostCall(Api.method.saveSession,
          {
            session_id: 0,
            sessionstart:DateFormat.dateToStrType2(startDate),
            sessionend:DateFormat.dateToStrType2(new Date()),
            sessiongps:JSON.stringify(lastSession.latLngArr),
            step_count:lastSession.steps,
            distance_walk_run:lastSession.kms,
            calories_burned:lastSession.calories,
            flights_climbed:lastSession.floors,
            sessionmaplat:latLng.lat,
            sessionmaplong:latLng.lng,
            sessionrating:"1"
          },
          function(response) {
            $ionicLoading.hide();
            if (response.success) {
              var sessions = response.sessions;
              setSessionsResponse(sessions);
            } else {
              AlertFactory.showResponseError(response.message);
            }
          }, function (err) {
            console.log(JSON.stringify(err));
          });
        }


        $scope.deleteSession = function(id) {
          var sessionDeleteConfirm = function(confirm) {
            if (confirm) {
              deleteSession(id);
            }
          };
          AlertFactory.showConfirmPromt('Delete Session','Are you sure you want to delete this session?',sessionDeleteConfirm);
        };

        function getSessionHealthData(startDate, endDate) {
          if (ionic.Platform.isAndroid()) {
            var startTime = startDate.getTime();
            var endTime = endDate.getTime();
            var aggregation = 'HOURS';

            GoogleFitDataFactory.getAllData(startTime,endTime,aggregation,function(responseData) {
              var totalSteps = GoogleFitDataFactory.dataManager.getTotalValue(responseData.stepsData).toFixed(0);
              var totalCalories = GoogleFitDataFactory.dataManager.getTotalValue(responseData.caloriesData).toFixed(1);
              var totalDistance = GoogleFitDataFactory.dataManager.getTotalValue(responseData.distanceData).toFixed(2);
              setLiveSessionData(startDate, endDate,totalSteps,totalDistance,totalCalories,undefined);
            });
          } else {
            var successCallback = function(){
              var successHandler = function (pedometerData) {
                  // pedometerData.numberOfSteps;
                  // pedometerData.distance;
                  // pedometerData.floorsAscended;
                  // pedometerData.floorsDescended;
                  // console.log('pedometerData '+JSON.stringify(pedometerData));
                  setLiveSessionData(startDate, endDate,pedometerData.numberOfSteps,parseFloat(pedometerData.distance/1000),undefined,(pedometerData.floorsAscended+pedometerData.floorsDescended));
                };
                var options = {
                  "startDate": startDate,
                  "endDate": endDate
                };
                pedometer.queryData(successHandler, null, options);
              };
              var failureCallback = function(){
                console.log("isStepCountingAvailable NO");
              };
              pedometer.isStepCountingAvailable(successCallback, failureCallback);
            }
          }

          function setLiveSessionData(startDate,endDate,numberOfSteps,distance,calories,floors){
            if (!$scope.session.isSessionStart) {
              return;
            }

            $scope.session.lastSession.steps = parseInt(numberOfSteps);
            $scope.session.lastSession.kms = parseFloat(distance).toFixed(2);

            if (floors) {$scope.session.lastSession.floors = floors;}
            else {$scope.session.lastSession.floors = 0;}
            if (calories) {$scope.session.lastSession.calories = parseFloat(calories).toFixed(1);}
            else {$scope.session.lastSession.calories = DataFormaterFactory.getCalories(startDate,endDate,distance,GetMeasurementDetails().weightkg);}

            if (!$scope.session.lastSession.isCompleteStepGoal && $scope.session.lastSession.steps >= parseInt(GetUserDetails().target_steps)) {
              $scope.session.lastSession.isCompleteStepGoal = true;
              if ($scope.isForeground) {
                AlertFactory.showWithTitle('Congratulations!','You completed your steps goal for today.');
              } else {
                if (cordova.plugins.notification) {
                  cordova.plugins.notification.local.schedule({
                    id: 1,
                    title:'FitMK',
                    text: "Congratulations you completed your steps goal for today."
                    // sound: isAndroid ? 'file://sound.mp3' : 'file://beep.caf',
                    // data: { secret:key }
                  });
                }
              }
            }
            apply();
          }

          

          function getCalendarBookedSessions(){
            $ionicLoading.show();
            ApiCall.PostCall(Api.method.getCalendarBookedSessions,
              undefined,
              function(response) {
                $ionicLoading.hide();
                sessionCalender(response.sessions);
                console.log("this is booked session data informations"+JSON.stringify(response.sessions));
              }, function (err) {
                $ionicLoading.hide();
                console.log(JSON.stringify(err));
              });
          }
          // sessionCalender()
          function sessionCalender(bookedSessionsList){
            $scope.calName = "FitMK Calendar";
            if(!$cordovaCalendar){
              return;
            }
            $cordovaCalendar.listCalendars().then(function (result) {
              var isCalendarCreated = false;
              for (var i = 0; i < result.length; i++) {
                var calendar = result[i];

                if (calendar.name == $scope.calName) {
                  isCalendarCreated = true;
                  break;
                }
              }

              if (isCalendarCreated) {
                addEvents(bookedSessionsList);
              } else {
                // new Date('2011-04-11T11:51:00')
                $cordovaCalendar.createCalendar({
                  calendarName: $scope.calName,
                  calendarColor: '#85C441'
                }).then(function (result) {
                  addEvents(bookedSessionsList);
                }, function (err) {
                  console.log("Error in creating calendar.");
                });
              }
            }, function (err) {
              console.log("Error in listing calendars.");
            });      
          }

          function addEvents(bookedSessionsList) {
            $scope.bookedSessionsList = bookedSessionsList;

            if ($scope.bookedSessionsList && $scope.bookedSessionsList.length > 0) {
              $scope.eventIndex = 0;
              creatingEvent();
            }            
          }

          function creatingEvent() {
           var bookedSession =  $scope.bookedSessionsList[$scope.eventIndex];

           $cordovaCalendar.findEvent({
            title: bookedSession.SessionName,
            location: bookedSession.VenueName,
            notes: '',
            startDate: new Date(bookedSession.SessionDate+'T'+bookedSession.SessionStartTime),
            endDate: new Date(bookedSession.SessionDate+'T'+bookedSession.SessionEndTime),
            calendarName: $scope.calName
          }).then(function (result) {
            if (result.length == 0) {
             $cordovaCalendar.createEventInNamedCalendar({
              id:bookedSession.SessionId,
              title: bookedSession.SessionName,
              location: bookedSession.VenueName,
              notes: '',
              firstReminderMinutes:10*60,
              startDate: new Date(bookedSession.SessionDate+'T'+bookedSession.SessionStartTime),
              endDate: new Date(bookedSession.SessionDate+'T'+bookedSession.SessionEndTime),
              calendarName: $scope.calName
            }).then(function (result) {
              if (($scope.bookedSessionsList.length - 1) > $scope.eventIndex) {
                $scope.eventIndex++;
                creatingEvent();
              }
            }, function (err) {
              console.log("Error in creating event "+JSON.stringify(result));
            });
          } else {
            if (($scope.bookedSessionsList.length - 1) > $scope.eventIndex) {
              $scope.eventIndex++;
              creatingEvent();
            }
          }
        }, function (err) {
          console.log("Error in finding events"+JSON.stringify(result));
        });
        }


        SharedData.getUserCredits();
        getBookedSessions();
        getCalendarBookedSessions();


        $rootScope.$on('MenuItemChanged', function(event, args) {
          if (args.itemName == 'home') {
            getCalendarBookedSessions();
            getBookedSessions();
            SharedData.getUserCredits();
          }
        });


      });
