package cordova.plugin.Location.In.Bgmode;

import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.CordovaWebView;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import android.Manifest;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.location.LocationManager;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import java.util.HashMap;
import java.util.Iterator;

/**
* This class echoes a string called from JavaScript.
*/
public class LocationInBgmode extends CordovaPlugin {
  private static final String TAG  = "LocationInBgmode";

  private static final int MY_PERMISSIONS_REQUEST_ACCESS_LOCATION = 1120;

  JSONObject options;

  private CallbackContext savedCallbackContext;
  private boolean isGetCurrentLocation = false;
  LocationReceiver locationReceiver;



  private Activity actContext;
  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    actContext = cordova.getActivity();
  }
  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

    if (args.length() > 0) {
      options = args.getJSONObject(0);
    }

    if (this.savedCallbackContext != null){
      this.savedCallbackContext = null;
    }
    this.savedCallbackContext = callbackContext;

    if (action.equals("getCurrentLocation")) {
      isGetCurrentLocation = true;
      checkLocationPermission();
      return true;
    } else if (action.equals("startLocationUpdate")) {
      checkLocationPermission();
      return true;
    } else if (action.equals("stopLocationUpdate")) {
      this.stopLocationUpdate();
      return true;
    }
    return false;
  }

  public class LocationReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      try{
        JSONObject locationObject = new JSONObject();
        locationObject.put("lat", intent.getDoubleExtra("Latitude", 0));
        locationObject.put("lng", intent.getDoubleExtra("Longitude", 0));

        PluginResult result = new PluginResult(PluginResult.Status.OK,
        locationObject);

        if (isGetCurrentLocation) {
          isGetCurrentLocation = false;
          result.setKeepCallback(false);
          stopLocationUpdate();
        } else {
          result.setKeepCallback(true);
        }
        if (savedCallbackContext != null) {
          savedCallbackContext.sendPluginResult(result);
        }
      } catch (Exception e){
        PluginResult result = new PluginResult(PluginResult.Status.ERROR,
        e.getMessage());
        result.setKeepCallback(true);
        if (savedCallbackContext != null) {
          savedCallbackContext.sendPluginResult(result);
        }
      }
    }
  }

  private void startLocationUpdate() {
    Intent intent = new Intent(actContext, LocationService.class);
    if (options != null) {
      intent.putExtra(LocationService.LOCATION_OPTIONS,options.toString());
    }


    IntentFilter filter = new IntentFilter(LocationService.BROADCAST_ACTION);
    actContext.startService(intent);
    locationReceiver = new LocationReceiver();
    actContext.registerReceiver(locationReceiver, filter);
  }

  private void stopLocationUpdate(){
    Intent intent = new Intent(actContext, LocationService.class);
    if (intent != null) {
      actContext.stopService(intent);
    }
    if(locationReceiver != null) {
      actContext.unregisterReceiver(locationReceiver);
      locationReceiver = null;
    }
  }

  private void  checkLocationPermission(){
    LocationManager lm = (LocationManager)this.actContext.getSystemService(Context.LOCATION_SERVICE);
    boolean gps_enabled = false;
    boolean network_enabled = false;

    try {
      gps_enabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER);
    } catch(Exception ex) {}

      try {
        network_enabled = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
      } catch(Exception ex) {}

        if(!gps_enabled && !network_enabled) {
          PluginResult result = new PluginResult(PluginResult.Status.ERROR,
          "Location Provider is disabled");
          result.setKeepCallback(true);
          if (savedCallbackContext != null) {
            savedCallbackContext.sendPluginResult(result);
          }
        } else if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          if (ContextCompat.checkSelfPermission(actContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(actContext,new String[]{Manifest.permission.ACCESS_FINE_LOCATION,Manifest.permission.ACCESS_COARSE_LOCATION},MY_PERMISSIONS_REQUEST_ACCESS_LOCATION);
          } else {
            startLocationUpdate();
          }
        } else {
          startLocationUpdate();
        }
      }

      @Override
      public void onDestroy() {
        stopLocationUpdate();
      }
    }
