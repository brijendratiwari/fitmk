package uk.ac.ox.ibme.cordova.plugins;

import android.app.Activity;
import android.content.Context;
import android.content.IntentSender;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.fitness.Fitness;
import com.google.android.gms.fitness.FitnessStatusCodes;
import com.google.android.gms.fitness.data.DataType;
import com.google.android.gms.fitness.data.Subscription;
import com.google.android.gms.fitness.result.ListSubscriptionsResult;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Created by macmini2012 on 02/07/16.
 */
public class RecordingApiClass {
  private static String TAG = "RecordingApiClass";

  private CallbackContext savedCallbackContext;

  protected CallbackContext stopCallbackContext;
  protected CallbackContext subscriptionsCallbackContext;

  private GoogleApiClient recordingApiClient;

  public Activity appActivity;
  public Context appContext;

  private static final int REQUEST_OAUTH = 1;
  private static final String AUTH_PENDING = "auth_state_pending";
  private boolean authInProgress = false;

  /*Constructor*/
  RecordingApiClass(Activity activity, Context context, JSONArray savedArgs, String savedAction, CallbackContext savedCallbackContext) {
    appActivity = activity;
    appContext = context;

    this.savedCallbackContext = savedCallbackContext;

    buildFitnessClient();
  }

  /**
   *  Build a {@link GoogleApiClient} that will authenticate the user and allow the application
   *  to connect to Fitness APIs. The scopes included should match the scopes your app needs
   *  (see documentation for details). Authentication will occasionally fail intentionally,
   *  and in those cases, there will be a known resolution, which the OnConnectionFailedListener()
   *  can address. Examples of this include the user never having signed in before, or having
   *  multiple accounts on the device and needing to specify which account to use, etc.
   */
  private void buildFitnessClient() {
    // Create the Google API Client
    recordingApiClient = new GoogleApiClient.Builder(appContext)
            .addApi(Fitness.RECORDING_API)
            .addScope(new Scope(Scopes.FITNESS_ACTIVITY_READ_WRITE))
            .addConnectionCallbacks(
                    new GoogleApiClient.ConnectionCallbacks() {

                      @Override
                      public void onConnected(Bundle bundle) {
                        subscribe();
                      }

                      @Override
                      public void onConnectionSuspended(int i) {
                        if (i == GoogleApiClient.ConnectionCallbacks.CAUSE_NETWORK_LOST) {
                          Log.i(TAG, "Connection lost.  Cause: Network Lost.");
                        } else if (i
                                == GoogleApiClient.ConnectionCallbacks.CAUSE_SERVICE_DISCONNECTED) {
                          Log.i(TAG,
                                  "Connection lost.  Reason: Service Disconnected");
                        }
                      }
                    }
            )
            .addOnConnectionFailedListener(
                    new GoogleApiClient.OnConnectionFailedListener(){
                      @Override
                      public void onConnectionFailed(ConnectionResult connectionResult) {
                        if( !authInProgress ) {
                          try {
                            authInProgress = true;
                            connectionResult.startResolutionForResult( appActivity, REQUEST_OAUTH );
                          } catch(IntentSender.SendIntentException e ) {

                          }
                        } else {
                          Log.e( "GoogleFit", "authInProgress" );
                        }
                      }
                    })
            .build();
  }


  /**
   * Fetch a list of all active subscriptions and log it. Since the logger for this sample
   * also prints to the screen, we can see what is happening in this way.
   */
  public void dumpSubscriptionsList() {
    AsyncTask.execute(new SubscriptionsList(DataType.TYPE_STEP_COUNT_DELTA));
    AsyncTask.execute(new SubscriptionsList(DataType.TYPE_DISTANCE_DELTA));
    AsyncTask.execute(new SubscriptionsList(DataType.TYPE_ACTIVITY_SAMPLE));
    AsyncTask.execute(new SubscriptionsList(DataType.TYPE_CALORIES_EXPENDED));
  }

  /**.............................................
   * Subscribe to an available {@link DataType}. Subscriptions can exist across application
   * instances (so data is recorded even after the application closes down).  When creating
   * a new subscription, it may already exist from a previous invocation of this app.  If
   * the subscription already exists, the method is a no-op.  However, you can check this with
   * a special success code.
   */
  public void subscribe() {
    AsyncTask.execute(new RecordActivity(DataType.TYPE_STEP_COUNT_DELTA));
    AsyncTask.execute(new RecordActivity(DataType.TYPE_DISTANCE_DELTA));
    AsyncTask.execute(new RecordActivity(DataType.AGGREGATE_DISTANCE_DELTA));
    AsyncTask.execute(new RecordActivity(DataType.TYPE_ACTIVITY_SAMPLE));
    AsyncTask.execute(new RecordActivity(DataType.TYPE_CALORIES_EXPENDED));
  }

  /**
   * Cancel the ACTIVITY_SAMPLE subscription by calling unsubscribe on that {@link DataType}.
   */
  private void cancelSubscription() {
    AsyncTask.execute(new StopRecordingActivity(DataType.TYPE_STEP_COUNT_DELTA));
    AsyncTask.execute(new StopRecordingActivity(DataType.TYPE_DISTANCE_DELTA));
    AsyncTask.execute(new StopRecordingActivity(DataType.AGGREGATE_DISTANCE_DELTA));
    AsyncTask.execute(new StopRecordingActivity(DataType.TYPE_ACTIVITY_SAMPLE));
    AsyncTask.execute(new StopRecordingActivity(DataType.TYPE_CALORIES_EXPENDED));
  }

  private  class RecordActivity extends Thread {

    private DataType dataType;

    public RecordActivity(DataType dataType) {
      this.dataType = dataType;
    }

    @Override
    public void run() {
      Fitness.RecordingApi.subscribe(recordingApiClient, this.dataType)
              .setResultCallback(new ResultCallback<Status>() {
                @Override
                public void onResult(Status status) {

                  PluginResult.Status plugStatus = PluginResult.Status.OK;

                  if (status.isSuccess()) {
                    if (status.getStatusCode() == FitnessStatusCodes.SUCCESS_ALREADY_SUBSCRIBED) {
                      plugStatus = PluginResult.Status.OK;
                      Log.i(TAG, "");
                    } else {
                      plugStatus = PluginResult.Status.OK;
                    }
                  } else {
                    plugStatus = PluginResult.Status.ERROR;
                  }


                  if (savedCallbackContext != null) {
                    try {
                      JSONObject jo = new JSONObject();
                      jo.put("DataType", dataType.getName());
                      jo.put("StatusMsg", status.getStatusMessage());

                      PluginResult result = new PluginResult(plugStatus, jo);
                      result.setKeepCallback(true);
                      savedCallbackContext.sendPluginResult(result);
                    }
                    catch (Exception e) {
                      PluginResult result = new PluginResult(plugStatus, e.getMessage());
                      result.setKeepCallback(true);
                      savedCallbackContext.sendPluginResult(result);
                    }
                  }
                }
              });
    }
  }

  private  class StopRecordingActivity extends Thread {

    private DataType dataType;

    public StopRecordingActivity(DataType dataType) {
      this.dataType = dataType;
    }

    @Override
    public void run() {
      Fitness.RecordingApi.unsubscribe(recordingApiClient, dataType)
              .setResultCallback(new ResultCallback<Status>() {
                @Override
                public void onResult(Status status) {

                  recordingApiClient.disconnect();

                  PluginResult.Status plugStatus = PluginResult.Status.NO_RESULT;

                  if (status.isSuccess()) {
                    plugStatus = PluginResult.Status.OK;
                  } else {
                    plugStatus = PluginResult.Status.ERROR;
                  }

                  if (stopCallbackContext != null) {
                    PluginResult result = new PluginResult(plugStatus,
                            dataType.toString()+ " " + status.getStatusMessage());
                    result.setKeepCallback(true);
                    stopCallbackContext.sendPluginResult(result);
                  }
                }
              });
    }
  }

  private  class SubscriptionsList extends Thread {

    private DataType dataType;

    public SubscriptionsList(DataType dataType) {
      this.dataType = dataType;
    }

    @Override
    public void run() {
      Fitness.RecordingApi.listSubscriptions(recordingApiClient, dataType)
              // Create the callback to retrieve the list of subscriptions asynchronously.
              .setResultCallback(new ResultCallback<ListSubscriptionsResult>() {
                @Override
                public void onResult(ListSubscriptionsResult listSubscriptionsResult) {
                  for (Subscription sc : listSubscriptionsResult.getSubscriptions()) {
                    DataType dt = sc.getDataType();

                    if (subscriptionsCallbackContext != null) {
                      PluginResult result = new PluginResult(PluginResult.Status.OK,
                              "Active subscription for data type: " + dt.getName());
                      result.setKeepCallback(true);
                      subscriptionsCallbackContext.sendPluginResult(result);
                    }
                  }
                }
              });
    }
  }

  public void start() {
    if (!recordingApiClient.isConnected()) {
      recordingApiClient.connect();
    }
  }

  public void stop() {
    if (recordingApiClient.isConnected()) {
      cancelSubscription();
    }
  }

  protected void onSaveInstanceState(Bundle outState) {
    outState.putBoolean(AUTH_PENDING, authInProgress);
  }
}
