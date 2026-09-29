import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";

type Props = {
    uso: { usadas: number; limite: number; restantes: number; racha: number } | null;
};

export default function ContadorUso({ uso }: Props) {
    const { t } = useTranslation();

    if (!uso) return null;

    return (
        <View style={styles.contenedor}>
            <Text style={[styles.texto, { color: uso.restantes <= 3 ? COLORES.accentWarm : COLORES.textMuted }]}>
                {t("uso.restantes", { restantes: uso.restantes, limite: uso.limite })}
            </Text>
            <Text style={[styles.texto, { color: uso.racha > 0 ? COLORES.accentWarm : COLORES.border, marginTop: ESPACIADO.xs / 2 }]}>
                🔥 {t("racha.deRacha", { count: uso.racha })}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { alignItems: "center", marginTop: ESPACIADO.md },
    texto: { fontSize: TIPOGRAFIA.pequeno },
});