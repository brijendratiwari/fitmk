starter.controller('MySessionsCtrl', function(
	$scope,
	$rootScope,
	$state,
	$ionicLoading,
	Api,
	ApiUrl,
	ApiCall,
	AlertFactory,
	$ionicScrollDelegate,
	DateFormat
	){
	$scope.$on('$ionicView.afterEnter', function(){

		
	});

	resetValue();

	function resetValue() {
		$scope.bookedSessions = [];
		$scope.totalCount = 0;
		$scope.currentIndex = 0;
		$scope.moreBookesSessionsAvailable = true;
		$ionicScrollDelegate.scrollTop();
	}

	$rootScope.$on('MenuItemChanged', function(event, args) {
		if (args.itemName == 'mysessions') {
			resetValue();
			$scope.loadMoreBookedSessions();
		}
	});


	$scope.dateCount = 0;
	$scope.currentDate = DateFormat.dateByAddingDayInCurrentDate(0);

	// Load More Data
	$scope.loadMoreBookedSessions = function() {
		$scope.currentIndex++;

		getAllBookedSessionsCalendar(function(){
			if ($scope.totalCount > $scope.bookedSessions.length) {
				$scope.moreBookesSessionsAvailable = true;
			} else {
				$scope.moreBookesSessionsAvailable = false;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		});
	};

	
	$scope.dateToStr = function(date) {
		return DateFormat.dateToStrForMonthName(date);
	};

	$scope.dateCount = 0;
	$scope.leftArrowDateClick = function() {
		$scope.dateCount = $scope.dateCount - 1;
		$scope.currentDate = DateFormat.dateByAddingMonthInCurrentDate($scope.dateCount);
		
		resetValue();
		$scope.loadMoreBookedSessions();
	};

	$scope.rightArrowDateClick = function() {
		$scope.dateCount = $scope.dateCount + 1;
		$scope.currentDate = DateFormat.dateByAddingMonthInCurrentDate($scope.dateCount);

		resetValue();
		$scope.loadMoreBookedSessions();
	};



	$scope.getImgPath = function(imgName) {
		return ApiUrl.imgPath()+imgName;
	};
	
	function getAllBookedSessionsCalendar(callback) {
		$scope.isShowMsg = false;

		var firstDay = new Date($scope.currentDate.getFullYear(), $scope.currentDate.getMonth(), 1);
		var lastDay = new Date($scope.currentDate.getFullYear(), $scope.currentDate.getMonth() + 1, 0);

		// $ionicLoading.show();
		ApiCall.PostCall(Api.method.getAllBookedSessionsCalendar,
		{
			page:$scope.currentIndex,
			start: DateFormat.dateToStrForMonth(firstDay),
			end:DateFormat.dateToStrForMonth(lastDay)
		},
		function(response) {
			$ionicLoading.hide();
			if (response.success) {
				var bookedSessions = response.session_list;
				angular.forEach(bookedSessions, function(value, key){
					$scope.bookedSessions.push(value);
				});
				$scope.totalCount = response.total_count;
			} 
			if ($scope.bookedSessions.length == 0) {
				$scope.isShowMsg = true;
			}
			if (callback) {
				callback();
			}
		},
		function(err){
			$ionicLoading.hide();
			console.log(JSON.stringify(err));
		});
	}

});
