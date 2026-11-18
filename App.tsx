import React from "react";
import { StatusBar } from "expo-status-bar";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { Image, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { store } from "./src/store";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { setTokenProvider } from "./src/api/client";
import { usePersistence } from "./src/hooks/usePersistence";

// Interceptor của axios lấy token từ store qua hàm này
setTokenProvider(() => store.getState().auth.token);

function StartupSplash() {
  return (
    <View style={styles.splash}>
      <Image source={require("./assets/splash.png")} style={StyleSheet.absoluteFill} resizeMode="contain" />
    </View>
  );
}

function Root() {
  const ready = usePersistence(); // đọc AsyncStorage → tự đăng nhập
  return (
    <>
      <StatusBar style="light" />
      {ready ? (
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      ) : (
        <StartupSplash />
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Root />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: "#0B1F5C" },
});
