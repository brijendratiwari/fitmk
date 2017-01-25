starter.controller('DrillInstructorDetailsCtrl',
	function(
		$scope,
		$state,
		ApiCall,
		Api,
		ApiUrl,
		SharedData,
		MapFactory,
		$ionicLoading){


		$scope.drillInstructor = SharedData.getSelectedDrillInstructor();
		$scope.getDesingForImage = function(imgName) {

		if (imgName.length == 0) {
			return "background-color: #ccc";
		}
		else {
			return "background: url('" + ApiUrl.imgPath() + imgName + "') no-repeat scroll center center / 100% auto";
		}
	};
	});