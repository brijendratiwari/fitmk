starter.controller('PackagesCtrl',
	function(
		$scope,
		$rootScope,
		$state,
		Api,
		$ionicLoading,
		ApiCall,
		ApiUrl,
		AlertFactory,
		Paypal,
		SharedData,
		GetUserDetails,
		$ionicScrollDelegate
		){

		// $scope.allPackages 
		//$scope.packages

		function resetArrays() {
			$scope.renewalDate = "";

			$scope.allUserPackages = [];
			$scope.userPackages = [];

			$scope.allOtherPackages = [];
			$scope.otherPackages = [];

			$scope.allMonthlyPackages = [];
			$scope.monthlyPackages = [];

			$scope.allOfferPackages = [];
			$scope.offerPackages = [];

			$scope.categories = ["All"];
			$scope.categoryType = "All";
			$scope.packageSearchKey = "";
		}
		resetArrays();

		$rootScope.$on('MenuItemChanged', function(event, args) {
			if (args.itemName == 'packages') {
				resetArrays();
				getPackages();
			}
		});


		$scope.packageSearch = function() {
			$ionicScrollDelegate.scrollTop();
			filterPackages();
		};

		$scope.categoryChange = function() {
			$scope.userPackages = [];
			$scope.otherPackages = [];

			$ionicLoading.show();

			setTimeout(function(){
				filterPackages();
				$ionicLoading.hide();
			},300);
		};

		function getPackages(date) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.getPackages,
				null,
				function(response) {
					$ionicLoading.hide();

					if (response.success) {
						$scope.allUserPackages = []
						$scope.allMonthlyPackages = [];
						$scope.allOtherPackages = []
						$scope.allOfferPackages = []

						$scope.categories = ["All"];

						var result = response.result;
						if(result) {
							$scope.renewalDate = result.renewal_date;

							var userPackage = result.userPackage;							
							var offersData = result.offersData;
							var otherData = result.otherData;
							var monthlyData = result.monthlyData;

							if (!userPackage) {
								userPackage = [];
							}
							if (!monthlyData) {
								monthlyData = [];
							}
							if (!otherData) {
								otherData = [];
							}
							if (!offersData) {
								offersData = [];
							}


							var allPackages = userPackage.concat(offersData);
							allPackages = allPackages.concat(otherData);
							allPackages = allPackages.concat(monthlyData);

							angular.forEach(allPackages,function(package,index){
								var index = $scope.categories.indexOf(package.PackageType);
								if(index == -1) {
									$scope.categories.push(package.PackageType);
								}
							//
							// if (package.IsEnabled == "1") {
							// 	if (package.PackageType == "PAYG") {
							// 		paygEnabledPackages.push(package);
							// 	} else {
							// 		otherEnabledPackages.push(package);
							// 	}
							// } else {
							// 	if (package.PackageType == "PAYG") {
							// 		paygDisabledPackages.push(package);
							// 	} else {
							// 		otherDisabledPackages.push(package);
							// 	}
							// }
						});

						// $scope.allPackages = paygEnabledPackages.concat(otherEnabledPackages);
						// $scope.allPackages = $scope.allPackages.concat(paygDisabledPackages);
						// $scope.allPackages = $scope.allPackages.concat(otherDisabledPackages);

						$scope.allUserPackages = userPackage;
						$scope.allMonthlyPackages = monthlyData;
						$scope.allOtherPackages = otherData;
						$scope.allOfferPackages = offersData;

						$scope.userPackages = $scope.allUserPackages;
						$scope.monthlyPackages = $scope.allMonthlyPackages;
						$scope.otherPackages = $scope.allOtherPackages;
						$scope.offerPackages = $scope.allOfferPackages;
					
					}
				} else {
					AlertFactory.showResponseError(response, "Packages not found.");
				}
			},
			function(err){
				$ionicLoading.hide();
			});
		}

		function filterPackages() {
			$scope.userPackages = [];
			$scope.monthlyPackages = [];
			$scope.otherPackages = [];
			$scope.offerPackages = [];
			
			if ($scope.categoryType == "All") {
				if ($scope.allUserPackages.length > 0) {
					$scope.userPackages = $scope.allUserPackages;
				}
				if ($scope.allMonthlyPackages.length > 0) {
					$scope.monthlyPackages = $scope.allMonthlyPackages;
				}
				if ($scope.allOtherPackages.length > 0) {
					$scope.otherPackages = $scope.allOtherPackages;
				}
				if ($scope.allOfferPackages.length > 0) {
					$scope.offerPackages = $scope.allOfferPackages;
				}
			} else {
				angular.forEach($scope.allUserPackages,function(package,index){
					if (package.PackageType == $scope.categoryType) {
						$scope.userPackages.push(package);
					}
				});

				angular.forEach($scope.allMonthlyPackages,function(package,index){
					if (package.PackageType == $scope.categoryType) {
						$scope.monthlyPackages.push(package);
					}
				});

				angular.forEach($scope.allOtherPackages,function(package,index){
					if (package.PackageType == $scope.categoryType) {
						$scope.otherPackages.push(package);
					}
				});

				angular.forEach($scope.allOfferPackages,function(package,index){
					if (package.PackageType == $scope.categoryType) {
						$scope.offerPackages.push(package);
					}
				});
			}

			$ionicScrollDelegate.resize();
			$ionicScrollDelegate.scrollTop();
			apply();
		}


		function apply(){
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		}


		$scope.getImagePath = function(imgName) {
			return ApiUrl.imgPath() + imgName;
		};

		getPackages();

		/*******************************************************************************************************/
		/************************************* Purchase Now *******************************************************/

		$scope.purchaseNow = function(package) {



			if (package.PackageType == "PAYG") {
				AlertFactory.showConfirmPromt("Are you sure you want to buy these credits? ", "Clicking OK will redirect you to checkout", 
					function(res){
						if (res) {
							buyPackagesByPaypal(package.packageId);
						};
					});
			} else {
				AlertFactory.showConfirmPromt("Are you sure you want to choose this package? ", "Clicking OK will either redirect you to GoCardless to setup a direct debit, or if you have an existing account it will charge this amount on your next renewal day.",
					function(res){
						if (res) {
							buyPackagesByGoCardless(package.packageId);
						};
					});
			}
		};

		function buyPackagesByPaypal(packageId) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.buyPackages,
			{
				package_id:packageId
			},
			function(response) {
				var message = response.message;
				openInAppBrowserForPaypal(message+"/"+GetUserDetails().passhash, response.url.success_url, response.url.failed_url);
				$ionicLoading.hide();
			},
			function(error) {
				$ionicLoading.hide();
			});
		}

		function buyPackagesByGoCardless(packageId) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.buyPackages,
			{
				package_id:packageId
			},
			function(response) {
				$ionicLoading.hide();

				if (response.success) {
					var redierct_url = response.redierct_url;
					if (redierct_url) {
						var GC_sessiontoken = response.GC_sessiontoken;
						var redirectUrlArr = redierct_url.split("/");
						var redirect_flow_id = redirectUrlArr[redirectUrlArr.length-1];
						var success_url = response.success_url;

						openInAppBrowserForGoCardLess(redierct_url, success_url, GC_sessiontoken, redirect_flow_id, packageId);
					} else {
						SharedData.getUserCredits();

						AlertFactory.showSuccess(response.message, function(){
							goToOrdersPage();
						});
					}

				} else {
					AlertFactory.showResponseError(response, "Payment Failed");
				}
			},
			function(error) {
				$ionicLoading.hide();
			});
		}

		function goCardLessPaymentConfirm(GC_sessiontoken, redirect_flow_id, package_id) {
			$ionicLoading.show();
			ApiCall.PostCall(Api.method.confirmPayment,
			{
				package_id:package_id,
				GC_sessiontoken:GC_sessiontoken,
				redirect_flow_id:redirect_flow_id
			},
			function(response) {					
				$ionicLoading.hide();
				if (response.success) {
					SharedData.getUserCredits();

					AlertFactory.showSuccess(response.message, function(){
						goToOrdersPage();
					});
				} else {
					AlertFactory.showResponseError(response, "Payment Failed");
				}
			},
			function(error) {
				$ionicLoading.hide();

			});
		}

		function goToOrdersPage() {
			SharedData.setIsFromPackageView(true);
			SharedData.setNeedRefreshOrders(true);
			$state.go("app.orders");
		}
		/******************************************************************************************************/
		/*************************************  In AppBrowser ************************************************/

		function openInAppBrowserForPaypal(url, successUrl, failedUrl) {
		// Open In App Browser
		var inAppBrowserRef = cordova.InAppBrowser.open(url, '_blank', 'location=no,clearcache=yes,toolbar=yes');
		inAppBrowserRef.addEventListener('loadstart', loadStartCallBack);
		inAppBrowserRef.addEventListener('loadstop', loadStopCallBack);
		inAppBrowserRef.addEventListener('loaderror', loadErrorCallBack);
		// inAppBrowserRef.addEventListener('exit', browserClose);

		function loadStartCallBack(event) {
			console.log("Url : "+event.url);
			if (inAppBrowserRef == undefined || !inAppBrowserRef) {
				$ionicLoading.show({'template':'loading please wait ...'});
			}

			if (event.url == successUrl) {
				paymentSuccess();
			} else if (event.url == failedUrl) {
				paymentFailed();
			}
		}

		function loadStopCallBack() {
			if (inAppBrowserRef != undefined) {
				$ionicLoading.hide();
				inAppBrowserRef.show();
				// inAppBrowserRef.executeScript({ code: "window.localStorage.setItem('user_token', '"+ GetUserDetails().passhash +"');" }, null);
			}
		}

		function loadErrorCallBack(params) {
			var scriptErrorMesssage = "alert('Sorry we cannot open that page. Message from the server is : " + params.message + "');"
			inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);
			closeInAppBrowser();
		}

		function closeInAppBrowser() {
			inAppBrowserRef.close();
			inAppBrowserRef = undefined;
		}

		function executeScriptCallBack(params) {
			if (params[0] == null) {
				console.log("Sorry we couldn't open that page. Message from the server is : '"
					+ params.message + "'");
			}
		}

		function paymentSuccess() {
			closeInAppBrowser();
			SharedData.getUserCredits();

			AlertFactory.showSuccess("Payment Success", function(){
				goToOrdersPage();
			});
		}

		function  paymentFailed() {
			closeInAppBrowser();
			AlertFactory.showError("Payment Failed");
		}
	}

	function openInAppBrowserForGoCardLess(url, successUrl,GC_sessiontoken, redirect_flow_id, package_id) {
		// Open In App Browser
		var inAppBrowserRef = cordova.InAppBrowser.open(url, '_blank', 'location=no,clearcache=yes,toolbar=yes');
		inAppBrowserRef.addEventListener('loadstart', loadStartCallBack);
		inAppBrowserRef.addEventListener('loadstop', loadStopCallBack);
		inAppBrowserRef.addEventListener('loaderror', loadErrorCallBack);
		// inAppBrowserRef.addEventListener('exit', browserClose);

		function loadStartCallBack(event) {
			console.log("Url : "+event.url);
			if (inAppBrowserRef == undefined || !inAppBrowserRef) {
				$ionicLoading.show({'template':'loading please wait ...'});
			}

			if (event.url.indexOf(successUrl) !== -1) {
				processPayment();
			};
		}

		function loadStopCallBack() {
			if (inAppBrowserRef != undefined) {
				$ionicLoading.hide();
				inAppBrowserRef.show();
				// inAppBrowserRef.executeScript({ code: "window.localStorage.setItem('user_token', '"+ GetUserDetails().passhash +"');" }, null);
			}
		}

		function loadErrorCallBack(params) {
			var scriptErrorMesssage = "alert('Sorry we cannot open that page. Message from the server is : " + params.message + "');"
			inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);
			closeInAppBrowser();
		}

		function closeInAppBrowser() {
			inAppBrowserRef.close();
			inAppBrowserRef = undefined;
		}

		function executeScriptCallBack(params) {
			if (params[0] == null) {
				console.log("Sorry we couldn't open that page. Message from the server is : '"
					+ params.message + "'");
			}
		}

		function processPayment() {
			closeInAppBrowser();
			goCardLessPaymentConfirm(GC_sessiontoken, redirect_flow_id, package_id);
		}		
	}
});
