package com.shirwell.shirwell

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.appopen.AppOpenAd

/**
 * Native AdMob App Open ads (Android only). Uses [R.string.admob_app_open_unit_id] and
 * [R.string.admob_application_id] (via manifest meta-data).
 */
class ShirwellAppOpenAds(private val application: Application) : Application.ActivityLifecycleCallbacks {

  private var appOpenAd: AppOpenAd? = null
  private var isLoadingAd = false
  private var currentActivity: Activity? = null

  fun start() {
    MobileAds.initialize(application) {}
    application.registerActivityLifecycleCallbacks(this)
    loadAd()
  }

  private fun loadAd() {
    if (isLoadingAd || appOpenAd != null) return
    isLoadingAd = true
    val unitId = application.getString(R.string.admob_app_open_unit_id)
    AppOpenAd.load(
        application,
        unitId,
        AdRequest.Builder().build(),
        object : AppOpenAd.AppOpenAdLoadCallback() {
          override fun onAdLoaded(ad: AppOpenAd) {
            isLoadingAd = false
            appOpenAd = ad
            tryShowLoadedAd()
          }

          override fun onAdFailedToLoad(error: LoadAdError) {
            isLoadingAd = false
            Log.w(TAG, "App open load failed: ${error.message}")
          }
        })
  }

  private fun tryShowLoadedAd() {
    val activity = currentActivity as? MainActivity ?: return
    val ad = appOpenAd ?: return
    appOpenAd = null
    ad.fullScreenContentCallback =
        object : FullScreenContentCallback() {
          override fun onAdDismissedFullScreenContent() {
            loadAd()
          }

          override fun onAdFailedToShowFullScreenContent(adError: AdError) {
            Log.w(TAG, "App open show failed: ${adError.message}")
            loadAd()
          }
        }
    ad.show(activity)
  }

  override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}

  override fun onActivityStarted(activity: Activity) {
    if (activity is MainActivity) {
      currentActivity = activity
      if (appOpenAd != null) {
        tryShowLoadedAd()
      } else if (!isLoadingAd) {
        loadAd()
      }
    }
  }

  override fun onActivityResumed(activity: Activity) {
    currentActivity = activity
  }

  override fun onActivityPaused(activity: Activity) {
    if (currentActivity === activity) {
      currentActivity = null
    }
  }

  override fun onActivityStopped(activity: Activity) {}

  override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}

  override fun onActivityDestroyed(activity: Activity) {}

  companion object {
    private const val TAG = "ShirwellAppOpenAds"
  }
}
