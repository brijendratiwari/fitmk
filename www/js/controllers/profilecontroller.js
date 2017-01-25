starter.controller('ProfileCtrl', function(
  $scope,
  $state,
  $ionicViewSwitcher,
  $ionicPopup,
  DateFormat,
  GetUserDetails,SetUserDetails,DataFormaterFactory,
  Api,
  $ionicLoading,
  ApiCall,
  AlertFactory
  ) {


  var user_data = GetUserDetails();

  $scope.userdetails = {
    first_name:user_data.first_name,
    last_name:user_data.last_name,
    uname:user_data.username,
    phone:user_data.phone,
    dateOfBirth:DateFormat.strToDate(user_data.dob),
    gender:user_data.gender,
    physicalIssues:user_data.physical_issues,
    otherNotes:user_data.other_notes,
    fitnessCategory:user_data.bib,
    // target_steps:parseInt(user_data.target_steps),
    // target_flights:parseInt(user_data.target_flights),
    // target_kms:parseInt(user_data.target_kms),
    // target_kcals:DataFormaterFactory.convertCalToKcal(user_data.target_cals),
    // push:(!parseInt(user_data.push_notifications))?0:parseInt(user_data.push_notifications),
    // email:(!parseInt(user_data.email_notifications))?0:parseInt(user_data.email_notifications),
    notification_new_blogs:(!parseInt(user_data.notification_new_blogs))?0:parseInt(user_data.notification_new_blogs),
    notification_new_events:(!parseInt(user_data.notification_new_events))?0:parseInt(user_data.notification_new_events),
    email_noti_bookings:(!parseInt(user_data.email_noti_bookings))?0:parseInt(user_data.email_noti_bookings),
    email_noti_newsletters:(!parseInt(user_data.email_noti_newsletters))?0:parseInt(user_data.email_noti_newsletters),
  };

  $ionicLoading.show();

  ApiCall.PostCall(Api.method.getTarget,
    undefined,
    function (response) {
      $ionicLoading.hide();

      if (response.success) {
        var targets = response.targets;
        if (targets) {
          $scope.userdetails['target_steps'] = parseInt(targets.target_steps);
          $scope.userdetails['target_flights'] = parseInt(targets.target_flights);
          $scope.userdetails['target_kms'] = parseInt(targets.target_kms);
          $scope.userdetails['target_kcals'] = DataFormaterFactory.convertCalToKcal(targets.target_cals);
        }
      } else {
        AlertFactory.showResponseError(response,"Daily targets not found.");
      }
    },
    function(error) {
      $ionicLoading.hide();
      AlertFactory.showError(JSON.stringify(error));
    });

  $scope.submit = function(){

    var message = "";
    var cal = DataFormaterFactory.convertKcalTocal($scope.userdetails.target_kcals);

    if ($scope.userdetails.target_steps < 5000) {
      message = message + "Minimum 5000 steps needed";
    } 
    if ($scope.userdetails.target_flights < 20) {
      message = message + "<br />Minimum 20 stairs needed";
    } 
    if ($scope.userdetails.target_kms < 5) {
      message = message + "<br />Minimum 5 kms needed";
    } 
    if (cal < 2200 && $scope.userdetails.gender == 'male') {
      message = message + "<br />Minimum 2200 cal needed";
    } 
    if (cal < 2000 && $scope.userdetails.gender == 'female') {
      message = message + "<br />Minimum 2000 cal needed";
    }

    if (message.length > 0) {
      AlertFactory.showAlert(message);
    } else {
      updateDailyTargets(function(){
        updateUserDetails();
      });
    }    
  };

  function updateUserDetails() {
    var phone = $scope.userdetails.phone;

    if (!phone) {
      phone = "";
    }
    $ionicLoading.show();
    ApiCall.PostCall(Api.method.updateUserDetails, {
      "first_name": $scope.userdetails.first_name,
      "last_name": $scope.userdetails.last_name,
      "phone": phone,
      "gender":$scope.userdetails.gender,
      "dob":DateFormat.dateToStr($scope.userdetails.dateOfBirth),
      "uname": $scope.userdetails.uname,
      "fitness_category":$scope.userdetails.fitnessCategory,
      "physical_issues": $scope.userdetails.physicalIssues,
      "other_notes": $scope.userdetails.otherNotes,
      // "target_steps": $scope.userdetails.target_steps,
      // "target_flights": $scope.userdetails.target_flights,
      // "target_kms": $scope.userdetails.target_kms,
      // "target_cals":DataFormaterFactory.convertKcalTocal($scope.userdetails.target_kcals),
      // "email_notifications":$scope.userdetails.email,
      // "push_notifications":$scope.userdetails.push,
      "notification_new_blogs":$scope.userdetails.notification_new_blogs,
      "notification_new_events":$scope.userdetails.notification_new_events,
      "email_noti_bookings":$scope.userdetails.email_noti_bookings,
      "email_noti_newsletters":$scope.userdetails.email_noti_newsletters,
    },function (response) {
      $ionicLoading.hide();

      if (response.success) {
        SetUserDetails(response.user_detail);
        AlertFactory.showSuccess(response.message);
      } else {
        AlertFactory.showResponseError(response,"User details not updated.");
      }
    },
    function(error) {
      $ionicLoading.hide();
      AlertFactory.showError(JSON.stringify(error));
    });
  }

  function updateDailyTargets(callBack) {    
    $ionicLoading.show();
    ApiCall.PostCall(Api.method.setTarget, {
      "target_steps": $scope.userdetails.target_steps,
      "target_flights": $scope.userdetails.target_flights,
      "target_kms": $scope.userdetails.target_kms,
      "target_cals":DataFormaterFactory.convertKcalTocal($scope.userdetails.target_kcals)
    },function (response) {
      $ionicLoading.hide();

      if (response.success) {
        console.log("User Details updated successfully.");        
      } else {
        console.log(JSON.stringify(response));
      }
      if (callBack) {
        callBack();
      }
    },
    function(error) {
      $ionicLoading.hide();
      console.log(JSON.stringify(error));
      if (callBack) {
        callBack();
      }
    });
  }

});
