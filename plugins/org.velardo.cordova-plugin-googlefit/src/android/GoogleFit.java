package uk.ac.ox.ibme.cordova.plugins;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;

import com.google.android.gms.fitness.data.DataSet;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONArray;
import org.json.JSONException;


/**
* This sample demonstrates how to use the History API of the Google Fit platform to insert data,
* query against existing data, and remove data. It also demonstrates how to authenticate
* a user with Google Play Services and how to properly represent data in a {@link DataSet}.
*/
public class GoogleFit extends CordovaPlugin {
  public static final int MY_PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION = 1340;

  public static final String TAG = "cv-pl-googlefit";

  // Methods
  public static final String HISTORY_STUFF_1 = "getStuff1";
  public static final String HISTORY_STUFF_2 = "getStuff2";
  public static final String SENSOR_API_START = "startActivityDataLiveUpdate";
  public static final String SENSOR_API_STOP = "stopActivityDataLiveUpdate";
  public static final String RECORDING_API_START = "startActivityDataRecording";
  public static final String RECORDING_API_STOP = "stopActivityDataRecording";

  private String savedAction;
  private JSONArray savedArgs;
  private CallbackContext savedCallbackContext;

  /**
  *  Track whether an authorization activity is stacking over the current activity, i.e. when
  *  a known auth error is being resolved, such as showing the account chooser or presenting a
  *  consent dialog. This avoids common duplications as might happen on screen rotations, etc.
  */

  public static final int REQUEST_OAUTH = 1;
  private boolean authInProgress = false;

  private Activity actContext;
  private Context appContext;

  private SensorApiClass sensorClassObj;
  private RecordingApiClass recordingClassObj;
  private HistoryApiClass historyClassObj;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);

    actContext = cordova.getActivity();
    appContext = actContext.getApplicationContext();

    cordova.setActivityResultCallback(this);
  }

  private void getActivityDataFromHistory() {
    historyClassObj = new HistoryApiClass(actContext, appContext,savedArgs, savedAction, savedCallbackContext);
    historyClassObj.start();
  }

  private void starActivityDataLiveUpdate() {
    sensorClassObj = new SensorApiClass(actContext,appContext, savedArgs, savedAction, savedCallbackContext);
    sensorClassObj.start();
  }

  private void stopActivityDataLiveUpdate() {
    if (sensorClassObj != null) {
      sensorClassObj.stopCallbackContext = this.savedCallbackContext;
      sensorClassObj.stop();
    }
  }

  private void startActivityDataRecording() {
    recordingClassObj = new RecordingApiClass(actContext, appContext,savedArgs, savedAction, savedCallbackContext);
    recordingClassObj.start();
  }

  private void stopActivityDataRecording() {
    if (recordingClassObj != null) {
      recordingClassObj.stopCallbackContext = this.savedCallbackContext;
      recordingClassObj.stop();
    }
  }

  /**
  * The "execute" method that Cordova calls whenever the plugin is used from the JavaScript
  * @param action          The action to execute.
  * @param args            The exec() arguments.
  * @param callbackContext The callback context used when calling back into JavaScript.
  * @return
  * @throws JSONException
  */
  @Override
  public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
    this.savedArgs = args;
    this.savedAction = action;
    this.savedCallbackContext = callbackContext;

    checkLocationPermission();
    return true;  // Returning false will result in a "MethodNotFound" error.
  }

  public void  checkLocationPermission(){
    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      if (ContextCompat.checkSelfPermission(actContext,Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(actContext,new String[]{Manifest.permission.ACCESS_FINE_LOCATION},MY_PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION);
      } else {
        performOperation();
      }
    } else {
      performOperation();
    }
  }

  private void performOperation() {
    actContext.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (savedAction.equals(HISTORY_STUFF_1) || savedAction.equals(HISTORY_STUFF_2)) {
          getActivityDataFromHistory();
        } else if (savedAction.equals(SENSOR_API_START)) {
          starActivityDataLiveUpdate();
        } else if (savedAction.equals(SENSOR_API_STOP)) {
          stopActivityDataLiveUpdate();
        } else if (savedAction.equals(RECORDING_API_START)) {
          startActivityDataRecording();
        } else if (savedAction.equals(RECORDING_API_STOP)) {
          stopActivityDataRecording();
        }
      }
    });
  }

  private  void reconnect() {
    // Make sure the app is not already connected or attempting to connect
    //performOperation();
  }

  /**
  * Handles the registration to the GoogleFit API
  * @param requestCode   The request code originally supplied to startActivityForResult(),
  *                      allowing you to identify who this result came from.
  * @param resultCode    The integer result code returned by the child activity through its setResult().
  * @param data
  */
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    if (requestCode == REQUEST_OAUTH) {
      authInProgress = false;
      if (resultCode == Activity.RESULT_OK) {
        reconnect();
      }
    }
  }


  @Override
  public void onDestroy(){
    if (sensorClassObj != null) {
      sensorClassObj.stop();
    }
    if (historyClassObj != null) {
      historyClassObj.stop();
    }
    if (recordingClassObj != null) {
//    recordingClassObj.stop();
    }
  }
}
