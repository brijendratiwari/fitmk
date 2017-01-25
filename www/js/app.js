// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var starter = angular.module('FitMK', ['ionic','ngCordova','chart.js','ionic-timepicker','datatables']);


var menuItems = [
{name:'home',            path:'app.home',               title:'Home',             hide:false},
{name:'profile',         path:'app.profile',            title:'Profile',          hide:false},
{name:'orders',          path:'app.orders',             title:'Orders',           hide:false},
{name:'pastbookings',    path:'app.pastbookings',       title:'Past Bookings',    hide:false},
{name:'usersessions',    path:'app.usersessions',       title:'Sessions',         hide:false},
{name:'mysessions',      path:'app.mysessions',         title:'My Sessions',      hide:false},
{name:'shop',            path:'app.shop',               title:'Shop',             hide:false},
{name:'drillinstructors',path:'app.drillinstructors',   title:'Drill Instructors',hide:false},
{name:'venues',          path:'app.venues',             title:'Venues',           hide:false},
{name:'packages',        path:'app.packages',           title:'Packages',         hide:false},
{name:'blog',            path:'app.blog',               title:'Blog',             hide:false}
];
var settingMenuItems = [
{name:'about',           path:'app.about',           title:'About'},
{name:'helpandfeedback', path:'app.helpandfeedback', title:'Help & Feedback'},
];


String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

/********************************************************/
/************************ App Run ***********************/
/********************************************************/

starter.run(function($ionicPlatform, $ionicHistory, $state, AlertFactory, ApiCall,Api, $ionicLoading, GetUserDetails, StateChecker, $rootScope) {
  $rootScope.menuHistoryStoredArr = ['app.home'];

  $ionicPlatform.registerBackButtonAction(function (event) { // hardware back button
    if (($ionicHistory.currentStateName() === 'app.home' && $rootScope.menuHistoryStoredArr.length == 1) || $ionicHistory.currentStateName() === 'login'){

      var exteAppConfirm = function(confirm) {
        if (confirm) {
          navigator.app.exitApp();
        } else {
          event.preventDefault();
        }
      };
      AlertFactory.showConfirmPromt('Alert!','Are you sure you want to exit App?',exteAppConfirm);
    } else {
      var found = false;
      var currentStateName = $ionicHistory.currentStateName();

      for (var i = menuItems.length - 1; i >= 0; i--) {
        var menuItem = menuItems[i];
        if (menuItem.path == currentStateName) {
          found = true;
        }
      }

      for (var i = settingMenuItems.length - 1; i >= 0; i--) {
        var settingMenuItem = settingMenuItems[i];
        if (settingMenuItem.path == currentStateName) {
          found = true;
        }
      }

      if (found && $rootScope.menuHistoryStoredArr.length > 1) {
        $ionicHistory.nextViewOptions({
          historyRoot: true
        });
        $state.go($rootScope.menuHistoryStoredArr[$rootScope.menuHistoryStoredArr.length-2]);
        $rootScope.menuHistoryStoredArr.pop();
      } else {
        $ionicHistory.goBack();
      }
    }
  }, 100);

  /********************************************************/
  /********************* Device Ready *********************/

  $ionicPlatform.ready(function() {


   initialiseFCM();

   /*********************  Analytics  **********************/
   StateChecker.runStateChecker();


   if (window.cordova) {
    /*********************  Keyboard  ***********************/


    if (window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    /*********** Local Notifications  Permission ************/

    cordova.plugins.notification.local.hasPermission(function (granted) {
      if (!granted) {
        cordova.plugins.notification.local.registerPermission(function (granted) {
          console.log('Notifications Permission has been granted: ' + granted);
        });
      } else {
        console.log('Notifications Permission ' + granted);
      }
    });

    /********************* Health Kit ***********************/

    var hKit = window.plugins.healthkit;
    if (hKit) {
      hKit.available(function(yes) {
          // HK is available
          var permissions = ['HKQuantityTypeIdentifierHeight','HKQuantityTypeIdentifierBodyMass',
          'HKQuantityTypeIdentifierActiveEnergyBurned','HKQuantityTypeIdentifierDistanceCycling',
          'HKQuantityTypeIdentifierStepCount','HKQuantityTypeIdentifierDistanceWalkingRunning','HKQuantityTypeIdentifierFlightsClimbed'];

          hKit.requestAuthorization({
            'readTypes': permissions,
            'writeTypes': permissions
          },function(success) {
            console.log('success');
            // store that you have permissions
          }, function(err) {
            console.log('error'+err);
          });
        }, function(no) {
          console.log('No healthkit available');
        });
    }
    if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    }
  });


//*******************  Firebase Notifications  **********************//

function initialiseFCM() {
  FCMPlugin.getToken(
    function(token){
      if (token) {

        window.localStorage.setItem('fcm_token', token);

        if (GetUserDetails().user_id && GetUserDetails().user_id.length > 0) {
         $ionicLoading.show();
         ApiCall.PostCall(
          Api.method.addPushNotiToken,
          {
            'push_noti_token':token
          },
          function (response) {
            $ionicLoading.hide();
            console.log("FCM Success"+JSON.stringify(response));

            if (response.success) {

            } else {
                // AlertFactory.showResponseError(response,"Login Failed.");
              }
            },
            function (error) {
              $ionicLoading.hide();

              console.log("FCM Error"+JSON.stringify(error));
              $ionicLoading.hide();
            }
            );
       }


       tokenRec();
     }
   },
   function(err){
    console.log('error retrieving token: ' + err);
  }
  );

  function tokenRec() {
    FCMPlugin.onNotification(
      function(data){
        if(data.wasTapped){
          if(typeof data.type != "undefined"){
             $rootScope.$broadcast('OnNotification', data);
          }
        } else{
          AlertFactory.showConfirmPromt('Notification','Are you sure you want to go?',function(res){
            if (res) {
              $rootScope.$broadcast('OnNotification', data);
            }
          });
        }
        console.log( JSON.stringify(data) );
      },
      function(msg){
        console.log('onNotification callback successfully registered: ' + msg);
      },
      function(err){
        console.log('Error registering onNotification callback: ' + err);
      }
      );
  } 
}
})

/********************************************************/
/********************* Config State *********************/
/********************************************************/

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('forgotpassword', {
    url: '/forgotpassword',
    templateUrl: 'templates/forgotpassword.html',
    controller: 'ForgotPasswordCtrl'
  })

  .state('registration', {
    url: '/registration',
    templateUrl: 'templates/registration.html',
    controller: 'RegistrationCtrl'
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })


  .state('app.pastbookings', {
    url: '/pastbookings',
    views: {
      'menuContent': {
        templateUrl: 'templates/pastbookings.html',
        controller: 'PastBookingsCtrl'
      }
    }
  })
  
  .state('app.orders', {
    url: '/orders',
    views: {
      'menuContent': {
        templateUrl: 'templates/orders.html',
        controller: 'OrdersCtrl'
      }
    }
  })

  .state('app.orderdetails/:orderType/:orderId', {
    url: '/orderdetails/:orderType/:orderId',
    views: {
      'menuContent': {
        templateUrl: 'templates/orderdetails.html',
        controller: 'OrdersDetailsCtrl'        
      }
    }
  })

  .state('app.drillinstructors', {
    url: '/drillinstructors',
    views: {
      'menuContent': {
        templateUrl: 'templates/drillinstructors.html',
        controller: 'DrillInstructorsCtrl'
      }
    }
  })

  .state('app.drillinstructordetails', {
    url: '/drillinstructordetails/:drillInstructorId',
    views: {
      'menuContent': {
        templateUrl: 'templates/drillinstructordetails.html',
        controller: 'DrillInstructorDetailsCtrl'
      }
    }
  })

  .state('app.blog', {
    url: '/blog',
    views: {
      'menuContent': {
        templateUrl: 'templates/blog.html',
        controller: 'BlogCtrl'
      }
    }
  })

  .state('app.blogdetails', {
    url: '/blogdetails/:blogId',
    views: {
      'menuContent': {
        templateUrl: 'templates/blogdetails.html',
        controller: 'BlogDetailsCtrl'
      }
    }
  })

  .state('app.shop', {
    url: '/shop',
    views: {
      'menuContent': {
        templateUrl: 'templates/shop.html',
        controller: 'ShopCtrl'
      }
    }
  })

  .state('app.venues', {
    url: '/venues',
    views: {
      'menuContent': {
        templateUrl: 'templates/venues.html',
        controller: 'VenuesCtrl'
      }
    }
  })

  .state('app.venuedetails', {
    url: '/venues/venuedetails',
    views: {
      'menuContent': {
        templateUrl: 'templates/venuedetails.html',
        controller: 'VenueDetailsCtrl'
      }
    }
  })

  .state('app.product', {
    url: '/product/:categoryId',
    views: {
      'menuContent': {
        templateUrl: 'templates/product.html',
        controller: 'ProductCtrl'
      }
    }
  })

  .state('app.addtocart', {
    url: '/addtocart/:productId/:categoryId',
    views: {
      'menuContent': {
        templateUrl: 'templates/addtocart.html',
        controller: 'AddToCart'
      }
    }
  })

  .state('app.viewcart', {
    url: '/viewcart',
    views: {
      'menuContent': {
        templateUrl: 'templates/viewcartpage.html',
        controller: 'ViewCart'
      }
    }
  })
  .state('app.checkout', {
    url: '/checkout',
    views: {
      'menuContent': {
        templateUrl: 'templates/checkoutpage.html',
        controller: 'CheckoutController'
      }
    }
  })
  .state('app.packages', {
    url: '/packages',
    views: {
      'menuContent': {
        templateUrl: 'templates/packages.html',
        controller: 'PackagesCtrl'
      }
    }
  })

  .state('app.usersessions', {
    url: '/usersessions',
    views: {
      'menuContent': {
        templateUrl: 'templates/usersessions.html',
        controller: 'UserSessionsCtrl'
      }
    }
  })

  .state('app.pastsession', {
    url: '/home/:pastsessionid',
    views: {
      'menuContent': {
        templateUrl: 'templates/pastsession.html',
        controller: 'PastSessionCtrl'
      }
    }
  })

  .state('app.mysessions', {
    url: '/mysessions',
    views: {
      'menuContent': {
        templateUrl: 'templates/mysessions.html',
        controller: 'MySessionsCtrl'
      }
    }
  })

  .state('app.calendar', {
    url: '/calendar/:sessionId',
    views: {
      'menuContent': {
        templateUrl: 'templates/calendar.html',
        controller: 'CalendarCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.updatestats', {
    url: '/profile/updatestats',
    views: {
      'menuContent': {
        templateUrl: 'templates/updatestats.html',
        controller: 'UpdatestatsCtrl'
      }
    }
  })

  .state('app.updateemail', {
    url: '/profile/updateemail',
    views: {
      'menuContent': {
        templateUrl: 'templates/updateemail.html',
        controller: 'UpdateemailCtrl'
      }
    }
  })

  .state('app.updatepassword', {
    url: '/profile/updatepassword',
    views: {
      'menuContent': {
        templateUrl: 'templates/updatepassword.html',
        controller: 'UpdatepasswordCtrl'
      }
    }
  })

  .state('app.about', {
    url: '/about',
    views: {
      'menuContent': {
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      }
    }
  })

  .state('app.termsofuse', {
    url: '/about/termsofuse',
    views: {
      'menuContent': {
        templateUrl: 'templates/termsofuse.html',
        controller: 'TermsofuseCtrl'
      }
    }
  })

  .state('app.privacypolicy', {
    url: '/about/privacypolicy',
    views: {
      'menuContent': {
        templateUrl: 'templates/privacypolicy.html',
        controller: 'PrivacypolicyCtrl'
      }
    }
  })

  .state('app.helpandfeedback', {
    url: '/helpandfeedback',
    views: {
      'menuContent': {
        templateUrl: 'templates/helpandfeedback.html',
        controller: 'HelpAndFeedbackCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback

  if (window.localStorage.getItem('user_detail')) {
    $urlRouterProvider.otherwise('/app/home');
  } else {
    $urlRouterProvider.otherwise('/login');
  }
});
