// API Calling
starter.constant('Api', {
  method:{
    login:'login',
    logintoken:'logintoken',
    socialSignIn:'signUpWithFb',
    register:'register',
    registration:'registration',
    changeEmail:'changeEmail',
    forgotPassword:'forgot_password',
    addPushNotiToken:'addPushNotiToken',
    userAccountStatus:'userAccountStatus',
    parq:'parq',
    
    getLastSynchTime:'getLastSynchTime',
    
    getItemView:'getItemView',
    getBlowView:'getBlowView',
    
    getUserCredits: 'getUserCredits',
    
    addDailyCount:'addDailyCount',
    getDailyCounts:'getDailyCounts',

    getPackages:'getPackage',
    buyPackages:'buyPackages',
    confirmPayment:'confirm',
    
    getTarget:"getTarget",
    setTarget:"setTarget",

    saveSession:'saveSession',
    getAllSessions:'getAllSessions',
    deleteSession:'deleteSession',

    insertMeasurements: 'addMeasurements',
    getMeasurements:'getMeasurements',

    getSessionList: 'sessionList',
    bookSession: 'bookSession',
    cancelSession: 'cancelSession',
    getBookedSessions: 'getBookedSessions',
    getAllBookedSessions: 'getAllBookedSessions',
    getBookedSessionData: 'getBookedSessionData',
    addPastBookingComment: 'addPastBookingComment',
    pastSessionRating: 'pastSessionRating',
    getCalendarBookedSessions: 'getCalendarBookedSessions',

    getAllBookedSessionsCalendar: 'getAllBookedSessionsCalendar',
    getUserInfoForView: 'getSessionInfoForView',
    getNotBookedUser: 'getNotBookedUser',
    addUsersToSession: 'addUsersToSession',
    addNotesToSession: 'addNotesToSession',
    
    getBlogs:'getBlog',
    fullBlog: 'fullBlog',
    
    getDI:'getDI',
    
    getShopCategories:'getCategory',
    getProducts:'getProduct',
    getProductDetails:'getProductDetails',

    addToCart:'addToCart',
    getCartItems:'getCartItems',
    removeCartItem:'removeCartItem',
    updateCart:'updateCart',
    shopCheckout:'shopCheckout',

    addFeedback:'addFeedback',

    getUserShopOrder:'getUserShopOrder',
    getUserPackageOrder:'getUserPackageOrder',
    addRating: 'addRating',
    getUserOrderItems: 'getUserOrderItems',
    getPackageOrderDetails: 'getPackageOrderDetails',

    updateUserDetails:'updateUserDetails',
    changePassword:'changePassword',
    getVenues:'getVenues',

    logout:'logout'
  }
});

starter.factory('UserAuth', function($state, $ionicHistory, $ionicViewSwitcher, $ionicLoading, $rootScope){
  return {
    CheckToken : function(response) {
      if (response.data.error && response.data.error.msg == 'Invalid Token') {
        $ionicLoading.hide();        
        $rootScope.$broadcast('Logout');
      }
    }
  };
});

starter.factory('ApiCall', function($state, $http, $ionicHistory,$ionicViewSwitcher,Api,ApiUrl,AlertFactory,GetUserDetails, UserAuth){
  return {
    PostCall:function (method, params, successCallBack, failedCallBack) {
      var apiUrl = "";

      if (this.IsOnline) {
        this.NetworkFailedNotifier(failedCallBack);

        if (method == Api.method.login || method == Api.method.socialSignIn || method == Api.method.register || method == Api.method.forgotPassword || method == Api.method.logintoken) {
          apiUrl = ApiUrl.url2();
        } else {
          if (!params) {
            params = {};
          }
          params['user_id'] = GetUserDetails().user_id;
          params['token'] = GetUserDetails().passhash;

          apiUrl = ApiUrl.url();
        }

        $http.post(apiUrl+method,params).then(
          function (response) {
            UserAuth.CheckToken(response);

            if (successCallBack) {
              successCallBack(response.data);
            }
            failedCallBack = null;
          }, function(error) {
            if (failedCallBack) {
              failedCallBack(error);
            }
          }
          );
      } else {
        AlertFactory.showError('Connection failed.');
        if (failedCallBack) {
          failedCallBack();
        }
      }
    },
    GetCall:function(method, params, successCallBack, failedCallBack) {
      if (this.IsOnline) {
        this.NetworkFailedNotifier(failedCallBack);

        var paramStr = '';
        if (params && Object.keys(params).length > 0) {
          var paramsArr = [];
          angular.forEach(params, function(value, key) {
            this.push(key + '= ' + value);
          }, paramsArr);
          paramStr = '?'+paramsArr.join('&');
        }
        $http.get(ApiUrl.url()+method+paramStr)
        .then(function(response){
          UserAuth.CheckToken(response);

          successCallBack(response.data);
          failedCallBack = null;
        },function(error){
          if (failedCallBack) {
            failedCallBack();
          }
        });
      } else {
        AlertFactory.showError('Connection failed.');
        if (failedCallBack) {
          failedCallBack();
        }
      }
    },
    OnConnectionChange:function(callBack){
      if (callBack) {
        document.body.onoffline = function() {
          callBack('offline');
        }
        document.body.ononline = function() {
          callBack('online');
        }
      }
    },
    IsOnline:function(){
      return navigator.onLine;
    },
    NetworkFailedNotifier:function(failedCallBack){
      this.OnConnectionChange(function(connection){
        if (connection == 'offline') {
          if (failedCallBack) {
            //failedCallBack();
          }
        }
      });
    }
  };
});

starter.factory('ApiUrl',function(Api){
  return {
    url:function(){
      var isIPad = ionic.Platform.isIPad();
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();

      var url = 'http://localhost:8100/api/';
      if (isIPad || isIOS || isAndroid) {
        url = 'http://dev2.engd.com/brijendra/fit_mk/api/';
      }
      return url;
    },
    url2:function(){
      var isIPad = ionic.Platform.isIPad();
      var isIOS = ionic.Platform.isIOS();
      var isAndroid = ionic.Platform.isAndroid();

      var url = 'http://localhost:8100/api2/';
      if (isIPad || isIOS || isAndroid) {
        url = 'http://dev2.engd.com/brijendra/fit_mk/api2/';
      }
      return url;
    },
    imgPath:function() {
      return "http://dev2.engd.com/brijendra/fit_mk/assets/images/uploads/";
    }
  };
});
