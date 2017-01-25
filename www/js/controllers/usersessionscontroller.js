starter.controller('UserSessionsCtrl',
	function(
		$scope,
		$rootScope,
		$state,
		Api,
		$ionicLoading,
		ApiCall,
		DateFormat,
		AlertFactory,
		$ionicScrollDelegate,
		SharedData
		){

		$rootScope.$on('MenuItemChanged', function(event, args) {
			if (args.itemName == 'usersessions') {
				resetData();
			}
		});

		function getUserSessions (date) {
			$scope.isShowMsg = false;

			$ionicLoading.show();
			ApiCall.PostCall(Api.method.getSessionList,
			{
				date:DateFormat.dateToStrSeparateByDash(date)
			},
			function(response) {
				$ionicLoading.hide();
				if (response.success) {
					var sessions = response.sessions;
					$scope.sessions = sessions;
				} else {
					// AlertFactory.showResponseError(response, "No sessions found.");
					$scope.sessions = [];
				}
				if ($scope.sessions.length == 0) {
					$scope.isShowMsg = true;
				}
				$ionicScrollDelegate.scrollTop();
			},
			function(err){
				$ionicLoading.hide();
			});
		}
		
		$scope.bookNow = function (session) {
			AlertFactory.showConfirmPromt("Alert!", "Are you sure you want to book this session?", 
				function(res){
					if (res) {
						$ionicLoading.show();
						ApiCall.PostCall(Api.method.bookSession,
						{
							session_id:session.SessionId
						},
						function(response) {
							$ionicLoading.hide();
							if (response.success) {
								SharedData.getUserCredits();
								session.booked = "Yes";
								AlertFactory.showSuccess(response.message);
							} else {
								AlertFactory.showResponseError(response, "Session not booked.");
							}
						},
						function(err){
							$ionicLoading.hide();
						});
					};
				});			
		};

		$scope.cancelSession = function (session) {
			AlertFactory.showConfirmPromt("Are you sure you want to cancel this session?", "Please be aware that if this booking is in less than 6 hours your credit will not be refunded.", 
				function(res){
					if (res) {
						$ionicLoading.show();
						ApiCall.PostCall(Api.method.cancelSession,
						{
							session_id:session.SessionId
						},
						function(response) {
							$ionicLoading.hide();
							if (response.success) {
								SharedData.getUserCredits();
								session.booked = "No";
								AlertFactory.showSuccess(response.message);
							} else {
								AlertFactory.showResponseError(response, "Session not canceled.");
							}
						},
						function(err){
							$ionicLoading.hide();
						});
					};
				});			
		};

		$scope.prevDateChange = function() {
			console.log("Prev");
			$scope.scheduleDate = new Date(new Date($scope.scheduleDate).getTime() - (60 * 60 * 24 * 1000));
			getUserSessions($scope.scheduleDate);
		};

		$scope.nextDateChange = function() {
			console.log("Next");
			$scope.scheduleDate = new Date(new Date($scope.scheduleDate).getTime() + (60 * 60 * 24 * 1000));
			getUserSessions($scope.scheduleDate);
		};

		

		$scope.onSchduleDateChange = function() {
			getUserSessions($scope.scheduleDate);
		};

		function resetData() {
			getUserSessions(new Date());
			$scope.scheduleDate = new Date();
			$scope.av_credits = 0;
			$scope.sessions = [];
		}
		
		resetData();
		
	});
