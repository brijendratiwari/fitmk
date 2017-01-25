/********* LocationInBgmode.m Cordova Plugin Implementation *******/

#import "LocationInBgMode.h"

#define IS_OS_8_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
#define IS_OS_9_OR_LATER ([[[UIDevice currentDevice] systemVersion] floatValue] >= 9.0)

static NSString * const kLocationAccuracy = @"accuracy";

static NSString * const kLocationFilter = @"filter";

static NSString * const kLocationAllowBackgroundUpdates = @"allowBackgroundUpdates";

@interface LocationInBgmode : CDVPlugin<CLLocationManagerDelegate>

@property (nonatomic, retain) CLLocationManager *locationManager;

@property (nonatomic, assign) BOOL isBackgroundMode;

@property (nonatomic, assign) BOOL deferringUpdates;

@property (nonatomic, retain) CLLocation *userLocation;

@property (nonatomic, retain) NSString *callbackId;

@property (nonatomic, retain) NSDictionary *options;

@property (nonatomic, assign) BOOL isGetCurrentLocation;

@end

@implementation LocationInBgmode

- (void)getCurrentLocation:(CDVInvokedUrlCommand*)command {
    self.isGetCurrentLocation = true;
    [self startLocationUpdate:command];
}

- (void)startLocationUpdate:(CDVInvokedUrlCommand*)command {
    self.callbackId = command.callbackId;
    if (command.arguments.count > 0) {
        self.options = [command.arguments firstObject];
    }
    [self initLocationManager];
    [self registerForApplicationStateChangedNotification];
}

- (void)stopLocationUpdate:(CDVInvokedUrlCommand*)command {
    self.callbackId = command.callbackId;
    [self.locationManager stopUpdatingLocation];
    self.locationManager = nil;
    [self sendSuccessCallBack:@{@"success":@true}];
    [self deRegisterApplicationStateChangedNotification];
}

- (void) sendSuccessCallBack:(NSDictionary*)response {
    if (self.callbackId) {
        CDVPluginResult *pluginResult=[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:response];
        pluginResult.keepCallback = @true;
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

- (void) sendErrorCallBack:(NSString *)errorMsg {
    if (self.callbackId) {
        CDVPluginResult *pluginResult=[CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:errorMsg];
        pluginResult.keepCallback = @true;
        [self.commandDelegate sendPluginResult:pluginResult callbackId:self.callbackId];
    }
}

#pragma mark - Location Methods

- (void) initLocationManager {
    self.userLocation = nil;

    // Create the manager object
    if (!self.locationManager) {
        self.locationManager = [[CLLocationManager alloc] init];
    }
    _locationManager.delegate = self;
    [self setOptionsForLocationManager];
    [_locationManager startUpdatingLocation];
}


- (void) setOptionsForLocationManager {
    CLLocationAccuracy accuracy = [[self.options valueForKey:kLocationAccuracy] integerValue];
    CLLocationDistance filter = [[self.options valueForKey:kLocationFilter] floatValue];
    BOOL allowBackgroundLocation = [[self.options valueForKey:kLocationAllowBackgroundUpdates] boolValue];
    if (accuracy == 0) {
        accuracy = kCLLocationAccuracyBestForNavigation;
    }
    if (filter == 0) {
        filter = kCLDistanceFilterNone;
    }

    _locationManager.desiredAccuracy = accuracy;
    _locationManager.distanceFilter = filter;
    if(IS_OS_8_OR_LATER) {
        [_locationManager requestAlwaysAuthorization];
        if(IS_OS_9_OR_LATER) {
            _locationManager.allowsBackgroundLocationUpdates = allowBackgroundLocation;
        }
    }
}

#pragma mark - Notification for App State Changed

- (void) registerForApplicationStateChangedNotification {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationWillResignActive:) name:UIApplicationWillResignActiveNotification object:[UIApplication sharedApplication]];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationWillEnterForeground:) name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void) deRegisterApplicationStateChangedNotification {
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillResignActiveNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
}

- (void)applicationWillResignActive:(UIApplication *)application {
    _isBackgroundMode = YES;

    [_locationManager stopUpdatingLocation];
    _locationManager.pausesLocationUpdatesAutomatically = NO;
    _locationManager.activityType = CLActivityTypeAutomotiveNavigation;
    [_locationManager startUpdatingLocation];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    _isBackgroundMode = NO;
}

#pragma mark - Location Delegate Methods

-(void) locationManager:(CLLocationManager *)manager didUpdateLocations:(NSArray *)locations {
    CLLocation *newLocation = [locations lastObject];

    if ([self isBetterLocation:newLocation previousBetterLocation:self.userLocation]) {
        self.userLocation = newLocation;
        //tell the centralManager that you want to deferred this updatedLocation
        if (_isBackgroundMode && !_deferringUpdates) {
            _deferringUpdates = YES;
            [self.locationManager allowDeferredLocationUpdatesUntilTraveled:CLLocationDistanceMax timeout:10];
        }
        if (self.isGetCurrentLocation) {
            [self.locationManager stopUpdatingLocation];
            self.isGetCurrentLocation = NO;
        }

        [self sendSuccessCallBack: @{
                                     @"lat":[NSNumber numberWithDouble:self.userLocation.coordinate.latitude],
                                     @"lng":[NSNumber numberWithDouble:self.userLocation.coordinate.longitude]
                                     }];
    }
}

- (void)locationManager:(CLLocationManager *)manager didFailWithError:(NSError *)error {
    [self sendErrorCallBack:error.description];
}

- (void) locationManager:(CLLocationManager *)manager didFinishDeferredUpdatesWithError:(NSError *)error {
    _deferringUpdates = NO;
}

- (BOOL) isBetterLocation:(CLLocation*) currentLocation previousBetterLocation:(CLLocation*)previousBetterLocation {
    if (!previousBetterLocation) {
        return YES;
    }
    NSTimeInterval locationAge = -[currentLocation.timestamp timeIntervalSinceNow];
    if (locationAge > 5.0) {
        return NO;
    }
    // test that the horizontal accuracy does not indicate an invalid measurement

    if (currentLocation.horizontalAccuracy < 0) {
        return NO;
    }

    return YES;
}

@end
