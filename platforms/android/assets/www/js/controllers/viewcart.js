starter.controller('ViewCart',
  function(
    $scope,
    $state,
    $window,
    $ionicLoading,
    $ionicPlatform,
    $ionicModal,
    $ionicHistory,
    Cart,
    AlertFactory,
    ApiCall,
    ApiUrl,
    GetUserDetails,
    Api,
    SharedData,
    goTo
    ) {

   $scope.$on('$ionicView.enter', function(){
    $scope.cart_items = [];

    $scope.total = 0;

    getCartItems();
  });
   

   function getCartItems() {
    $ionicLoading.show();

    ApiCall.PostCall(Api.method.getCartItems,
      null,
      function(response) {
        $ionicLoading.hide();

        if (response.success) {
          var cart_data = response.cart_data;
          if (cart_data && cart_data.length > 0) {
            $scope.cart_items = arrange(cart_data);
            getTotalAmount();
          } else {
            AlertFactory.showError("No item in cart");
          }
        } else {
          AlertFactory.showResponseError(response, "No item in cart");
        }
      },
      function (error) {
        $ionicLoading.hide();
        AlertFactory.showError(JSON.stringify(error));
      });
  }

  $scope.continueToPay = function() {
    $ionicLoading.show();
    ApiCall.PostCall(Api.method.shopCheckout,
      null,
      function(response) {
        $ionicLoading.hide();
        if (response.success) {
          var message = response.message;
          openInAppBrowser(message+"/"+GetUserDetails().passhash, response.url.success_url, response.url.failed_url);
        } else {
          AlertFactory.showResponseError(response, "Checkout failed.");
        }
      }, function (err) {
        $ionicLoading.hide();
        AlertFactory.showError(JSON.stringify(err));
      });
      // $state.go('app.checkout');
    };

    function arrange (data) {
      var converted = [];
      for (var i = 0; i < data.length; i++) {
        var product = data[i];

        if (product.thumb.length == 0) {
          product.design = "background-color: #ccc";
        }
        else {
          product.design = "background: url('" + ApiUrl.imgPath() + product.thumb + "') no-repeat scroll center center / auto 100%";
        }
        converted[i] = product;
      }
      return converted;
    }

    function getTotalAmount() {
      $scope.total = 0;
      for (var i = 0; i < $scope.cart_items.length; i++) {
        var product = $scope.cart_items[i];
        $scope.total += product.qty * product.price;
      }   

      $scope.total = $scope.total.toFixed(2);   
    }

    $scope.getSelectedOptionsValue = function(optionname) {
      var selectedValue = "";
      for (var i = 0; i < optionname.length; i++) {
        if (optionname[i].selected == "selected") {
          selectedValue = optionname[i].optName;
          break;
        }
      }
      return selectedValue;
    };

    function removeCartItem(cartId) {
      $ionicLoading.show();

      ApiCall.PostCall(Api.method.removeCartItem,
      {
        cartId:cartId
      },
      function(response) {
        $ionicLoading.hide();

        if (response.success) {
          Cart.setItemCount(response.total_items);          
          removeCartItemForId(cartId);
          getTotalAmount();
          AlertFactory.showAlert(response.message, null);
          if ($scope.total == 0) {
            goTo.root();
          }
        } else {
          AlertFactory.showResponseError(response, "Item not removed.");
        }
      },
      function (error) {
        $ionicLoading.hide();
        AlertFactory.showError(JSON.stringify(error));
      });
    }
    $scope.deleteFromCart = function(cartId) {

      AlertFactory.showConfirmPromt('Alert !', "Do you really want to delete this item?", function(res) {
        if (res) {
          removeCartItem(cartId);
            // Cart.removeItem(pid, function(success) {
            // 	if (success) {
            //
            // 		$scope.cart_items = arrange(Cart.getCart());
            // 	}
            // });
          }
        })
    }

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

    $scope.productOptions = [];
    $scope.quantity = {};
    $scope.quantity.count = 1;
    $scope.popupTitle = "Update Cart";
    $scope.buttonTitle = "Update Cart";
    $scope.productId = "";

    $scope.editCartItem = function(cartItem) {
      if (cartItem) {
        $scope.productId  = cartItem.productId;
        $scope.cartId  = cartItem.cartId;
        $scope.quantity.count = parseInt(cartItem.qty);
        var product_option = cartItem.product_option;
        if (product_option != 0 && product_option.length > 0) {
          $scope.productOptions = product_option;
          angular.forEach($scope.productOptions, function(value, key){
            var optionname = value.optionname;

            for (var i = 0; i < optionname.length; i++) {
              if (optionname[i].selected == "selected") {
                value['selected'] = optionname[i].optId;
                break;
              }
            }
          });
        }
        $scope.showModal();
      }
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

      ApiCall.PostCall(Api.method.updateCart,
      {
        productId:$scope.productId,
        cartId:$scope.cartId,
        quantity:$scope.quantity.count,
        select:select
      },
      function(response) {
        $ionicLoading.hide();
        if (response.success) {
          AlertFactory.showSuccess(response.message, function(res){
            getCartItems();
          });
          $scope.hideModal();
        } else {
          AlertFactory.showResponseError(response, "Cart not updated.");
        }
      }, function (err) {
        $ionicLoading.hide();
      });
    };

    function removeCartItemForId(cartId) {
      for (var i = 0; i < $scope.cart_items.length; i++) {
        var cartItem = $scope.cart_items[i];
        if (cartItem.cartId == cartId) {
          $scope.cart_items.splice(i, 1);
          break;
        }
      }
    }



    /******************************************************************************************************/
    /*************************************  In AppBrowser ************************************************/

    function openInAppBrowser(url, successUrl, failedUrl) {
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

              if (event.url == successUrl) {
                paymentSuccess();
              } else if (event.url == failedUrl) {
                paymentFailed();
              }
            }

            function loadStopCallBack() {
              if (inAppBrowserRef != undefined) {
                $ionicLoading.hide();
                inAppBrowserRef.show();
                // inAppBrowserRef.executeScript({ code: "window.localStorage.setItem('user_token', '"+ GetUserDetails().passhash +"');" }, null);
              }
            }

            function loadErrorCallBack(params) {
              var scriptErrorMesssage = "alert('Sorry we cannot open that page. Message from the server is : " + params.message + "');"
              inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);
              closeInAppBrowser();
            }

            function closeInAppBrowser() {
              inAppBrowserRef.close();
              inAppBrowserRef = undefined;
            }

            function executeScriptCallBack(params) {
              if (params[0] == null) {
                console.log("Sorry we couldn't open that page. Message from the server is : '"
                  + params.message + "'");
              }
            }

            function paymentSuccess() {
              closeInAppBrowser();
              AlertFactory.showSuccess("Payment Success", function(res){
                $ionicHistory.nextViewOptions({
                  disableAnimate: true,
                  disableBack: true
                });
                $ionicHistory.goBack(-2);
                SharedData.setNeedRefreshOrders(true);
                $state.go("app.orders");
              });
              Cart.setItemCount(0);
            }

            function  paymentFailed() {
              closeInAppBrowser();
              AlertFactory.showError("Payment Failed");
            }
          }
        });
