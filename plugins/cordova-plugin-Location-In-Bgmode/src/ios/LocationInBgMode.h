//
//  LocationInBgMode.h
//  HelloCordova
//
//
//

#ifndef LocationInBgMode_h
#define LocationInBgMode_h

#import <Cordova/CDV.h>
#import <CoreLocation/CoreLocation.h>

@interface LocationInBgMode : CDVPlugin <CLLocationManagerDelegate>
- (void)getCurrentLocation:(CDVInvokedUrlCommand*)command;
- (void)startLocationUpdate:(CDVInvokedUrlCommand*)command;
- (void)stopLocationUpdate:(CDVInvokedUrlCommand*)command;

@end

#endif

/* LocationInBgMode_h */
