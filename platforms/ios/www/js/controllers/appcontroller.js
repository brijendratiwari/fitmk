starter.controller('AppCtrl', function($scope,
  $rootScope,
  $state,
  $ionicHistory,
  $ionicViewSwitcher,
  $ionicLoading,
  $timeout,
  $ionicPopover,
  Api,
  goTo,
  User,
  Cart,
  ApiCall,
  GetUserDetails,
  AlertFactory,
  FacebookFactory,
  SharedData,
  DailyCountFactory,
  DateFormat
  ) {
  $scope.accountStatus = {
    colour:"",
    message:""
  };

  $rootScope.lastSynchTime = "Never";

  $scope.isShowSessionAddUser = User.isInstructor();

  $scope.menuItemsStateNames = menuItems;

  $scope.settingsItemStateNames = settingMenuItems;

  $scope.goToHome = function() {
    getUserAccountStatus();

    var currentStateName = $state.current.name.replace("app.", "");
    if (currentStateName != 'home') {
      $rootScope.$broadcast("MenuItemChanged", {itemName:'home'});
      goTo.root();
    }
  };

  $scope.$on('$ionicView.afterEnter', function(){
    $scope.isShowSessionAddUser = User.isInstructor();

    for (var i = $scope.menuItemsStateNames.length - 1; i >= 0; i--) {
      var menuItems = $scope.menuItemsStateNames[i];
      if (menuItems.name == "mysessions") {
        menuItems.hide = !$scope.isShowSessionAddUser;
      }
    }
    setCartCount();
  });

  $rootScope.$on('OnNotification', function(event, args) {
    console.log("OnNotification"+JSON.stringify(args));

    if (args.type == 'shop') {
      var itemId = args.id;
      var catId = "";
      $state.go("app.addtocart",{productId:itemId, categoryId:catId});
    } else if (args.type == 'blog') {
      var blogId = args.id;
      $state.go("app.blogdetails", {blogId:blogId});
      //#/app/blogdetails/{{blog.id}}/{{blog.blog_type}}
    } else if(args.type == 'session') {

      SharedData.setPastBookingNotificationData(true, args.id);
      $ionicHistory.nextViewOptions({
        historyRoot: true
      });
      $state.go('app.pastbookings');
    }

  });

  $scope.logoutInProgress = false;

  $rootScope.$on('Logout', function(event, args) {
    if (GetUserDetails().passhash) {
      if (!$scope.logoutInProgress) {
       $scope.logoutInProgress = true;

       $ionicLoading.show();

       ApiCall.PostCall(Api.method.logout,
        undefined,
        function (response) {
         $scope.logoutInProgress = false;

         console.log('Logout Response :'+JSON.stringify(response));

         if (window.localStorage.getItem('FBToken')) {
          $ionicLoading.show();

          var fbLogoutSuccess = function(response) {
            console.log('FB Logout'+JSON.stringify(response));
            $ionicLoading.hide();
            console.log('success');
            logoutSuccess();
          };
          var fbLogoutError = function(error){
            $ionicLoading.hide();
            console.log('Facebook Logout error: ' + error);
            logoutSuccess();
          };
          FacebookFactory.logout(fbLogoutSuccess, fbLogoutError);
        } else {
          logoutSuccess();
        }
      },function (error) {
        $scope.logoutInProgress = false;
        
        $ionicLoading.hide();
        logoutSuccess();
      }
      );
     }
   }
 });

  $scope.menuSelected = function(itemMenu) {
    var currentStateName = $state.current.name.replace("app.", "");
    if (currentStateName != itemMenu.name) {
      $rootScope.menuHistoryStoredArr.push(itemMenu.path);
      $rootScope.$broadcast("MenuItemChanged", {itemName:itemMenu.name});
    }    
  }
  
  $scope.cartClick = function() {
    if ($rootScope.cartItemCount == 0) {
      AlertFactory.showAlert("No item in cart");
    } else {
      $state.go('app.viewcart');
    }
  };
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  function setCartCount() {
    Cart.getItemCount();
  }
  setCartCount();


  $scope.signout =  function() {
    $rootScope.$broadcast('Logout');
  };

  function logoutSuccess() {
    var fcmToken = window.localStorage.getItem('fcm_token');

    $ionicHistory.clearCache();
    $ionicHistory.clearHistory();
    window.localStorage.clear();
    $ionicViewSwitcher.nextDirection('back');
    $state.go('login');
    $ionicLoading.hide();

    window.localStorage.setItem('fcm_token', fcmToken);
  }

  $scope.convert = function (s)
  {
   return $('<div>').html(s).text();
 };

 $scope.openPopover = function($event) {
  SharedData.getUserCredits();

  if (!isFinite($rootScope.totalCredits)) {
    return;
  } 

  var  template = '<ion-popover-view class="credits_popover"><ion-header-bar><h1 class="title">'+$rootScope.totalCredits+' Credits</h1></ion-header-bar><ion-content><a class="button button-block bg-green-color" href="#/app/packages" ng-click="closePopover()">Buy more credits</a></ion-content></ion-popover-view>';
  
// <p style="text-align:center;width:100%;line-height: 35px;">Expire-15/08/2016</p>
$scope.popover = $ionicPopover.fromTemplate(template, {
  scope: $scope
});

$scope.popover.show($event);
};
$scope.closePopover = function() {
  $scope.popover.hide();
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

getUserAccountStatus();

function getUserAccountStatus() {
  ApiCall.PostCall(Api.method.userAccountStatus ,
    undefined,
    function(response){

      console.log('Get userAccountStatus '+JSON.stringify(response));
      if (response.success) {
        $scope.accountStatus.colour = response.colour;
        $scope.accountStatus.message = response.message;
      }
    },
    function(error){

    });
}

$rootScope.getLastSynchTime = function () {
 $ionicLoading.show();
 ApiCall.PostCall(Api.method.getLastSynchTime ,
  undefined,
  function(response){
    $ionicLoading.hide();
    console.log('Get getLastSynchTime '+JSON.stringify(response));
    if (response.success) {
      $scope.lastSynchTime = response.synchTime;
    }
  },
  function(error){
    $ionicLoading.hide();
  });
};

$rootScope.getLastSynchTime();


});
