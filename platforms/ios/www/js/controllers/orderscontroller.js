starter.controller('OrdersCtrl',
	function(
		$scope,
		$rootScope,
		$state,
		Api,
		$ionicLoading,
		ApiCall,
		$ionicScrollDelegate,
		DateFormat,
		SharedData,
		AlertFactory
		){

		$scope.segmentActiveIndex = 0;
		resetValue();

		function resetValue() {
			$scope.orders = [];
			$scope.totalCount = 0;
			$scope.currentIndex = 0;
			$scope.moreOrdersAvailable = true;

			$ionicScrollDelegate.scrollTop();
		}

		$scope.$on('$ionicView.enter', function(){

			if (SharedData.getNeedRefreshOrders()) {
				SharedData.setNeedRefreshOrders(false);

				$scope.segmentActiveIndex = 0;
				if (SharedData.getIsFromPackageView()) {
					$scope.segmentActiveIndex = 1;
					SharedData.setIsFromPackageView(false);
				} 
				console.log("Enter");

				resetValue();
				$scope.loadMoreOrders($scope.segmentActiveIndex);
			}
		});

		$rootScope.$on('MenuItemChanged', function(event, args) {
			if (args.itemName == 'orders') {
				console.log("Menu");

				resetValue();
				$scope.loadMoreOrders($scope.segmentActiveIndex);
			}
		});


		$scope.getOrderInprogress = false;

		// Load More Data
		$scope.loadMoreOrders = function(segmentIndex) {
			if (!$scope.getOrderInprogress) {

				if (segmentIndex == $scope.segmentActiveIndex) {
					$scope.getOrderInprogress = true;
					$scope.currentIndex++;

					getOrder(function(){
						$scope.getOrderInprogress = false;

						if ($scope.totalCount > $scope.orders.length) {
							$scope.moreOrdersAvailable = true;
						} else {
							$scope.moreOrdersAvailable = false;
						}
						$scope.$broadcast('scroll.infiniteScrollComplete');
					});
				}
			}
			
		};


		$scope.ratingChanged = function(order) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.addRating,
			{
				order_id:order.order_id,
				rating:order.rating
			},
			function(response) {
				$ionicLoading.hide();

				if (!response.success) {
					AlertFactory.showResponseError(response,"Orders details not found!");
				} 
			},
			function(err){
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			});
		};


		$scope.shopOrderClick = function() {
			if ($scope.segmentActiveIndex != 0) {
				$scope.segmentActiveIndex = 0;

				resetValue();
				$scope.loadMoreOrders($scope.segmentActiveIndex);
			}
			
		};

		$scope.packageOrderClick = function() {
			if ($scope.segmentActiveIndex != 1) {
				$scope.segmentActiveIndex = 1;

				resetValue();
				$scope.loadMoreOrders($scope.segmentActiveIndex);
			}
		};

		$scope.viewOrderDetails = function(orderId) {
			$state.go('app.orderdetails/:orderType/:orderId', {
				orderType:'Shop Order',
				orderId:orderId
			});

		};

		$scope.viewPackageOrderDetails = function(orderId) {
			$state.go('app.orderdetails/:orderType/:orderId', {
				orderType:'Package Order',
				orderId:orderId
			});		
		};

		function getOrder(callback) {
			console.log("getOrder "+$scope.segmentActiveIndex);
			if ($scope.segmentActiveIndex == 0) {
				getUserShopOrder(callback);
			} else if ($scope.segmentActiveIndex == 1) {
				getUserPackageOrder(callback);
			}
		}

		function getUserShopOrder(callback) {
			$scope.isShowMsg = false;
			if ($scope.currentIndex == 1) {
				$ionicLoading.show();
			}
			
			ApiCall.PostCall(Api.method.getUserShopOrder,
			{
				page:$scope.currentIndex
			},
			function(response) {
				$ionicLoading.hide();
				if ($scope.segmentActiveIndex == 0) {
					if (response.success) {
						var orders = response.orders;
						angular.forEach(orders, function(value, key){
							$scope.orders.push(value);
						});
						$scope.totalCount = response.total_count;
					} else {
						if ($scope.orders.length == 0) {
							// AlertFactory.showResponseError(response,"Orders not found!");
							$scope.isShowMsg = true;
						}
					}
				}
				
				if (callback) {
					callback();
				}
			},
			function(err){
				if (callback) {
					callback();
				}

				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			});
		}

		function getUserPackageOrder(callback) {
			$scope.isShowMsg = false;
			if ($scope.currentIndex == 1) {
				$ionicLoading.show();
			}

			ApiCall.PostCall(Api.method.getUserPackageOrder,
			{
				page:$scope.currentIndex
			},
			function(response) {
				$ionicLoading.hide();

				if ($scope.segmentActiveIndex == 1) {
					if (response.success) {
						var orders = response.package_orders;
						angular.forEach(orders, function(value, key){
							$scope.orders.push(value);
						});
						$scope.totalCount = response.total_count;

					} else {
						if ($scope.orders.length == 0) {
							// AlertFactory.showResponseError(response,"Package orders not found!");
							$scope.isShowMsg = true;
						}
					}
				}
				

				if (callback) {
					callback();
				}
			},
			function(err){
				if (callback) {
					callback();
				}
				
				$ionicLoading.hide();
				console.log(JSON.stringify(err));
			});
		}


		function apply(){
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		}
		
	});
