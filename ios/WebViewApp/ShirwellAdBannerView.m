#import <GoogleMobileAds/GoogleMobileAds.h>
#import <React/RCTUtils.h>
#import <React/RCTViewManager.h>

static NSString *const kShirwellBannerAdUnitId = @"ca-app-pub-2495432679632375/8622739430";

@interface ShirwellAdBannerContainer : UIView
@property (nonatomic, strong) GADBannerView *bannerView;
@property (nonatomic, assign) BOOL didRequestAd;
@end

@implementation ShirwellAdBannerContainer

- (instancetype)init {
  self = [super initWithFrame:CGRectZero];
  if (self) {
    _didRequestAd = NO;
    _bannerView = [[GADBannerView alloc] initWithAdSize:GADAdSizeBanner];
    _bannerView.adUnitID = kShirwellBannerAdUnitId;
    [self addSubview:_bannerView];
  }
  return self;
}

- (void)layoutSubviews {
  [super layoutSubviews];
  CGFloat w = CGRectGetWidth(self.bounds);
  CGFloat h = GADAdSizeBanner.size.height;
  if (w > 0 && h > 0) {
    CGFloat bannerW = MIN(320.0, w);
    CGFloat x = floor((w - bannerW) / 2.0);
    self.bannerView.frame = CGRectMake(x, 0.0, bannerW, h);
  }
}

- (void)didMoveToWindow {
  [super didMoveToWindow];
  if (self.window == nil || self.didRequestAd) {
    return;
  }
  self.didRequestAd = YES;
  UIViewController *vc = RCTPresentedViewController();
  if (vc == nil) {
    vc = self.window.rootViewController;
  }
  self.bannerView.rootViewController = vc;
  [self.bannerView loadRequest:[GADRequest request]];
}

@end

@interface ShirwellAdBannerManager : RCTViewManager
@end

@implementation ShirwellAdBannerManager

RCT_EXPORT_MODULE(ShirwellAdBanner)

- (UIView *)view {
  return [[ShirwellAdBannerContainer alloc] init];
}

@end
