import { StyleSheet, TextInput } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    tono: string;
    onCambiar: (tono: string) => void;
};

export default function CampoTono({ tono, onCambiar }: Props) {
    return (
        <TextInput
            style={styles.input}
            placeholder="¿Con qué tono? Ej: sarcástico, cercano..."
            placeholderTextColor={COLORES.textMuted}
            value={tono}
            onChangeText={onCambiar}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        width: "100%",
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        marginTop: ESPACIADO.md,
        color: COLORES.text,
        fontSize: TIPOGRAFIA.cuerpo,
    },
});