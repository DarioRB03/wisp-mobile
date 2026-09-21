import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    onRecuperar: () => void;
    onDescartar: () => void;
};

export default function BannerBorrador({ onRecuperar, onDescartar }: Props) {
    return (
        <View style={styles.contenedor}>
            <Text style={styles.texto}>Tienes un borrador sin terminar</Text>
            <View style={styles.acciones}>
                <TouchableOpacity onPress={onRecuperar}>
                    <Text style={styles.enlaceAmbar}>Recuperar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onDescartar}>
                    <Text style={styles.enlaceMuted}>Descartar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.accentWarm,
        backgroundColor: "rgba(212,162,76,0.08)",
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.sm + 2,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: ESPACIADO.sm,
    },
    texto: { color: COLORES.accentWarm, fontSize: TIPOGRAFIA.minimo, flex: 1 },
    acciones: { flexDirection: "row", gap: ESPACIADO.sm },
    enlaceAmbar: { color: COLORES.accentWarm, fontSize: TIPOGRAFIA.minimo, textDecorationLine: "underline" },
    enlaceMuted: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo, textDecorationLine: "underline" },
});