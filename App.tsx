import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  type ViewProps,
  requireNativeComponent,
} from 'react-native';
import WebView, {type WebViewNavigation} from 'react-native-webview';

const ShirwellAdBannerView =
  Platform.OS === 'ios'
    ? requireNativeComponent<ViewProps>('ShirwellAdBanner')
    : null;

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const webRef = useRef<WebView>(null);
  const [url, setUrl] = useState('https://shirwel.com/');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const isIOS = Platform.OS === 'ios';
  const [isLoading, setIsLoading] = useState(true);
  const [webError, setWebError] = useState<string | null>(null);

  const theme = useMemo(
    () => ({
      bg: isDarkMode ? '#0B0F14' : '#FFFFFF',
      bar: isDarkMode ? '#0B0F14' : '#FFFFFF',
      text: isDarkMode ? '#EAF0F6' : '#111827',
      muted: isDarkMode ? '#9CA3AF' : '#6B7280',
      border: isDarkMode ? '#223040' : '#E5E7EB',
      chip: isDarkMode ? '#101826' : '#F3F4F6',
    }),
    [isDarkMode],
  );

  const onNav = (nav: WebViewNavigation) => {
    setCanGoBack(Boolean(nav.canGoBack));
    setCanGoForward(Boolean(nav.canGoForward));
  };

  const normalizedUrl = useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return 'https://example.com';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }, [url]);

  const navigateWebViewToNormalizedUrl = useCallback(() => {
    setWebError(null);
    webRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(normalizedUrl)}; true;`,
    );
  }, [normalizedUrl]);

  return (
    <SafeAreaView style={[styles.root, {backgroundColor: theme.bg}]}>
      <StatusBar
        hidden={isIOS}
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bar}
      />

      <View style={[styles.topBar, {borderBottomColor: theme.border}]}>
        <View style={styles.row}>
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.chip, {backgroundColor: theme.chip, opacity: canGoBack ? 1 : 0.5}]}
            onPress={() => webRef.current?.goBack()}
            disabled={!canGoBack}>
            <Text style={[styles.chipText, {color: theme.text}]}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.chip, {backgroundColor: theme.chip, opacity: canGoForward ? 1 : 0.5}]}
            onPress={() => webRef.current?.goForward()}
            disabled={!canGoForward}>
            <Text style={[styles.chipText, {color: theme.text}]}>Next</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.chip, {backgroundColor: theme.chip}]}
            onPress={() => webRef.current?.reload()}>
            <Text style={[styles.chipText, {color: theme.text}]}>Reload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.urlRow}>
          <TextInput
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder="Enter URL (e.g. example.com)"
            placeholderTextColor={theme.muted}
            style={[
              styles.urlInput,
              {color: theme.text, borderColor: theme.border, backgroundColor: theme.chip},
            ]}
            onSubmitEditing={navigateWebViewToNormalizedUrl}
          />
          <TouchableOpacity
            accessibilityRole="button"
            style={[styles.goButton, {backgroundColor: theme.text}]}
            onPress={navigateWebViewToNormalizedUrl}>
            <Text style={[styles.goText, {color: theme.bg}]}>Go</Text>
          </TouchableOpacity>
        </View>

        {webError ? (
          <Text style={[styles.statusText, {color: '#B91C1C'}]} numberOfLines={2}>
            {webError}
          </Text>
        ) : isLoading ? (
          <Text style={[styles.statusText, {color: theme.muted}]} numberOfLines={1}>
            Loading…
          </Text>
        ) : null}
      </View>

      <View style={styles.body}>
        <WebView
          ref={webRef}
          style={styles.web}
          source={{uri: normalizedUrl}}
          onNavigationStateChange={onNav}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          setSupportMultipleWindows={false}
          onLoadStart={() => {
            setIsLoading(true);
            setWebError(null);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={e => {
            setIsLoading(false);
            setWebError(
              e.nativeEvent?.description
                ? `WebView error: ${e.nativeEvent.description}`
                : 'WebView error',
            );
          }}
          onHttpError={e => {
            setIsLoading(false);
            setWebError(`HTTP error: ${e.nativeEvent.statusCode}`);
          }}
          renderError={errorName => (
            <View style={[styles.error, {borderColor: theme.border}]}>
              <Text style={[styles.errorTitle, {color: theme.text}]}>WebView failed</Text>
              <Text style={[styles.errorBody, {color: theme.muted}]}>{String(errorName)}</Text>
              <Text style={[styles.errorBody, {color: theme.muted}]} numberOfLines={2}>
                {normalizedUrl}
              </Text>
            </View>
          )}
          {...(isIOS
            ? {
                allowsBackForwardNavigationGestures: true,
                contentInsetAdjustmentBehavior: 'never' as const,
              }
            : {})}
        />
        {isIOS && ShirwellAdBannerView != null ? (
          <ShirwellAdBannerView style={styles.adBanner} collapsable={false} />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
  body: {flex: 1},
  web: {flex: 1, backgroundColor: 'transparent'},
  statusText: {marginTop: 8, fontSize: 12, fontWeight: '600'},
  adBanner: {
    width: '100%',
    height: 50,
    alignSelf: 'stretch',
    backgroundColor: 'transparent',
  },
  topBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  row: {flexDirection: 'row', gap: 8, marginBottom: 10},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: {fontSize: 14, fontWeight: '600'},
  urlRow: {flexDirection: 'row', gap: 8, alignItems: 'center'},
  urlInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
  },
  goButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goText: {fontSize: 14, fontWeight: '700'},
  error: {
    margin: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  errorTitle: {fontSize: 14, fontWeight: '800', marginBottom: 4},
  errorBody: {fontSize: 12, fontWeight: '600'},
});
