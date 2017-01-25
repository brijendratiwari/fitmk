starter.controller('CalendarCtrl', function(
	$scope,
	$ionicLoading,
	$stateParams,
	$ionicPopover,
	Api,
	$ionicScrollDelegate,
	ApiUrl,
	ApiCall,
	AlertFactory
	){
	$scope.$on('$ionicView.afterEnter', function(){

		
	});
	$scope.userSearchBar = {text:'',id:''};
	$scope.usersList = [];

	$scope.save = function() {
		var userIds = [];
		angular.forEach($scope.usersList, function(val, key){
			if (val.Attended || val.Attended == "1") {
				userIds.push(val.id);
			}
		});


		$ionicLoading.show();
		ApiCall.PostCall(Api.method.addNotesToSession,
		{
			session_id:$stateParams.sessionId,
			ext_notes:$scope.sessionData.extra_notes,
			injuries:$scope.sessionData.injuries,
			booked_by:userIds
		},
		function(response) {
			$ionicLoading.hide();
			if (response.success) {
				AlertFactory.showSuccess(response.message);
			} else {
				AlertFactory.showResponseError(response, "Session not saved");
			}
		},
		function(err){
			$ionicLoading.hide();
			console.log(JSON.stringify(err));
		});
	};

	$scope.getImgPath = function(imgName) {
		return ApiUrl.imgPath()+imgName;
	};

	$scope.getBooleanValue = function(value) {
		if (value == true || value == "true" || value == "1") {
			return true;
		} 
		return false;
	};

	$scope.isSearching = false;
	$scope.searchText = "";

	$scope.searchUser = function() {
		// var elementHeight = document.querySelector(".search-bar-textbox").offsetHeight;
		// scrollToPos = elementHeight;
		// $ionicScrollDelegate.scrollTo(0, scrollToPos, true);

		$scope.isNextSearch = true;
		$scope.searchText = $scope.userSearchBar.text;

		if (!$scope.isSearching) {
			searchUsers($scope.searchText); 
		};
		
	};

	// $('.search-bar-textbox').click(function(){
	// 	$('html, body').animate({
	// 		scrollTop: $(".search-bar-textbox").offset().top
	// 	}, 500);
	// })

	$scope.selectedUser = function(user) {
		$scope.userSearchBar.text = user.label;
		$scope.userSearchBar.id = user.value;

		$scope.closePopover();
	};

	$scope.addUsersToSession = function() {
		if ($scope.userSearchBar.text.length == 0) {
			return;
		};

		$ionicLoading.show();
		ApiCall.PostCall(Api.method.addUsersToSession,
		{
			session_id:$stateParams.sessionId,
			session_userid: $scope.userSearchBar.id
		},
		function(response) {
			$ionicLoading.hide();
			if (response.success) {
				if (!$scope.usersList) {
					$scope.usersList = [];
				}
				$scope.usersList.push({
					id:$scope.userSearchBar.id,
					first_name:$scope.userSearchBar.text
				});

				AlertFactory.showSuccess(response.message);
			} else {
				AlertFactory.showResponseError(response, "User not added.");
			}
		},
		function(err){
			$ionicLoading.hide();
			console.log(JSON.stringify(err));
		});
	};

	function searchUsers(userText) {
		if (userText.length == 0) {
			$scope.isSearching = false;
			$scope.isNextSearch = false;
			return;
		};

		$scope.isSearching = true;
		$scope.isNextSearch = false;

		ApiCall.PostCall(Api.method.getNotBookedUser,
		{
			session_id:$stateParams.sessionId,
			name:userText
		},
		function(response) {			
			if (response.success) {
				$scope.closePopover();

				$scope.searchUserList = response.user_list;
				if ($scope.searchUserList.length > 0) {
					$scope.openPopover();
				};
			};

			$scope.isSearching = false;
			if ($scope.isNextSearch) {
				$scope.isNextSearch = false;
				searchUsers($scope.searchText);
			};
		},
		function(err){
			$scope.closePopover();

			console.log(JSON.stringify(err));			
		});
	}

	getUserInfoForView();

	console.log("its a calendar controller");

	function getUserInfoForView() {

		$ionicLoading.show();
		ApiCall.PostCall(Api.method.getUserInfoForView,
		{
			session_id:$stateParams.sessionId
		},
		function(response) {
			$ionicLoading.hide();
			if (response.success) {
				$scope.sessionData = response.sessionData[0];
				$scope.usersList = response.booked_user;
			};
		},
		function(err){
			$ionicLoading.hide();
			console.log(JSON.stringify(err));
		});
	}



	$scope.openPopover = function() {
		var template = '<ion-popover-view class="session_PopOver"><ion-content class="content"><div ng-repeat="user in searchUserList" style="padding:2px;height:33px;"><a style="color:black;" ng-click="selectedUser(user)">{{user.label}}</a></div></ion-content></ion-popover-view>';

		$scope.popover = $ionicPopover.fromTemplate(template, {
			scope: $scope
		});

		var searchbarview = document.getElementById('searchbarview');
		$scope.popover.show(searchbarview);
	};
	$scope.closePopover = function() {
		if ($scope.popover) {
			$scope.popover.hide();
		};
	};
	$scope.$on('$destroy', function() {
		if ($scope.popover) {
			$scope.popover.remove();
		}
	});
	$scope.$on('popover.hidden', function() {
		if ($scope.popover) {
			$scope.popover.remove();
		}
	});
	$scope.$on('popover.removed', function() {

	});
});
