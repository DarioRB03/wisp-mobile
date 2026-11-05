import { FontAwesome6 } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS } from "../lib/destinos";

type Props = {
    formato: string;
    fecha: string;
    post: string;
    onPress: () => void;
};

export default function ItemHistorial({ formato, fecha, post, onPress }: Props) {
    const dest = DESTINOS[formato];
    return (
        <TouchableOpacity style={styles.tarjeta} onPress={onPress}>
            <View style={styles.fila}>
                <FontAwesome6
                    name={dest?.icono ?? "circle"}
                    iconStyle={dest?.iconoBrand ? "brand" : "solid"}
                    size={13}
                    color={COLORES.textMuted}
                />
                <Text style={styles.fecha}>{fecha}</Text>
            </View>
            <Text style={styles.post} numberOfLines={3}>{post}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tarjeta: { backgroundColor: COLORES.surface, borderRadius: RADIOS.sm, borderWidth: 1, borderColor: COLORES.border, padding: ESPACIADO.md },
    fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: ESPACIADO.xs + 2 },
    fecha: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.minimo },
    post: { color: COLORES.text, fontSize: TIPOGRAFIA.pequeno + 1 },
});