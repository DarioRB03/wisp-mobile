import { StyleSheet, Text, View } from "react-native";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";

type Props = {
    uso: { usadas: number; limite: number; restantes: number; racha: number } | null;
};

export default function ContadorUso({ uso }: Props) {
    if (!uso) return null;

    return (
        <View style={styles.contenedor}>
            <Text style={[styles.texto, { color: uso.restantes <= 3 ? COLORES.accentWarm : COLORES.textMuted }]}>
                {uso.restantes} de {uso.limite} generaciones restantes este mes
            </Text>
            <Text style={[styles.texto, { color: uso.racha > 0 ? COLORES.accentWarm : COLORES.border, marginTop: ESPACIADO.xs / 2 }]}>
                🔥 {uso.racha} {uso.racha === 1 ? "día" : "días"} de racha
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { alignItems: "center", marginTop: ESPACIADO.md },
    texto: { fontSize: TIPOGRAFIA.pequeno },
});