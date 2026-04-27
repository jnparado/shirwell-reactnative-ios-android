#import "AppDelegate.h"

#import <GoogleMobileAds/GoogleMobileAds.h>
#import <React/RCTBundleURLProvider.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"WebViewApp";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  BOOL ok = [super application:application didFinishLaunchingWithOptions:launchOptions];
  [[GADMobileAds sharedInstance] startWithCompletionHandler:nil];
  return ok;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  NSURL *releaseBundle = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
  if (releaseBundle != nil) {
    return releaseBundle;
  }

  // If you run a non-Debug scheme without bundling JS, fall back to Metro so the app can still boot.
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#endif
}

@end
