
starter.controller('RegistrationCtrl', function(
  $scope,
  $state,
  $ionicHistory,
  $ionicPopup,
  $ionicLoading,
  $ionicViewSwitcher,
  $window,
  Api,
  ApiCall,
  SetUserDetails,
  DateFormat,
  $stateParams,
  AlertFactory
  ) {
  

  $scope.registerSubmit = function(registerData) {
    console.log(registerData);
    var fname = registerData.firstname.$viewValue;
    var lname = registerData.lastname.$viewValue;
    var email = registerData.email.$viewValue;
    var password = registerData.password.$viewValue;
    var reenterpassword = registerData.reenterpassword.$viewValue;
    var phone = registerData.mobilephone.$viewValue;
    var dob = registerData.dob.$viewValue;
    var uname = registerData.uname.$viewValue;
    var gender = registerData.gender.$viewValue;
    var fitnessCategory = registerData.fitnessCategory.$viewValue;
    var physicalIssues = registerData.physicalIssues.$viewValue;
    var otherNotes = registerData.otherNotes.$viewValue;
    var weight = registerData.weight.$viewValue;
    var height = registerData.height.$viewValue;
    var chest = registerData.chest.$viewValue;
    var waist = registerData.waist.$viewValue;
    var bum = registerData.bum.$viewValue;
    var thighs = registerData.thighs.$viewValue;
    var ankles = registerData.ankles.$viewValue;
    var arms = registerData.arms.$viewValue;

    if (!physicalIssues) {
      physicalIssues = "";
    }

    if (!otherNotes) {
      otherNotes = "";
    }

    if (fname == undefined ||  lname == undefined) {
      AlertFactory.showAlert('Please Enter firstname and lastname');
      return;
    } else if (fname.length <= 2 || lname.length <= 2) {
      AlertFactory.showAlert('Enter firstname and lastname both with at least 2 characters');
      return;
    } 
    // else if (unames.indexOf(' ') >= 0) {
    //   AlertFactory.showAlert('Enter firstname and lastname both with at least 2 characters');
    //   return;
    // }
    else if (!email) {
      AlertFactory.showAlert('Please Enter email');
      return;
    } else if (registerData.email.$invalid) {
      AlertFactory.showAlert('Please Enter valid email');
      return;
    } else if (password == undefined ||  reenterpassword == undefined) {
      AlertFactory.showAlert('Please insert Password and Repeated Passwords');
    } else if ( (password.length <= 5 || reenterpassword.length <= 5) && (password != reenterpassword) ) {
      AlertFactory.showAlert('Password and Repeated Passwords should be same and atleast 5 characters each');
      return;
    } else if (phone == undefined) {
      AlertFactory.showAlert('Enter a valid phone number');
      return;
    } else if (dob == undefined || dob.length==0) {
      AlertFactory.showAlert('Enter dob');
      return;
    } else {
      $ionicLoading.show();
      ApiCall.PostCall(Api.method.register,
      {
        "first_name": fname,
        "last_name": lname,
        "email": email,
        "password": password,
        "cnfpassword": reenterpassword,
        "fitness_category": fitnessCategory,
        "physical_issues": physicalIssues,
        "other_notes": otherNotes,
        "phone": phone,
        "dob": DateFormat.dateToStr(new Date(dob)),
        "gender": gender,
        "uname": uname
      },
      function (response) {
        $ionicLoading.hide();

        if (response.success) {
          if (response.hasOwnProperty("user_detail")) {
            SetUserDetails(response.user_detail);

            if ( weight || height || chest || waist || bum || thighs || ankles || arms ) {
              function checkIfUndefined(str){ return (str == undefined)?0:str;}
              $ionicLoading.show();
              ApiCall.PostCall(Api.method.insertMeasurements,
              {
                "weightkg": checkIfUndefined(weight),
                "weightlb": checkIfUndefined(weight) * 2.20462,
                "heightm": checkIfUndefined(height)/100,
                "heightft": (checkIfUndefined(height)/100) * 3.28084,
                "chest": checkIfUndefined(chest),
                "waist": checkIfUndefined(waist),
                "bum": checkIfUndefined(bum),
                "thighs": checkIfUndefined(thighs),
                "ankles": checkIfUndefined(ankles),
                "arms": checkIfUndefined(arms)
              },
              function (response) {
                $ionicLoading.hide();
                if (response.success) {
                  $ionicViewSwitcher.nextDirection('forward');
                  $state.go('app.home');
                } else {
                  AlertFactory.showResponseError(response,"Measurements data not inserted.");
                }
              },
              function(error) {
                $ionicLoading.hide();
                AlertFactory.showError("Measurements not added.");
              }
              );
            } else {
              $ionicViewSwitcher.nextDirection('forward');
              $state.go('app.home');
            }
          }
        } else {
          AlertFactory.showResponseError(response,"Registration Failed");
        }
      },
      function(error) {
        $ionicLoading.hide();
        AlertFactory.showError("Registration failed.");
      }
      );
    }
  };
  $scope.cancel = function() {
    $ionicHistory.goBack(-1);
  };
});
