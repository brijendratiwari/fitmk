starter.controller('OrdersDetailsCtrl',
	function(
		$scope,
		$state,
		Api,
		$ionicLoading,
		$stateParams,
		$ionicScrollDelegate,
		ApiCall,
		ApiUrl,
		DateFormat,
		AlertFactory
		){

		$scope.items = [];

		$scope.getTotal = function(price, qty) {
			return parseFloat(price) * parseInt(qty);
		};
		$scope.getOrderTotal = function(price, qty) {
			var total = 0;	
			angular.forEach($scope.items, function(value, key){
				total = total + (parseFloat(value.price)*parseInt(value.qty));
			});
			return total;
		};
		$scope.getKeyValue = function (options) {
			var optionsArr = [];
			angular.forEach(options, function(value, key){
				var optionType = Object.keys(value)[0];	
				var optionTypeValue = value[optionType];
				optionsArr.push(optionType + " : " + optionTypeValue);
			});
			return optionsArr;
		};

		$scope.getPackageOrderTotal = function(price, qty) {
			var total = 0;	
			angular.forEach($scope.items, function(value, key){
				total = total + parseFloat(value.price);
			});
			return total;
		};

		$scope.getImgPath = function(imgName) {
			return ApiUrl.imgPath()+imgName;
		};

		$scope.orderType = $stateParams.orderType;
		var orderId = $stateParams.orderId;
		if ($scope.orderType == 'Shop Order') {
			getUserOrderItems(orderId);
		} else if ($scope.orderType == 'Package Order') {
			getPackageOrderDetails(orderId);
		}

		function getUserOrderItems(orderId) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.getUserOrderItems,
			{
				order_id:orderId
			},
			function(response) {
				$ionicLoading.hide();

				if (response.success) {
					$scope.items = response.order_items;
					resizeScrollview();
					if ($scope.items.length > 0) {
						$scope.collectionInfo = $scope.items[0].collectionInfo;
					};
				} else {
					AlertFactory.showResponseError(response,"Orders details not found!");
				}
			},
			function(err){
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			});
		}

		function getPackageOrderDetails(orderId) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.getPackageOrderDetails,
			{
				order_id:orderId
			},
			function(response) {
				$ionicLoading.hide();

				if (response.success) {
					$scope.items = response.Package_items;
					resizeScrollview();
				} else {
					AlertFactory.showResponseError(response,"Orders details not found!");
				}
			},
			function(err) {
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			});
		}

		function resizeScrollview () {
			setTimeout(function(){
				$ionicScrollDelegate.resize();
				console.log('Ref');
			}, 5);
		}
	});