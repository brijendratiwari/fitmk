starter.controller('AddToCart',
  function(
    $scope,
    $ionicPlatform,
    $state,
    $ionicModal,
    $ionicLoading,
    $rootScope,
    Api,
    User,
    ApiCall,
    AlertFactory,
    Cart,
    ApiUrl,
    $stateParams,
    SharedData
    ){


    $scope.$on('$ionicView.enter', function(event, data){
      setCartCount();
      // $scope.product = SharedData.getSelectedProduct();
      $scope.productId = $stateParams.productId;
      $scope.categoryId = $stateParams.categoryId;

      getProductDetails();
    });

    $scope.isAdminOrInstructor = function() {
      return User.isInstructor() || User.isAdmin();
    };

    function setCartCount() {
      Cart.getItemCount();
    }
    setCartCount();


    

    $scope.cartClick = function() {
      if ($rootScope.cartItemCount == 0) {
        AlertFactory.showAlert("No item in cart");
      } else {
        $state.go('app.viewcart');
      }
    };

    $ionicModal.fromTemplateUrl('templates/cart_model.html', {
      animation: 'fade-in',
      scope:$scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $scope.showModal = function() {
      $scope.modal.show();
    };

    $scope.hideModal = function() {
      $scope.modal.hide();
    };

    $scope.product = {};
    $scope.productOptions = [];
    $scope.quantity = {};
    $scope.popupTitle = "ADD TO CART";
    $scope.buttonTitle = "ADD TO CART";
    

    function getProductDetails() {
      $ionicLoading.show();


      ApiCall.PostCall(Api.method.getProductDetails,
      {
        categoryId:$scope.categoryId,
        productId:$scope.productId
      },
      function(response) {
        $ionicLoading.hide();
        if (response.success) {
          var product_data = response.product_data;
          if (product_data) {
            $scope.product = arrange(product_data.result);

            var product_option = product_data.product_option;
            if (product_option != 0 && product_option.length > 0) {
              $scope.productOptions = product_option;
              angular.forEach($scope.productOptions, function(value, key){
                var optionname = value.optionname;
                value['selected'] = optionname[0].optId;
              });
            }
            
            getItemView();
          }
        }
      },
      function (err) {
        $ionicLoading.hide();
      });

    }

    function getItemView() {
      $ionicLoading.show();
      ApiCall.PostCall(Api.method.getItemView,{
        product_id:$scope.productId
      },
      function(response){
        $ionicLoading.hide();
        console.log('getItemView '+JSON.stringify(response));

        if (response.success) {
          $scope.viewCount = response.view_count;
        } 
      },
      function(error){

      });
    }


    $scope.addOnCart = function() {
      $scope.quantity.count = 1;
      $scope.showModal();

     


      // ApiCall.PostCall(Api.method.getProductDetails,
      // {
      //   categoryId:$scope.product.catId,
      //   productId:idx
      // },
      // function(response) {
      //   $ionicLoading.hide();
      //   if (response.success) {
      //     var product_data = response.product_data;
      //     if (product_data) {
      //       var product_option = product_data.product_option;
      //       if (product_option != 0 && product_option.length > 0) {
      //         $scope.productOptions = product_option;
      //         angular.forEach($scope.productOptions, function(value, key){
      //           var optionname = value.optionname;
      //           value['selected'] = optionname[0].optId;
      //         });
      //       }
      //       $scope.showModal();
      //     }
      //   }
      // },
      // function (err) {
      //   $ionicLoading.hide();
      // });

    };


    $scope.addToCart = function () {
      if ($scope.quantity.count.length == 0 || $scope.quantity.count == 0) {
        AlertFactory.showAlert("Quantity should be greater than 0.");
        return;
      }

      $ionicLoading.show();
      if (!select) {
        select = "";
      }
      var select = {};

      angular.forEach($scope.productOptions, function(value, key){
        var opttypeid = value.opttypeid;
        select[opttypeid] = value.selected;
      });

      ApiCall.PostCall(Api.method.addToCart,
      {
        product_id:$scope.productId,
        quantity:$scope.quantity.count,
        select:select
      },
      function(response) {
        $ionicLoading.hide();
        if (response.success) {
          Cart.setItemCount(response.total_items);
          setCartCount();

          AlertFactory.showSuccess("Item added to cart successfully.");

          $scope.hideModal();
        } else {
          AlertFactory.showResponseError(response);
        }
      }, function (err) {
        $ionicLoading.hide();
      });
    };

    function arrange (product) { 
        if (product.thumb.length == 0) {
          product['design'] = "background-color: #ccc";
        }
        else {
          product['design'] = "background: url('"+ApiUrl.imgPath()+ product.thumb + "') no-repeat scroll center center / 100% auto";
        }

      return product;
    }



    function apply(){
      if(!$scope.$$phase) {
        $scope.$apply();
      }
    }

  });
