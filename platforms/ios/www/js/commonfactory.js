
starter.factory('goTo', function($ionicHistory,$state, $rootScope) {
  return {
    root : function() {
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $state.go('app.home');
      $rootScope.menuHistoryStoredArr = ['app.home'];
    }
  };
})

starter.factory('DataFormaterFactory', function(){
  return {
    secondsToDateTime : function (secs) {
      var t = new Date(1970, 0, 1); // Epoch
      t.setSeconds(secs);
      return t;
    },
    addZero : function (val) {
      if (val < 10) {
        val = "0" + val;
      }
      return val;
    },
    putThousandsSeparators:function(value) {
      var sep = ',';
      if (value.toString() === value.toLocaleString()) {
        value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
      } else {
        value = value.toLocaleString();
      }
      return value;
    },
    getDurationsStr:function(date1, date2) {
      var msec = date1.getTime() - date2.getTime();
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      msec -= ss * 1000;
      var durationsStr = this.addZero(hh) + ":" + this.addZero(mm) + ":" + this.addZero(ss);
      return durationsStr;
    },
    secondsToHourMinSeondsStr : function(seconds) {
      seconds = parseInt(seconds);
      // var hh = Math.floor(seconds / 60 / 60);
      // seconds -= hh  * 60 * 60;
      var mm = Math.floor(seconds / 60);
      seconds -= mm  * 60;
      var ss = Math.floor(seconds);

      var durationsStr = this.addZero(mm) + ":" + this.addZero(ss);

      return durationsStr;
    },
    hourMinSecondsStrToSeconds : function(hourMinSecondsStr) {
      var hoursMinArr = hourMinSecondsStr.split(':');
      var min = 0;
      var seconds = 0;
      if (hoursMinArr.length > 0) {
        min = parseInt(hoursMinArr[0]);
      }
      if (hoursMinArr.length > 1) {
        seconds = parseInt(hoursMinArr[1]);
      }
      var totalSeconds = min*60 + seconds;
      return totalSeconds;
    },
    getDistance:function () {
      var radians = Array.prototype.map.call(arguments, function(deg) { return deg/180.0 * Math.PI; });
      var lat1 = radians[0], lon1 = radians[1], lat2 = radians[2], lon2 = radians[3];
      var R = 6372.8; // km
      var dLat = lat2 - lat1;
      var dLon = lon2 - lon1;
      var a = Math.sin(dLat / 2) * Math.sin(dLat /2) + Math.sin(dLon / 2) * Math.sin(dLon /2) * Math.cos(lat1) * Math.cos(lat2);
      var c = 2 * Math.asin(Math.sqrt(a));
      return R * c;  // In Km
    },
    getSpeed:function(duration,distance) { //00:00:00 0km km/h
      var timesArr = duration.split(':');
      var hours = timesArr[0];
      var minutes = timesArr[1];
      var seconds = timesArr[2];

      var totalTime = parseFloat(hours + minutes/60 + seconds/60/60).toFixed(3);
      var totalDistance = distance;
      if (totalTime > 0) {
        var speed = parseFloat(totalDistance/totalTime).toFixed(2);
        return speed;
      }
      return "0.0";
    },
    getCalories:function(startDate,endDate,distance,weightkg){
      if (!weightkg) {
        weightkg = 70; //set average weight if not defined
      }
      var msec = endDate.getTime() - startDate.getTime();
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      msec -= ss * 1000;

      var hours = (mm + (ss/60))/(60);
      var kmperhrspeed = parseFloat(distance/hours);
      var weight = parseFloat(weightkg);

      var caloriesBurn = 0.0215*Math.pow(kmperhrspeed, 3) - 0.1765*Math.pow(kmperhrspeed, 2) + 0.871*kmperhrspeed + 1.4577;
      // var totalkcal = Math.round(caloriesBurn*weight*hours);
      var totalkcal = parseFloat(caloriesBurn*weight*hours).toFixed(1);
      if (isNaN(totalkcal)) {
        totalkcal = 0;
      }
      return totalkcal;
    },
    convertCalToKcal:function(cal){
      if (ionic.Platform.isAndroid()) {
        return parseFloat(cal);
      }
      var cal = parseFloat(cal);
      return parseFloat(cal/1000).toFixed(1);
    },
    convertKcalTocal:function(kcal){
      if (ionic.Platform.isAndroid()) {
        return kcal;
      }
      var kcal = parseFloat(kcal);
      return parseFloat(kcal*1000).toFixed(1);
    }
  };
})

.factory('DateFormat', function(DataFormaterFactory){
  return {
    dateToStr : function (date) {
      if (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth()+1;
        var year = date.getFullYear();
        var datStr = day+'-'+ ((monthIndex<10)?'0':'')+monthIndex +'-'+year;
        return datStr; // 12/10/2016
      }
      return undefined;
    },
    dateToStrForMonth : function (date) {
      if (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth()+1;
        var year = date.getFullYear();
        var datStr = year+'-'+ ((monthIndex<10)?'0':'')+monthIndex +'-'+day;
        return datStr; // 12/10/2016
      }
      return undefined;
    },

    dateToStrForMonthName:function(date) {

      var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
      ];
      var day = date.getDate();
      var monthIndex = date.getMonth()+1;
      var year = date.getFullYear();
      var dateStr = monthNames[monthIndex-1]+" "+year;
      return dateStr;
    },
    dateToStrSeparateByDash : function (date) {
      if (date) {
        var day = date.getDate();
        var monthIndex = date.getMonth()+1;
        var year = date.getFullYear();
        var datStr = day+'-'+ ((monthIndex<10)?'0':'')+monthIndex +'-'+year;
        return datStr; // 12-10-2016
      }
      return undefined;
    },
    strToDate : function (datStr) {// 12/10/2016
      var dateArr = datStr.split('-');
      if (dateArr.length == 3) {
        var newDateStr = dateArr[0]+'/'+dateArr[1]+'/'+dateArr[2];
        var dateObj = new Date(newDateStr);
        return dateObj;
      }
      return "";
    },
    dateToStrType2 : function(date) {
      if (date) {
        var day = DataFormaterFactory.addZero(date.getDate());
        var monthIndex = DataFormaterFactory.addZero(date.getMonth()+1);
        var year = date.getFullYear();
        var h = DataFormaterFactory.addZero(date.getHours());
        var m = DataFormaterFactory.addZero(date.getMinutes());
        var s = DataFormaterFactory.addZero(date.getSeconds());

        var datStr = year+'-'+monthIndex+'-'+day+' '+h+':'+m+':'+s;
        return datStr; // 2014-12-01 12:10:50
      }
      return undefined;
    },
    dateToStrType2WithTimeZero : function(date) {
      if (date) {
        var day = DataFormaterFactory.addZero(date.getDate());
        var monthIndex = DataFormaterFactory.addZero(date.getMonth()+1);
        var year = date.getFullYear();

        var datStr = year+'-'+monthIndex+'-'+day+' 00:00:00';
        return datStr; // 2014-12-01 00:00:00
      }
      return undefined;
    },
    strType2ToDate : function(dateStr) {// 2014-12-01 12:10:50
      dateStr = dateStr.replace(' ','T');
      return new Date(dateStr);
    },
    dateToStrType3:function(date) {
      var day = DataFormaterFactory.addZero(date.getDate());
      var monthIndex = DataFormaterFactory.addZero(date.getMonth()+1);
      var year = date.getFullYear();
      var datStr = day+'/'+monthIndex+'/'+year;
      return datStr; // 29/05/2016
    },
    dateByAddingDayInCurrentDate:function(dayCount){
      var newDate = new Date(new Date().setDate(new Date().getDate()+dayCount));
      newDate.setHours(0,0,0,0);
      return newDate;
    },
    dateByAddingMonthInCurrentDate:function(monthCount){
      var newDate = new Date(new Date().setMonth(new Date().getMonth()+monthCount));
      newDate.setHours(0,0,0,0);
      return newDate;
    }
  };
})

.factory('AlertFactory',function($ionicPopup){
  return {
    showWithTitle:function (title,text,callback) {
      if (!title) {
        title = "";
      }
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: "<p style='text-align:center;width:100%;'>"+text+"</p>"
      });

      alertPopup.then(function(res) {
        if (callback) {
          callback(res);
        }
      });
    },
    showError:function (text,callback) {
      this.showWithTitle("Error !",text,callback);
    },
    showSuccess:function (text,callback) {
      this.showWithTitle("Success !",text,callback);
    },
    showAlert:function(text,callback){
      this.showWithTitle("Alert !",text,callback);
    },
    showConfirmPromt:function(title,text,callback) {
      var confirmPopup = $ionicPopup.confirm({
        title: title,
        template: "<p style='text-align:center;width:100%;'>"+text+"</p>"
      });
      confirmPopup.then(callback);
    },
    showResponseError:function(response, defaultMessage) {
      var error = response.error;
      if (error) {
        var message = "";
        angular.forEach(error, function(value, key){
          message = message + value + "<br />";
        });
        this.showError(message);
      } else {
        this.showError(defaultMessage);
      }
    }
  };
})



.factory('StateChecker', function($rootScope, $state){
  return {
    runStateChecker: function(){

      if (window.analytics) {
        window.analytics.startTrackerWithId('UA-64989876-18');
      }

      $rootScope.$on('$ionicView.afterEnter', function(){ 

        var pageName = $state.current.name.replace("app.", "").capitalize();;
        console.log('Page Change '+pageName);

        if (window.analytics) {
          window.analytics.trackView(pageName);
        }               
      });
    }
  };
})


.factory('SharedData',function($rootScope, ApiCall, Api){
  var selectedShopCategory = "";
  var selectedVenue = "";
  var selectedDrillInstructor = "";
  var isNeedRefreshOrders = false;
  var isFromPackageView = false;
  var pastBookingNotificationData = {
    'isRatingCommentReminder':false,
    'sessionId':''
  };

  return {    
    setClickedShopCategory:function(catName) {
      selectedShopCategory = catName;
    },
    getClickedShopCategory:function() {
      return selectedShopCategory;
    },

    setSelectedVenue:function(venue) {
      selectedVenue = venue;
    },
    getSelectedVenue:function() {
      return selectedVenue;
    },

    setPastBookingNotificationData:function(status, sessionId) {
      pastBookingNotificationData.isRatingCommentReminder = status;
      pastBookingNotificationData.sessionId = sessionId;
    },
    getPastBookingNotificationData:function() {
      return pastBookingNotificationData;
    },

    setSelectedDrillInstructor:function(drillInstructor) {
      selectedDrillInstructor = drillInstructor;
    },
    getSelectedDrillInstructor:function() {
      return selectedDrillInstructor;
    },

    getUserCredits:  function () {
      ApiCall.PostCall(Api.method.getUserCredits,
        null,
        function(response) {
          if (response.success) {
            var totalCredits = response.total_credits;
            $rootScope.totalCredits = totalCredits;

          } else {
            console.log(JSON.stringify(response));
          }
        },
        function(err){
          console.log(JSON.stringify(err));
        });
    },

    getIsFromPackageView:function(){
      return isFromPackageView;
    },
    setIsFromPackageView:function(status){
      isFromPackageView = status;
    },
    
    setNeedRefreshOrders:function(needStatus) {
      isNeedRefreshOrders = needStatus;
    },
    getNeedRefreshOrders:function() {
      return isNeedRefreshOrders;
    }
  };
});
