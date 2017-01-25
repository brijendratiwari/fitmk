starter.factory('Paypal',function(){
  return {
    init: function(callBack) {
      var clientIDs = {
        "PayPalEnvironmentProduction": "YOUR_PRODUCTION_CLIENT_ID",
        "PayPalEnvironmentSandbox": "AfJoWmxkmq2rXanjDaNx1lChpo_ya59DPDIzVRtCyBZsa-iTlsVMnqNjPnST570G5tC-UAmxcEbR6kxX"
      };

      PayPalMobile.init(clientIDs, function() {
        // must be called
        // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
        var config = new PayPalConfiguration({
          merchantName: "FitMK",
          merchantPrivacyPolicyURL: "http://dev.tilltastic.com/appdev/appabout.html",
          merchantUserAgreementURL: "http://dev.tilltastic.com/appdev/appabout.html"
        });

        PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", config,
        function() {
          callBack();
        });
      });
    },

    checkout:function(options, callBack) {
      var paymentDetails = new PayPalPaymentDetails(options.amount, "0.00", "0.00");
      var payment = new PayPalPayment(options.amount, "GBP", "Total Amount", "Sale", paymentDetails);

      PayPalMobile.renderSinglePaymentUI(payment,

        function(result) {
          callBack({'success':true,'response':result.response});
        },

        function(error) {
          callBack({'success':false,'message':JSON.stringify(error)});
        });
      }
    };
  });
