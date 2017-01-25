starter.controller('CheckoutController',
function(
  $scope,
  $state,
  $window,
  $ionicPlatform,
  $ionicLoading,
  $ionicHistory,
  Cart,
  AlertFactory,
  GetUserDetails,
  Paypal
)
{

  $ionicPlatform.ready(function(){

    yourOrderData();
    billingDetails();
  });


  /************************* Your Order Details Set **************************/

  function yourOrderData() {
    var cartSubTotal = getCartTotal(Cart.getCart());
    var deliveryCharge = 2.99;
    var orderTotal = parseFloat(cartSubTotal) + parseFloat(deliveryCharge);
    $scope.totalAmount = orderTotal;

    $scope.yourOrder = [
      {
        title:"Cart Subtotal",
        value:"£"+cartSubTotal.toFixed(2)
      },
      {
        title:"UK Standard 1st Class Delivery",
        value:"£"+deliveryCharge.toFixed(2)
      },
      {
        title:"Order Total",
        value:"£"+orderTotal.toFixed(2)
      }
    ];
  }

  function getCartTotal (data) {
    var total = 0;
    for (var i = 0; i < data.length; i++) {
      var ne_dt = data[i].productdetail;
      var count = parseInt(data[i].count);
      total += count * parseFloat(ne_dt.price);
    }
    return total;
  }
  /*************************  Billing Details Set **************************/

  function billingDetails() {
    var user_data = GetUserDetails();

    $scope.billing = {
      fname:user_data.first_name,
      lname:user_data.last_name,
      company_name:user_data.company_name,
      address1:user_data.address_street,
      address2:"",
      towncity:user_data.address_town,
      postcode:user_data.address_postcode,
      country:user_data.address_country,
      email:user_data.email,
      phone:user_data.phone
    };
  }
  /*************************  Checkout Button Action **************************/

  $scope.checkoutNow = function() {
    var billingDetails = $scope.billing;

    var errorMsg = "";
    if (billingDetails.fname.length == 0) {
      errorMsg = "Please Enter First Name";
    } else if (billingDetails.lname.length == 0) {
      errorMsg = "Please Enter Last Name";
    } else if (billingDetails.address1.length == 0) {
      errorMsg = "Please Enter Address1";
    } else if (billingDetails.towncity.length == 0) {
      errorMsg = "Please Enter Town/City";
    } else if (billingDetails.postcode.length == 0) {
      errorMsg = "Please Enter Postcode";
    } else if (billingDetails.country.length == 0) {
      errorMsg = "Please Enter Country Name";
    } else if (billingDetails.email.length == 0) {
      errorMsg = "Please Enter Email Id";
    } else if (billingDetails.phone.length == 0) {
      errorMsg = "Please Enter Phone Number";
    }

    if (errorMsg.length > 0) {
      AlertFactory.showAlert(errorMsg);
    } else {
      Paypal.init(function() {
        Paypal.checkout({
          'amount':$scope.totalAmount
        }, function(result) {
          if (result.success) {

            var paymentRes = result.response;
            console.log('Payment Success Response '+JSON.stringify(paymentRes));

            AlertFactory.showSuccess("Payment Success", function(){
              Cart.empty();
              $ionicHistory.goBack(-3);
            });
          } else {
            AlertFactory.showAlert(result.message);
          }
        }
      );
    });
  }
};
});

// Paypal Success Response
//{
  //   "client": {
  //     "environment": "sandbox",
  //     "product_name": "PayPal iOS SDK",
  //     "paypal_sdk_version": "2.14.0",
  //     "platform": "iOS"
  //   },
  //   "response_type": "payment",
  //   "response": {
  //     "id": "PAY-0A343250LH762341SK6WZ2ZY",
  //     "state": "approved",
  //     "create_time": "2016-08-12T09:57:16Z",
  //     "intent": "sale"
  //   }
  // }
