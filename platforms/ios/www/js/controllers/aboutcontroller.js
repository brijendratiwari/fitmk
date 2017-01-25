starter.controller('AboutCtrl', function($scope) {

$scope.appVersion = "FitMK version 0.0.00.1 c 2016";

$scope.rateAppOnStore = function() {
		var isIPad = ionic.Platform.isIPad();
		var isIOS = ionic.Platform.isIOS();
		var isAndroid = ionic.Platform.isAndroid();

		if (isIOS || isIPad) {
			window.location.href = "itms-apps://itunes.apple.com/app/id/com.fitmk.fitmk";
		} else if (isAndroid) {
			window.location.href = "market://details?id=com.fitmk.fitmk";
		} 
	};

});
