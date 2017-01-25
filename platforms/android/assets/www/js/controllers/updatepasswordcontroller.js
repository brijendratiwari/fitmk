
starter.controller('UpdatepasswordCtrl', function(
  $scope,
  $ionicViewSwitcher,
  $ionicLoading,
  $ionicHistory,
  $ionicPopup,
  ApiCall,
  GetUserDetails,
  Api,
  AlertFactory
) {
 

  var updatePassword = function() {
    $ionicLoading.show();

    ApiCall.PostCall(Api.method.changePassword, {
      "old_pass":$scope.update.oldpassword,
      "new_pass":$scope.update.newpassword,
      "confirm_pass":$scope.update.reenterpassword
    },function (response) {
      $ionicLoading.hide();

      console.log(JSON.stringify(response));
      if (response.success) {
        AlertFactory.showSuccess(response.message,function(res){
          $ionicHistory.goBack();
        });
      } else {
        AlertFactory.showResponseError(response, "Password not updated.");
      }
    },
    function(error){
      $ionicLoading.hide();
      AlertFactory.showError(JSON.stringify(error));
    }
  );
  };

  $scope.update = {
    newpassword:'',
    reenterpassword:''
  };

  $scope.submit = function() {
    if (!$scope.update.newpassword) {
      AlertFactory.showWithTitle('Update Password !','Please Enter New Password');
    } else if (!$scope.update.reenterpassword) {
      AlertFactory.showWithTitle('Update Password !','Please Re-Enter Password');
    } else if ($scope.update.newpassword != $scope.update.reenterpassword) {
      AlertFactory.showWithTitle('Update Password !','Passwords do not match.');
    } else {
      updatePassword();
    }
  };
});
