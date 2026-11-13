import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, LogBox, Platform, View } from "react-native";

LogBox.ignoreLogs([
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported",
]);
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { COLORES } from "../constants/theme";
import { inicializarI18n } from "../lib/i18n";
import { registrarPushToken } from "../lib/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registrarParaNotificaciones() {
  if (!Device.isDevice) return;
  const { status: existente } = await Notifications.getPermissionsAsync();
  let estado = existente;
  if (existente !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    estado = status;
  }
  if (estado !== "granted") return;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
  try {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await registrarPushToken(token).catch(() => {});
  } catch {
    // Falla silenciosamente en Expo Go o sin projectId configurado
  }
}

export default function RootLayout() {
  const [listo, setListo] = useState(false);
  const [fontsCargadas, errorFuentes] = useFonts({
    "Fraunces-SemiBold":    require("../assets/fonts/Fraunces-SemiBold.ttf"),
    "Manrope-Regular":      require("../assets/fonts/Manrope-Regular.ttf"),
    "Manrope-Medium":       require("../assets/fonts/Manrope-Medium.ttf"),
    "Manrope-SemiBold":     require("../assets/fonts/Manrope-SemiBold.ttf"),
    "IBMPlexMono-Regular":  require("../assets/fonts/IBMPlexMono-Regular.ttf"),
    "IBMPlexMono-Medium":   require("../assets/fonts/IBMPlexMono-Medium.ttf"),
  });

  useEffect(() => {
    inicializarI18n().then(() => setListo(true));
    registrarParaNotificaciones();
  }, []);

  if (!listo || (!fontsCargadas && !errorFuentes)) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORES.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORES.accentCool} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}