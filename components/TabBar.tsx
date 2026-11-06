import { FontAwesome6 } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORES, ESPACIADO, FUENTES, TIPOGRAFIA } from "../constants/theme";

const TABS = [
    { ruta: "/", icono: "microphone", etiqueta: "Grabar" },
    { ruta: "/historial", icono: "clock-rotate-left", etiqueta: "Historial" },
    { ruta: "/perfil", icono: "user", etiqueta: "Perfil" },
] as const;

export default function TabBar() {
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.contenedor, { paddingBottom: insets.bottom || ESPACIADO.sm }]}>
            {TABS.map((tab) => {
                const activo = pathname === tab.ruta;
                return (
                    <TouchableOpacity
                        key={tab.ruta}
                        style={styles.tab}
                        onPress={() => router.navigate(tab.ruta)}
                        accessibilityLabel={tab.etiqueta}
                    >
                        <FontAwesome6
                            name={tab.icono}
                            size={20}
                            color={activo ? COLORES.accentCool : COLORES.textMuted}
                        />
                        <Text style={[styles.etiqueta, { color: activo ? COLORES.accentCool : COLORES.textMuted }]}>
                            {tab.etiqueta}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export const TAB_BAR_HEIGHT = 56;

const styles = StyleSheet.create({
    contenedor: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: COLORES.surface,
        borderTopWidth: 1,
        borderTopColor: COLORES.border,
        paddingTop: ESPACIADO.sm,
    },
    tab: {
        flex: 1,
        alignItems: "center",
        gap: ESPACIADO.xs,
    },
    etiqueta: {
        fontSize: TIPOGRAFIA.minimo,
        fontFamily: FUENTES.cuerpoMedio,
    },
});
