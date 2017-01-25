//user details
starter.value('SetUserDetails',function(user_details){
  if (user_details) {
    window.localStorage.setItem('user_detail',JSON.stringify(user_details));
  }
});
starter.value('GetUserDetails',function(){
  if (window.localStorage.getItem('user_detail')) {
    var user_details = JSON.parse(window.localStorage.getItem('user_detail'));
    return user_details;
  }
  return {};
});

starter.value('SetMeasurementDetails',function(measurements_details){
  if (measurements_details) {
    window.localStorage.setItem('measurements_details',JSON.stringify(measurements_details));
  }
});
starter.value('GetMeasurementDetails',function(){
  if (window.localStorage.getItem('measurements_details')) {
    var measurements_details = JSON.parse(window.localStorage.getItem('measurements_details'));
    return measurements_details;
  }
  return {};
});

//Daily Count Date
starter.factory('User',function(GetUserDetails){
  return {
    isInstructor:function() {
      var instructor = false;
      for (var i = 0; i < GetUserDetails().groups.length; i++) {
        var group = GetUserDetails().groups[i];
        if (group.usergrouptype == 'instructor') {
          instructor = true;
          break;
        }
      }
      return instructor;
    },
    isAdmin:function() {
      var admin = false;
      for (var i = 0; i < GetUserDetails().groups.length; i++) {
        var group = GetUserDetails().groups[i];
        if (group.usergrouptype == 'admin') {
          admin = true;
          break;
        }
      }
      return admin;
    }
  };
});

//Daily Count Date
starter.factory('DailyCountFactory',function(){
  return {
    SetAddedDate:function(date) {
      window.localStorage.setItem('DailyCountAddedDate',date.toString());
    },
    GetAddedDate:function() {
      var addedDate = new Date(window.localStorage.getItem('DailyCountAddedDate'));
      return addedDate;
    }
  };
});

// session data
starter.factory('SessionManager', function(){
  return {
    'SetStartTime':function(time){
      window.localStorage.setItem('session_start_time',time);
    },
    'GetStartTime':function(){
      return window.localStorage.getItem('session_start_time');
    }
  }
});
starter.factory('PastSessionsFactory', function(){
  return {
    PastSessionsList:null,
    setPastSessionsList:function(pastSessions){
      this.PastSessionsList = null;
      this.PastSessionsList = pastSessions;
    },
    sessions:null,
    setSessions:function(sessions){
      this.sessions = null;
      this.sessions = sessions;
    }
  }
});
