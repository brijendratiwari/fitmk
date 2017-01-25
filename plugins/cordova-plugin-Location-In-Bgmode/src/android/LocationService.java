package cordova.plugin.Location.In.Bgmode;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;

public class LocationService extends Service implements LocationListener
{
  public static final String LOCATION_OPTIONS  = "locationoptions";
  private static final String LOCATION_ACCURACY  = "accuracy";
  private static final String LOCATION_FILTER  = "filter";
  private static final String ALLOW_BACKGROUND_UPDATES  = "allowBackgroundUpdates";

  private static final String TAG  = "LocationService";

  public static final String BROADCAST_ACTION = "GetLocation";
  private static final int TWO_MINUTES = 1000 * 60 * 2;
  public LocationManager locationManager;
  public Location previousBestLocation = null;

  Intent intent;
  int counter = 0;

  public static HashMap jsonObjectToMap(JSONObject jObject) throws JSONException {
    HashMap<String, String> map = new HashMap<String, String>();
    Iterator<?> keys = jObject.keys();

    while( keys.hasNext() ){
      String key = (String)keys.next();
      String value = jObject.getString(key);
      map.put(key, value);
    }
    return map;
  }

  @Override
  public void onCreate()
  {
    super.onCreate();
    intent = new Intent(BROADCAST_ACTION);
  }

  public void handleStart(Intent intent, int startId)
  {
    int intervalTime = 2*1000;
    float filter = 0;
    float accuracy = 0;
    boolean allowBackgroundUpdates = false;
    try {
      String jstring = intent.getStringExtra(LOCATION_OPTIONS);
      if (jstring != null) {
        HashMap options = jsonObjectToMap(new JSONObject(jstring));
        filter = Float.parseFloat(options.get(LOCATION_FILTER).toString());
        accuracy = Float.parseFloat(options.get(LOCATION_ACCURACY).toString());
        allowBackgroundUpdates = Boolean.parseBoolean(options.get(ALLOW_BACKGROUND_UPDATES).toString());
      }

    } catch (Exception e) {
      Log.e(TAG, e.getMessage());
    }

    locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    // getting GPS status
    boolean isGPSEnabled = locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
    boolean isNetworkEnabled = locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);

    Log.d(TAG, "onStart: ");
    try {
      if (!isGPSEnabled && !isNetworkEnabled) {
        // no network provider is enabled
      } else if(isGPSEnabled && isNetworkEnabled){
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, intervalTime, filter, this);
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,intervalTime,filter, this);
        if (locationManager != null) {
          //          Location loc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
          //          if (loc != null) {
          //            previousBestLocation = loc;
          //            sendLocationBroadcast(loc);
          //          }
        }
      } else if (isNetworkEnabled) {
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,intervalTime,filter, this);
        if (locationManager != null) {
          //          Location loc = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
          //          if (loc != null) {
          //            previousBestLocation = loc;
          //            sendLocationBroadcast(loc);
          //          }
        }
      } else if (isGPSEnabled) {
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, intervalTime, filter, this);
        if (locationManager != null) {
          //          Location loc = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
          //          if (loc != null) {
          //            previousBestLocation = loc;
          //            sendLocationBroadcast(loc);
          //          }
        }
      }
    } catch (SecurityException e) {

    }
  }
  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    handleStart(intent, startId);
    Log.d(TAG, "onStartCommand: ");
    return START_NOT_STICKY;
  }

  @Override
  public IBinder onBind(Intent intent)
  {
    return null;
  }

  protected boolean isBetterLocation(Location location, Location currentBestLocation) {
    if (currentBestLocation == null) {
      // A new location is always better than no location
      return true;
    }

    // Check whether the new location fix is newer or older
    long timeDelta = location.getTime() - currentBestLocation.getTime();
    //    boolean isSignificantlyNewer = timeDelta > TWO_MINUTES;
    //    boolean isSignificantlyOlder = timeDelta < -TWO_MINUTES;
    boolean isNewer = timeDelta > 0;

    // If it's been more than two minutes since the current location, use the new location
    // because the user has likely moved
    //    if (isSignificantlyNewer) {
    //      return true;
    //      // If the new location is more than two minutes older, it must be worse
    //    } else if (isSignificantlyOlder) {
    //      return false;
    //    }

    // Check whether the new location fix is more or less accurate
    int accuracyDelta = (int) (location.getAccuracy() - currentBestLocation.getAccuracy());
    boolean isLessAccurate = accuracyDelta > 0;
    boolean isMoreAccurate = accuracyDelta < 0;
    boolean isSignificantlyLessAccurate = accuracyDelta > 200;

    // Check if the old and new location are from the same provider
    boolean isFromSameProvider = isSameProvider(location.getProvider(),
    currentBestLocation.getProvider());

    // Determine location quality using a combination of timeliness and accuracy
    if (isMoreAccurate) {
      return true;
    } else if (isNewer && !isLessAccurate) {
      return true;
    } else if (isNewer && !isSignificantlyLessAccurate && isFromSameProvider) {
      return true;
    }
    return false;
  }



  /** Checks whether two providers are the same */
  private boolean isSameProvider(String provider1, String provider2) {
    if (provider1 == null) {
      return provider2 == null;
    }
    return provider1.equals(provider2);
  }



  @Override
  public void onDestroy() {
    // handler.removeCallbacks(sendUpdatesToUI);
    super.onDestroy();
    Log.v("STOP_SERVICE", "DONE");
    try{
      locationManager.removeUpdates(this);
    }catch (SecurityException e) {

    }
  }

  public static Thread performOnBackgroundThread(final Runnable runnable) {
    final Thread t = new Thread() {
      @Override
      public void run() {
        try {
          runnable.run();
        } finally {

        }
      }
    };
    t.start();
    return t;
  }


  private void sendLocationBroadcast(final Location loc) {
    loc.getLatitude();
    loc.getLongitude();
    intent.putExtra("Latitude", loc.getLatitude());
    intent.putExtra("Longitude", loc.getLongitude());
    intent.putExtra("Provider", loc.getProvider());
    sendBroadcast(intent);
  }


  @Override
  public void onLocationChanged(final Location loc)
  {
    Log.i("MyLocationListener", "Location changed");

    if(isBetterLocation(loc, previousBestLocation)) {
      previousBestLocation = loc;
      sendLocationBroadcast(loc);
    }
  }

  @Override
  public void onProviderDisabled(String provider)
  {
  }

  @Override
  public void onProviderEnabled(String provider)
  {
  }

  @Override
  public void onStatusChanged(String provider, int status, Bundle extras)
  {
  }
}
