starter.controller('VenuesCtrl', function(
	$scope,
	$state,
	ApiCall,
	Api,
	ApiUrl,
	$rootScope,
	SharedData,
	$ionicLoading){

	getVenues();


	$rootScope.$on('MenuItemChanged', function(event, args) {
		if (args.itemName == 'venues') {
			getVenues();
		}
	});

	function getVenues() {
		$ionicLoading.show();

		ApiCall.PostCall(Api.method.getVenues,{},
			function(response) {
				$ionicLoading.hide();
				console.log("this is get venues data"+JSON.stringify(response));
				$scope.venues= response.venues;
			},
			function (err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			})
	}

	$scope.venuesSelected = function(venue) {
		SharedData.setSelectedVenue(venue);
		$state.go("app.venuedetails");
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