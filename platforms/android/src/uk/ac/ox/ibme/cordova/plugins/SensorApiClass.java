package uk.ac.ox.ibme.cordova.plugins;

import android.app.Activity;
import android.content.Context;
import android.content.IntentSender;
import android.nfc.Tag;
import android.os.Bundle;
import android.util.Log;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.Scopes;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.fitness.Fitness;
import com.google.android.gms.fitness.data.DataPoint;
import com.google.android.gms.fitness.data.DataSource;
import com.google.android.gms.fitness.data.DataType;
import com.google.android.gms.fitness.data.Field;
import com.google.android.gms.fitness.data.Value;
import com.google.android.gms.fitness.request.DataSourcesRequest;
import com.google.android.gms.fitness.request.OnDataPointListener;
import com.google.android.gms.fitness.request.SensorRequest;
import com.google.android.gms.fitness.result.DataSourcesResult;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.concurrent.TimeUnit;

/**
* Created by macmini2012 on 02/07/16.
*/
public class SensorApiClass {

  private static String TAG = "SensorApiClass";

  private CallbackContext savedCallbackContext;

  protected CallbackContext stopCallbackContext;

  private static final int REQUEST_OAUTH = 1;
  private static final String AUTH_PENDING = "auth_state_pending";
  private boolean authInProgress = false;

  private GoogleApiClient mApiClient;
  private OnDataPointListener stepsCountListener;
  private OnDataPointListener distanceCountListener;

  public Activity appActivity;
  public Context appContext;

  /*Constructor*/
  SensorApiClass(Activity activity, Context context, JSONArray savedArgs, String savedAction, CallbackContext savedCallbackContext) {
    appActivity = activity;
    appContext = context;

    this.savedCallbackContext = savedCallbackContext;

    buildFitnessClient();
  }

  // [START auth_build_googleapiclient_beginning]
  /**
  *  Build a {@link GoogleApiClient} that will authenticate the user and allow the application
  *  to connect to Fitness APIs. The scopes included should match the scopes your app needs
  *  (see documentation for details). Authentication will occasionally fail intentionally,
  *  and in those cases, there will be a known resolution, which the OnConnectionFailedListener()
  *  can address. Examples of this include the user never having signed in before, or having
  *  multiple accounts on the device and needing to specify which account to use, etc.
  */
  private void buildFitnessClient() {
    if (mApiClient == null) {
      mApiClient = new GoogleApiClient.Builder(appContext)
      .addApi(Fitness.SENSORS_API)
      .addScope(new Scope(Scopes.FITNESS_ACTIVITY_READ_WRITE))
      .addConnectionCallbacks(

      new GoogleApiClient.ConnectionCallbacks() {

        @Override
        public void onConnected(Bundle bundle) {
          Log.i(TAG, "Connected!!!");
          // Now you can make calls to the Fitness APIs.
          findFitnessDataSources();
        }

        @Override
        public void onConnectionSuspended(int i) {
          // If your connection to the sensor gets lost at some point,
          // you'll be able to determine the reason and react to it here.
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
      .addOnConnectionFailedListener(new GoogleApiClient.OnConnectionFailedListener(){
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
  }

  // [END auth_build_googleapiclient_beginning]

  /**
  * Find available data sources and attempt to register on a specific {@link DataType}.
  * If the application cares about a data type but doesn't care about the source of the data,
  * this can be skipped entirely, instead calling
  *     {@link com.google.android.gms.fitness.SensorsApi
  *     #register(GoogleApiClient, SensorRequest, DataSourceListener)},
  * where the {@link SensorRequest} contains the desired data type.
  */
  private void findFitnessDataSources() {
    // [START find_data_sources]
    // Note: Fitness.SensorsApi.findDataSources() requires the ACCESS_FINE_LOCATION permission.
    Log.e(TAG, "Google Fit SENSORS_API Connected");

    DataSourcesRequest dataSourceRequest = new DataSourcesRequest.Builder()
    .setDataTypes( DataType.TYPE_DISTANCE_DELTA,DataType.TYPE_STEP_COUNT_DELTA)
    .setDataSourceTypes(DataSource.TYPE_DERIVED)
    .build();

    ResultCallback<DataSourcesResult> dataSourcesResultCallback = new ResultCallback<DataSourcesResult>() {
      @Override
      public void onResult(DataSourcesResult dataSourcesResult) {
        DataSource distanceDataSource = null;
        DataSource stepDataSource = null;

        for( DataSource dataSource : dataSourcesResult.getDataSources() ) {
          if( DataType.TYPE_DISTANCE_DELTA.equals( dataSource.getDataType() ) ) {
            distanceDataSource = dataSource;
          }
          if( DataType.TYPE_STEP_COUNT_DELTA.equals( dataSource.getDataType() ) ) {
            stepDataSource = dataSource;
          }
        }

        if (distanceDataSource != null) {
          registerStepsDataListener(distanceDataSource, DataType.TYPE_DISTANCE_DELTA);
        }
        if (stepDataSource != null) {
          registerDistanceDataListener(stepDataSource, DataType.TYPE_STEP_COUNT_DELTA);
        }
      }
    };

    Fitness.SensorsApi.findDataSources(mApiClient, dataSourceRequest)
    .setResultCallback(dataSourcesResultCallback);
  }



  private void registerStepsDataListener(DataSource dataSource, DataType dataType) {
    // [START register_data_listener]
    stepsCountListener = new OnDataPointListener() {
      @Override
      public void onDataPoint(DataPoint dataPoint) {
        handleSensorResponse(dataPoint);
      }
    };
    addSensorsApi(dataSource, dataType, stepsCountListener);
  }

  private void registerDistanceDataListener(DataSource dataSource, DataType dataType) {
    // [START register_data_listener]
    distanceCountListener = new OnDataPointListener() {
      @Override
      public void onDataPoint(DataPoint dataPoint) {
        handleSensorResponse(dataPoint);
      }
    };
    addSensorsApi(dataSource, dataType, distanceCountListener);
  }

  private void addSensorsApi(DataSource dataSource, DataType dataType, OnDataPointListener mListener) {
    SensorRequest request = new SensorRequest.Builder()
            .setDataSource( dataSource )
            .setDataType( dataType )
            .setSamplingRate(5, TimeUnit.SECONDS )
            .setAccuracyMode(SensorRequest.ACCURACY_MODE_HIGH)
            .build();

    Fitness.SensorsApi.add(mApiClient, request, mListener)
            .setResultCallback(new ResultCallback<Status>() {
              @Override
              public void onResult(Status status) {
                if (status.isSuccess()) {
                  Log.e( "GoogleFit", "SensorApi successfully added" );
                }
              }
            });
  }

  private void handleSensorResponse (DataPoint dataPoint) {
    for( final Field field : dataPoint.getDataType().getFields() ) {
      final Value value = dataPoint.getValue( field );
      try{
        JSONObject actVal = new JSONObject();
        actVal.put("field", field.getName());
        actVal.put("value", value);
        PluginResult result = new PluginResult(PluginResult.Status.OK,
                actVal);
        result.setKeepCallback(true);
        if (savedCallbackContext != null) {
          savedCallbackContext.sendPluginResult(result);
        }
      } catch (Exception e) {
        if (savedCallbackContext != null) {
          PluginResult result = new PluginResult(PluginResult.Status.ERROR,
                  e.getMessage());
          result.setKeepCallback(true);
          if (savedCallbackContext != null) {
            savedCallbackContext.sendPluginResult(result);
          }
        }
      }
    }
  }

  private void removeFitnessDataListener(OnDataPointListener mListener) {
    if (mListener != null) {
      Fitness.SensorsApi.remove( mApiClient, mListener)
              .setResultCallback(new ResultCallback<Status>() {
                @Override
                public void onResult(Status status) {
                  mApiClient.disconnect();
                  if (stopCallbackContext != null) {
                    stopCallbackContext.success("Successfully Disconnect");
                  }
                }
              });
    }
  }

  public void start() {
    if (!mApiClient.isConnected()) {
      mApiClient.connect();
    }
  }

  public void stop() {
    if (mApiClient.isConnected()) {
      removeFitnessDataListener(stepsCountListener);
      removeFitnessDataListener(distanceCountListener);
    }
  }

  protected void onSaveInstanceState(Bundle outState) {
    outState.putBoolean(AUTH_PENDING, authInProgress);
  }
}
