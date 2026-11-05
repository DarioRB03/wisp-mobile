import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { FORMATOS } from "../constants/formatos";
import { COLORES, ESPACIADO } from "../constants/theme";
import { DESTINOS } from "../lib/destinos";

type Props = {
    formato: string;
    onCambiar: (formato: string) => void;
    bloqueado?: boolean;
};

export default function SelectorFormato({ formato, onCambiar, bloqueado }: Props) {
    return (
        <View style={[styles.fila, bloqueado && styles.bloqueado]}>
            {FORMATOS.map((f) => {
                const activo = formato === f.valor;
                const dest = DESTINOS[f.valor];
                return (
                    <TouchableOpacity
                        key={f.valor}
                        onPress={() => onCambiar(f.valor)}
                        disabled={bloqueado}
                        accessibilityLabel={f.etiqueta}
                        style={[styles.boton, { backgroundColor: activo ? COLORES.accentCool : "transparent", borderColor: activo ? COLORES.accentCool : COLORES.border }]}
                    >
                        <FontAwesome6
                            name={dest?.icono ?? "circle"}
                            iconStyle={dest?.iconoBrand ? "brand" : "solid"}
                            size={18}
                            color={activo ? "white" : COLORES.textMuted}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, justifyContent: "center", marginTop: ESPACIADO.lg },
    boton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    bloqueado: { opacity: 0.4 },
});