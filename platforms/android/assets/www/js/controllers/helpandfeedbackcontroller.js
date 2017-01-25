starter.controller('HelpAndFeedbackCtrl', function(
  $scope,
  $state,
  $ionicViewSwitcher,
  $ionicLoading,
  ApiCall,
  Api,
  AlertFactory,
  GetUserDetails
) {


  $scope.feedback = {
    text:''
  };
  // Perform the login action when the user submits the login form
  $scope.submit = function() {
    console.log($scope.feedback.text);
    if ($scope.feedback.text.length > 0) {
      var userId = GetUserDetails().id;
      $ionicLoading.show();
      ApiCall.PostCall(Api.method.addFeedback,
      {
        'feedback':$scope.feedback.text,
      },
      function(response){
        $ionicLoading.hide();
        if (response.success) {
          $scope.feedback.text = '';
          AlertFactory.showSuccess(response.message);
        } else {
          AlertFactory.showResponseError(response, "Feedback not submited.");
        }
      }
    );
  } else {
    AlertFactory.showAlert("Please enter feedback.");
  }
};
});
