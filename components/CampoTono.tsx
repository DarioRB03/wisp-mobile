import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    tono: string;
    onCambiar: (tono: string) => void;
};

export default function CampoTono({ tono, onCambiar }: Props) {
    const { t } = useTranslation();

    return (
        <View style={styles.contenedor}>
            <Text style={styles.etiqueta}>{t("tono.etiqueta")}</Text>
            <TextInput
                style={styles.input}
                placeholder={t("tono.placeholder")}
                placeholderTextColor={COLORES.textMuted}
                value={tono}
                onChangeText={onCambiar}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { width: "100%", marginTop: ESPACIADO.md, gap: ESPACIADO.xs },
    etiqueta: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno },
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        color: COLORES.text,
        fontSize: TIPOGRAFIA.cuerpo,
    },
});