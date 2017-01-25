starter.controller('ProductCtrl',
  function(
    $scope,
    $ionicPlatform,
    $state,
    $ionicModal,
    $ionicLoading,
    $rootScope,
    $stateParams,
    Api,
    ApiCall,
    AlertFactory,
    Cart,
    ApiUrl,
    SharedData,
     $ionicScrollDelegate
    ){

    $scope.productSearchKey = "";
    $scope.categoryName = SharedData.getClickedShopCategory();

    $scope.$on('$ionicView.enter', function(event, data){
      setCartCount();
      $scope.categoryName = SharedData.getClickedShopCategory();
    });
    var products = [];

    $scope.products = [];
    $scope.av_credits = "0.00";

    function setCartCount() {
      Cart.getItemCount();
    }
    setCartCount();


    function getProducts() {
      $scope.showerrorMsg = false;
      $ionicLoading.show();

      ApiCall.PostCall(Api.method.getProducts, {categoryId:$stateParams.categoryId}, function(response) {

        $ionicLoading.hide();
        if(response.success){
          console.log(JSON.stringify(response.result));
          products = response.result;
          $scope.products = arrange(response.result);
        }else{
          $scope.products = [];
          $scope.showerrorMsg = true;
        }
        

      }, function (err) {
        $ionicLoading.hide();
        console.log(JSON.stringify(err));
      });
    }

    getProducts();

    function getProductDetails(pid) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].productId == pid) {
          return products[i];
        }
      }
    }

    $scope.productSearch = function() {
     $ionicScrollDelegate.resize();
     $ionicScrollDelegate.scrollTop();
   };


    // $ionicModal.fromTemplateUrl('templates/cart_model.html', {
    //   animation: 'fade-in',
    //   scope:$scope
    // }).then(function (modal) {
    //   $scope.modal = modal;
    // });

    // $scope.showModal = function() {
    //   $scope.modal.show();
    // };

    // $scope.hideModal = function() {
    //   $scope.modal.hide();
    // };

    // $scope.productOptions = [];
    // $scope.quantity = {};
    // $scope.quantity.count = 1;
    // $scope.popupTitle = "ADD TO CART";
    // $scope.buttonTitle = "ADD TO CART";
    // $scope.productId = "";

    // $scope.addOnCart = function(idx) {
    //   $ionicLoading.show();
    //   $scope.productId = idx;
    //   $scope.quantity.count = 1;

    //   ApiCall.PostCall(Api.method.getProductDetails,
    //   {
    //     categoryId:$stateParams.categoryId,
    //     productId:idx
    //   },
    //   function(response) {
    //     $ionicLoading.hide();
    //     if (response.success) {
    //       var product_data = response.product_data;
    //       if (product_data) {
    //         var product_option = product_data.product_option;
    //         if (product_option != 0 && product_option.length > 0) {
    //           $scope.productOptions = product_option;
    //           angular.forEach($scope.productOptions, function(value, key){
    //             var optionname = value.optionname;
    //             value['selected'] = optionname[0].optId;
    //           });
    //         }
    //         $scope.showModal();
    //       }
    //     }
    //   },
    //   function (err) {
    //     $ionicLoading.hide();
    //   });


    // };


    // $scope.addToCart = function () {
    //   if ($scope.quantity.count.length == 0 || $scope.quantity.count == 0) {
    //     AlertFactory.showAlert("Quantity should be greater than 0.");
    //     return;
    //   }

    //   $ionicLoading.show();
    //   if (!select) {
    //     select = "";
    //   }
    //   var select = {};

    //   angular.forEach($scope.productOptions, function(value, key){
    //     var opttypeid = value.opttypeid;
    //     select[opttypeid] = value.selected;
    //   });

    //   ApiCall.PostCall(Api.method.addToCart,
    //   {
    //     product_id:$scope.productId,
    //     quantity:$scope.quantity.count,
    //     select:select
    //   },
    //   function(response) {
    //     $ionicLoading.hide();
    //     if (response.success) {
    //       Cart.setItemCount(response.total_items);
    //       setCartCount();

    //       AlertFactory.showSuccess("Item added to cart successfully.");

    //       $scope.hideModal();
    //     } else {
    //       AlertFactory.showResponseError(response);
    //     }
    //   }, function (err) {
    //     $ionicLoading.hide();
    //   });
    // };

    function arrange (data) {
      var converted = [];

      for (var i = 0; i < data.length; i++) {
        var product = data[i];
        var ne_dt = data[i];
        if (product.thumb.length == 0) {
          ne_dt.design = "background-color: #ccc";
        }
        else {
          ne_dt.design = "background: url('"+ApiUrl.imgPath()+ product.thumb + "') no-repeat scroll center center / 100% auto";
        }
        converted[i] = ne_dt;
      }
      return converted;
    }


    function apply(){
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    }

  });
