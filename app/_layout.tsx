import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { COLORES } from "../constants/theme";
import { inicializarI18n } from "../lib/i18n";

export default function RootLayout() {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    inicializarI18n().then(() => setListo(true));
  }, []);

  if (!listo) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORES.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={COLORES.accentCool} />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}