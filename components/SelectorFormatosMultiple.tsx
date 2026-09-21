import { StyleSheet, View } from "react-native";
import { FORMATOS } from "../constants/formatos";
import { ESPACIADO } from "../constants/theme";
import SelectorPill from "./SelectorPill";

type Props = {
    seleccionados: string[];
    onCambiar: (formatos: string[]) => void;
    maximo?: number;
};

export default function SelectorFormatosMultiple({ seleccionados, onCambiar, maximo = 3 }: Props) {
    function alternar(f: string) {
        if (seleccionados.includes(f)) {
            onCambiar(seleccionados.filter((x) => x !== f));
        } else if (seleccionados.length < maximo) {
            onCambiar([...seleccionados, f]);
        }
    }

    return (
        <View style={styles.fila}>
            {FORMATOS.map((f) => (
                <SelectorPill key={f.valor} etiqueta={f.etiqueta} activo={seleccionados.includes(f.valor)} onPress={() => alternar(f.valor)} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, justifyContent: "center", marginTop: ESPACIADO.lg },
});