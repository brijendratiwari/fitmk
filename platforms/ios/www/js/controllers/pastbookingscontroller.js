 
starter.controller('PastBookingsCtrl', function(
  $scope,
  $rootScope,
  $state,
  $ionicViewSwitcher,
  $ionicLoading,
  $ionicPopup,
  Api,
  ApiUrl,
  $ionicScrollDelegate,
  GetUserDetails,
  ApiCall,
  AlertFactory,
  $ionicModal,
  SharedData
  ) {
  $scope.sessionData = {};

  $rootScope.$on('MenuItemChanged', function(event, args) {
    if (args.itemName == 'pastbookings') {
      $scope.reloadData();
    }
  });

  $scope.$on('$ionicView.afterEnter', function(){
    if (SharedData.getPastBookingNotificationData() && SharedData.getPastBookingNotificationData().isRatingCommentReminder) {
      console.log(JSON.stringify(SharedData.getPastBookingNotificationData()));

     $scope.showName(SharedData.getPastBookingNotificationData().sessionId);
     SharedData.setPastBookingNotificationData(false, '');
   }
 });

  //bookedSessionModal
  $ionicModal.fromTemplateUrl('templates/bookedsession_model.html', {
    animation: 'fade-in',
    scope:$scope
  }).then(function (modal) {
    $scope.bookedSessionModal = modal;
  });

  
  $scope.showBookedSessionModal = function() {

    $scope.bookedSessionModal.show();
  };

  $scope.closeBookedSessionModal = function() {
   $scope.bookedSessionModal.hide();
   $ionicScrollDelegate.scrollTop();
 };

//showBookedSessionCommentModal
$ionicModal.fromTemplateUrl('templates/bookedsessioncomment_model.html', {
  animation: 'fade-in',
  scope:$scope
}).then(function (modal) {
  $scope.bookedSessionCommentModal = modal;
});

$scope.showBookedSessionCommentModal = function() {
  $scope.bookedSessionCommentModal.show();
};

$scope.closeBookedSessionCommentModal = function() {
 $scope.bookedSessionCommentModal.hide();
};


$scope.doComment = function(session) {
  $ionicLoading.show();
  ApiCall.PostCall(Api.method.addPastBookingComment,
  {
    session_id:session.SessionId,
    comment: session.comment
  },
  function(response) {
    $ionicLoading.hide();

    if (response.success) {              
      AlertFactory.showSuccess(response.message);
      $scope.closeBookedSessionCommentModal();
    } else {
      AlertFactory.showResponseError(response,"Comment not saved.");
    }
  },
  function(err){
    $ionicLoading.hide();
    AlertFactory.showError("Comment not saved.")
    console.log(JSON.stringify(err));
  });
};

$scope.ratingChanged = function(session) {
  $ionicLoading.show();
  ApiCall.PostCall(Api.method.pastSessionRating,
  {
    session_id:session.SessionId,
    rating:session.rating
  },
  function(response) {
    $ionicLoading.hide();

    if (response.success) {              
      // AlertFactory.showSuccess(response.message);
      console.log(response.message);
    } else {
      AlertFactory.showResponseError(response,"Rating not saved.");
    }
  },
  function(err){
    $ionicLoading.hide();
    AlertFactory.showError("Rating not saved.")
    console.log(JSON.stringify(err));
  });
};

$scope.getImgPath = function(imgName) {
  return ApiUrl.imgPath()+imgName;
};

$scope.showName = function(sessionId) {
  getBookedSessionData(sessionId);
};

$scope.WithAjaxCtrl = function (DTOptionsBuilder, DTColumnDefBuilder, DTColumnBuilder, $http,$compile, $q) {
  var vm = this;


  vm.dtOptions = DTOptionsBuilder.newOptions()
  .withOption('ajax', {
   data: {'user_id':GetUserDetails().user_id,'token':GetUserDetails().passhash},
   url: ApiUrl.url2()+Api.method.getAllBookedSessions,
   type: 'POST'
 })
  .withOption('createdRow', function(row,data, dataIndex) {
        // Recompiling so we can bind Angular directive to the DT
        $compile(angular.element(row).contents())($scope);
      })
  .withOption('order', [1, 'desc'])
  .withDataProp('data')
  .withOption('processing', true)
  .withOption('serverSide', true)
  .withPaginationType('full');

  vm.dtColumns = [
  DTColumnBuilder.newColumn('SessionName').withTitle('Name'),
  DTColumnBuilder.newColumn('SessionDate').withTitle('Date')
  ];

  vm.dtColumnDefs = [
  DTColumnDefBuilder.newColumnDef(2).withTitle('').renderWith(render).withOption('searchable', false).notSortable()
  ];

  function render(data, type, full){
    return '<button ng-click = "showName('+full.id+')" class="button icon ion-ios-eye bg-green-color view-button"></button>'
    // return '<button ng-click = "showName('+full.id+')" class="button button-small button-green" style = "background-color:rgb(12, 192, 192);width:20vw;">View</button>';
  }

  vm.dtInstance = {};

  $scope.reloadData = function() {
    var resetPaging = true;
    vm.dtInstance.reloadData(callback, resetPaging);
  }

  function callback(json) {
    console.log(json);
  }
}

function getBookedSessionData(session_id) {
  $ionicLoading.show();
  ApiCall.PostCall(Api.method.getBookedSessionData,
  {
    session_id:session_id
  },
  function(response) {
    $ionicLoading.hide();

    if (response.success) {
      var session_data = response.session_data;
      $scope.sessionData = session_data;

      $scope.showBookedSessionModal();

    } else {
      AlertFactory.showResponseError(response,"Booked Session not found!");
    }
  },
  function(err){
    $ionicLoading.hide();
    console.log(JSON.stringify(err));
  });
}
});