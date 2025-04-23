import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Check if the user has already onboarded
        const onboarded = await AsyncStorage.getItem("onboarded");

        if (onboarded === "true") {
          setIsOnboarded(true);
        } else {
          setIsOnboarded(false);
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      if (!isOnboarded) {
        // Redirect to the onboarding screen if not onboarded
        router.replace("/onboarding");
      }
    }
  }, [isReady, isOnboarded]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <React.Fragment>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </React.Fragment>
  );
}
