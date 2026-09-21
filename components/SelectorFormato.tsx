import { StyleSheet, View } from "react-native";
import { FORMATOS } from "../constants/formatos";
import { ESPACIADO } from "../constants/theme";
import SelectorPill from "./SelectorPill";

type Props = {
    formato: string;
    onCambiar: (formato: string) => void;
};

export default function SelectorFormato({ formato, onCambiar }: Props) {
    return (
        <View style={styles.fila}>
            {FORMATOS.map((f) => (
                <SelectorPill key={f.valor} etiqueta={f.etiqueta} activo={formato === f.valor} onPress={() => onCambiar(f.valor)} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, justifyContent: "center", marginTop: ESPACIADO.lg },
});