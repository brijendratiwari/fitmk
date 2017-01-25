
starter.controller('UpdateemailCtrl', function(
  $scope,
  $ionicHistory,
  $ionicViewSwitcher,
  $stateParams,
  $ionicPopup,
  $ionicLoading,
  ApiCall,
  Api,
  GetUserDetails,
  AlertFactory
) {

  $scope.email = GetUserDetails().email;


  $scope.submitData = function(changeEmailForm) {
    if (changeEmailForm.email.$viewValue == undefined) {
      AlertFactory.showAlert('Please enter email');
    } else if (changeEmailForm.email.$invalid) {
      AlertFactory.showAlert('Please enter valid email');
    } else {
      $ionicLoading.show();
      ApiCall.PostCall(Api.method.changeEmail, {
        "email":changeEmailForm.email.$viewValue
      },function (response) {
        $ionicLoading.hide();

        if (response.success) {
          AlertFactory.showSuccess(response.message);
        } else {
          AlertFactory.showResponseError(response, "Email not updated.");
        }
      });
    }
  };
});
