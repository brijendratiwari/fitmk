starter.controller('DrillInstructorsCtrl', function(
	$scope,
	$state,
	ApiCall,
	Api,
	ApiUrl,
	$rootScope,
	SharedData,
	$ionicLoading){

	getDI();

	$rootScope.$on('MenuItemChanged', function(event, args) {
		if (args.itemName == 'drillinstructors') {
			getDI();
		}
	});

	function getDI() {
		$ionicLoading.show();

		ApiCall.PostCall(Api.method.getDI,{},
			function(response) {
				$ionicLoading.hide();
				console.log("this is get drillinstructors data"+JSON.stringify(response));
				$scope.drillInstructors= response.dis;
			},
			function (err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			})
	}

	$scope.drillInstructorSelected = function(drillInstructor) {
		SharedData.setSelectedDrillInstructor(drillInstructor);
		$state.go("app.drillinstructordetails");
	};

	$scope.getDesingForImage = function(imgName) {
		if (imgName.length == 0) {
			return "background-color: #ccc";
		}
		else {
			return "background: url('" + ApiUrl.imgPath() + imgName + "') no-repeat scroll center center / 100% auto";
		}
	};
})