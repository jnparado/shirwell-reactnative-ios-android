import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import WebView, {type WebViewNavigation} from 'react-native-webview';

export default function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const webRef = useRef<WebView>(null);
  const [url, setUrl] = useState('https://shirwel.com/');
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

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
    webRef.current?.injectJavaScript(
      `window.location.href = ${JSON.stringify(normalizedUrl)}; true;`,
    );
  }, [normalizedUrl]);

  return (
    <SafeAreaView style={[styles.root, {backgroundColor: theme.bg}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bar} />

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
      </View>

      <WebView
        ref={webRef}
        source={{uri: normalizedUrl}}
        onNavigationStateChange={onNav}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        setSupportMultipleWindows={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
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
});
