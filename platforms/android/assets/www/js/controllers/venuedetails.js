starter.controller('VenueDetailsCtrl', function(
	$scope,
	$state,
	ApiCall,
	Api,
	SharedData,
	MapFactory,
	$ionicLoading){

	
		$scope.venue = SharedData.getSelectedVenue();

	$scope.$on('$ionicView.afterEnter', function(){

		var latLng = {lat:parseFloat($scope.venue.VenueLat), lng:parseFloat($scope.venue.VenueLong)};
		$scope.map = MapFactory.initializeMapWithUserIneraction(document.getElementById("venueLocationMap"),latLng,12);
		$scope.marker = MapFactory.addMarker($scope.venue.VenueName, latLng, $scope.map);
		console.log("LAT LNG "+JSON.stringify(latLng));
	});



	$scope.openMaps = function() {
		var isIPad = ionic.Platform.isIPad();
		var isIOS = ionic.Platform.isIOS();
		var isAndroid = ionic.Platform.isAndroid();

		if (isIOS || isIPad) {
			window.location.href = "maps://?ll=" + parseFloat($scope.venue.VenueLat) + "," + parseFloat($scope.venue.VenueLong)+"&q="+$scope.venue.VenueName;
		} else if (isAndroid) {
			window.location.href = "geo:" + $scope.venue.VenueLat + "," + $scope.venue.VenueLong+"?q="+ $scope.venue.VenueLat + "," + $scope.venue.VenueLong+"("+$scope.venue.VenueName+")";
		} else {
			window.location.href = "http://maps.google.com/maps?q="+ $scope.venue.VenueLat  +"," + $scope.venue.VenueLong +"("+ $scope.venue.VenueName + ")&iwloc=A&hl=es";
		}
	}
})