import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { cambiarIdioma, IDIOMAS_SOPORTADOS } from "../lib/i18n";

const ETIQUETAS: Record<string, { corta: string; nombre: string }> = {
    es: { corta: "ES", nombre: "Español" },
    en: { corta: "EN", nombre: "English" },
};

export default function SelectorIdioma() {
    const { i18n } = useTranslation();

    return (
        <View style={styles.fila} accessibilityRole="radiogroup">
            {IDIOMAS_SOPORTADOS.map((codigo) => {
                const activo = i18n.language === codigo;
                return (
                    <TouchableOpacity
                        key={codigo}
                        onPress={() => cambiarIdioma(codigo)}
                        accessibilityLabel={ETIQUETAS[codigo].nombre}
                        accessibilityState={{ selected: activo }}
                        style={[
                            styles.pill,
                            {
                                backgroundColor: activo ? COLORES.accentCool : "transparent",
                                borderColor: activo ? COLORES.accentCool : COLORES.border,
                            },
                        ]}
                    >
                        <Text style={{ color: activo ? "white" : COLORES.textMuted, fontSize: TIPOGRAFIA.minimo, fontWeight: "600" }}>
                            {ETIQUETAS[codigo].corta}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", gap: ESPACIADO.xs },
    pill: { paddingHorizontal: ESPACIADO.sm, paddingVertical: ESPACIADO.xs / 2, borderRadius: RADIOS.full, borderWidth: 1 },
});