import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    formato: string;
    fecha: string;
    post: string;
    onPress: () => void;
};

export default function ItemHistorial({ formato, fecha, post, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.tarjeta} onPress={onPress}>
            <View style={styles.fila}>
                <Text style={styles.formato}>{formato}</Text>
                <Text style={styles.fecha}>{fecha}</Text>
            </View>
            <Text style={styles.post} numberOfLines={3}>{post}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tarjeta: { backgroundColor: COLORES.surface, borderRadius: RADIOS.sm, borderWidth: 1, borderColor: COLORES.border, padding: ESPACIADO.md },
    fila: { flexDirection: "row", justifyContent: "space-between", marginBottom: ESPACIADO.xs + 2 },
    formato: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.minimo, fontWeight: "600", textTransform: "uppercase" },
    fecha: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo },
    post: { color: COLORES.text, fontSize: TIPOGRAFIA.pequeno + 1 },
});