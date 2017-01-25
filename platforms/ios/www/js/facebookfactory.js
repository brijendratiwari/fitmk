starter.factory('FacebookFactory',function(){
  return {
    login:function(successCallBack, errorCallback){
      var fbPermissions = ["public_profile", "email"];
      facebookConnectPlugin.login(fbPermissions, successCallBack, errorCallback);
    },
    logout:function(successCallBack, errorCallback){
      facebookConnectPlugin.logout(successCallBack,errorCallback);
    },
    getUserInfo:function(userID,successCallBack,errorCallback){
      facebookConnectPlugin.api(userID+"/?fields=id,email,first_name,last_name,gender,name", [],successCallBack,errorCallback);
    }
  };
});
