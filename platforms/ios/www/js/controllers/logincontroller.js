
starter.controller('LoginCtrl', function(
  $scope,
  $rootScope,
  $state,
  $ionicViewSwitcher,
  $ionicLoading,
  $ionicPopup,
  $window,
  Api,
  ApiUrl,
  SetUserDetails,GetUserDetails,
  ApiCall,
  Cart,
  AlertFactory,
  FacebookFactory,
  GoogleFitDataFactory
  ) {

 $scope.loginData = {
  username:"",
  password:""
};

ionic.Platform.ready(function(){
  if (ionic.Platform.isAndroid()) {
    GoogleFitDataFactory.startActivityDataRecording(
      function(success){
        console.log('startActivityDataRecording'+success);
      },
      function (error) {
        console.log('startActivityDataRecording'+error);
      }
      );
  } 
});

$rootScope.$on('Logout', function () {
  $scope.loginData = {
    username:"",
    password:""
  };
});

$scope.loginSubmit = function(loginform) {
  if (!loginform.username.$viewValue) {
    AlertFactory.showAlert('Please enter email or Username');
  } else if (!loginform.password.$viewValue) {
    AlertFactory.showAlert('Please enter password');
  } else if (loginform.$valid) {
    var username = loginform.username.$viewValue;
    var password = loginform.password.$viewValue;
    doLogin(username, password);
  }
};

$scope.facebookSignIn = function() {
  var fbLoginSuccess = function (response) {
    if (response.status === 'connected') {
      var accessToken = response['authResponse']['accessToken'];
      window.localStorage.setItem('FBToken', accessToken);
      $ionicLoading.show();

      facebookLogin(accessToken);
    }
    else {
      AlertFactory.showError('Facebook login failed');
    }
  };

  var fbLoginFailed = function (error) {
    AlertFactory.showError('Facebook login failed');
  };

  FacebookFactory.login(fbLoginSuccess,fbLoginFailed);
};

function facebookLogin(accessToken) {
 var fcmToken = window.localStorage.getItem('fcm_token');

 if (!fcmToken) {
  fcmToken = "";
}

var loginParam = {
  "accessToken": accessToken,
  "push_noti_token": fcmToken
};

ApiCall.PostCall(Api.method.socialSignIn,
  loginParam,
  function (response) {
    $ionicLoading.hide();
    if (response.success) {
      loginSuccess(response);
    } else {
      AlertFactory.showResponseError(response,"Facebook Login Failed.");
    }
  }
  );
}

  // Login
  function doLogin(username,password) {
    
    var deviceInformation = ionic.Platform.device();

    var fcmToken = window.localStorage.getItem('fcm_token');
    if (!fcmToken) {
      fcmToken = "";
    }

    $ionicLoading.show();
    ApiCall.PostCall(
      Api.method.login,
      {
        'identity':username,
        'password':password,
        "push_noti_token": fcmToken,
        'device':deviceInformation.platform,
        'deviceversion':deviceInformation.version
      },  
      function (response) {
        $ionicLoading.hide();
        if (response.success) {
          loginSuccess(response);
        } else {
          AlertFactory.showResponseError(response,"Login Failed.");
        }
      },
      function (error) {
        $ionicLoading.hide();
      }
      );
  }


  $scope.registration = function() {
    var registrationUrl = ApiUrl.url() + Api.method.registration;
    var successUrl = ApiUrl.url() + 'signupok';

    openInAppBrowser(
      registrationUrl, 
      successUrl,
      function(responseUrl) {
        var remainStr = responseUrl.replace(successUrl+"/", "");
        console.log("Replace String "+remainStr);
        var idtokenArr = remainStr.split("/");
        console.log("idtokenArr "+JSON.stringify(idtokenArr));
        if (idtokenArr.length == 2) {
          var userid = idtokenArr[0];
          var token = idtokenArr[1];
          logintoken(userid, token);
        }
      }
      );
  };

  function loginSuccess(response){
    Cart.setItemCount(response.total_items);
    var userdetails = response.user_detail;

    if (response.parqrequired) {
      var userId = userdetails.user_id;
      var passhash = userdetails.passhash;

      var parqUrl = ApiUrl.url2() + Api.method.parq + "?user_id="+userId+"&token="+passhash;
      var successUrl = ApiUrl.url2() + "parqcompleted";

      openInAppBrowser(
        parqUrl, 
        successUrl,
        function(responseUrl) {
         goToHomeAfterLogin(userdetails);
       }
       );
    } else {
      goToHomeAfterLogin(userdetails);
    }
  }

  function goToHomeAfterLogin(userdetails) {
    SetUserDetails(userdetails);
    $ionicViewSwitcher.nextDirection('forward');
    $state.go('app.home');
  }
  /******************************************************************************************************/
  /*************************************  In AppBrowser ************************************************/

  function openInAppBrowser(url, successUrl, successCallback) {
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
      console.log("Success url "+successUrl);

      if (event.url.indexOf(successUrl) !== -1) {
        if (successCallback) {
          successCallback(event.url);
          closeInAppBrowser();
        }
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
      console.log("Url load  error "+JSON.stringify(params));
      // var scriptErrorMesssage = "alert('Sorry we cannot open that page. Message from the server is : " + params.message + "');"
      // inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);
      closeInAppBrowser();
    }

    function closeInAppBrowser() {
      inAppBrowserRef.close();
      inAppBrowserRef = undefined;
    }

    function executeScriptCallBack(params) {
      console.log("Execute Script  "+JSON.stringify(params));

      if (params[0] == null) {
        console.log("Sorry we couldn't open that page. Message from the server is : '"
          + params.message + "'");
      }
    }

    
  }

  function logintoken(userId, token) {
    var deviceInformation = ionic.Platform.device();

    var fcmToken = window.localStorage.getItem('fcm_token');
    if (!fcmToken) {
      fcmToken = "";
    }

    $ionicLoading.show();
    ApiCall.PostCall(
      Api.method.logintoken,
      {
        'user_id':userId,
        'token':token,
        "push_noti_token": fcmToken,
        'device':deviceInformation.platform,
        'deviceversion':deviceInformation.version
      },
      function (response) {
        $ionicLoading.hide();

        console.log("Login Token Response "+JSON.stringify(response));

        if (response.success) {
          loginSuccess(response);
        } else {
          AlertFactory.showResponseError(response,"Login Failed.");
        }
      },
      function (error) {
        $ionicLoading.hide();
      }
      );
  }
});
