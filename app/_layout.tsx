import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { COLORES } from "../constants/theme";
import { inicializarI18n } from "../lib/i18n";

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