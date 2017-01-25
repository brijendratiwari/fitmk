starter.controller('ForgotPasswordCtrl', function(
	$scope,
	$ionicHistory,
	$ionicViewSwitcher,
	$stateParams,
	$ionicLoading,
	AlertFactory,
	ApiCall,
  Api
	) {

	$scope.resetpassword = {
		email:""
	};

  // Perform the login action when the user submits the login form
  $scope.doSubmit = function() {
  	if ($scope.resetpassword.email.length > 0) {
  		$ionicLoading.show();

  		ApiCall.PostCall(Api.method.forgotPassword,
  		{
  			email:$scope.resetpassword.email
  		},
  		function(response) {
  			$ionicLoading.hide();
  			if (response.success) {
  				AlertFactory.showSuccess(response.message);
  				  	$ionicHistory.goBack(-1);
  			} else {
  				AlertFactory.showResponseError(response.message);
  			}
  		}, function (err) {
  			$ionicLoading.hide();
  			console.log(JSON.stringify(err));
  		});
  	} else {
  		AlertFactory.showAlert("Please enter email");
  	}
  };
  $scope.cancel = function() {
  	$ionicHistory.goBack(-1);
  };
});
