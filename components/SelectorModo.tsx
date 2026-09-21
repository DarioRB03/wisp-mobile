import { StyleSheet, View } from "react-native";
import { MODOS } from "../constants/formatos";
import { ESPACIADO } from "../constants/theme";
import SelectorPill from "./SelectorPill";

type Modo = "estandar" | "personalizado" | "comparativa";

type Props = {
    modo: Modo;
    onCambiar: (modo: Modo) => void;
};

export default function SelectorModo({ modo, onCambiar }: Props) {
    return (
        <View style={styles.fila}>
            {MODOS.map((m) => (
                <SelectorPill
                    key={m.valor}
                    etiqueta={m.etiqueta}
                    activo={modo === m.valor}
                    onPress={() => onCambiar(m.valor as Modo)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", gap: ESPACIADO.sm, marginTop: ESPACIADO.xl },
});