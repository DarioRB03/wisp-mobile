import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { ESPACIADO } from "../constants/theme";
import SelectorPill from "./SelectorPill";

type Modo = "estandar" | "personalizado" | "comparativa";

type Props = {
    modo: Modo;
    onCambiar: (modo: Modo) => void;
};

const OPCIONES: Modo[] = ["estandar", "personalizado", "comparativa"];

export default function SelectorModo({ modo, onCambiar }: Props) {
    const { t } = useTranslation();

    return (
        <View style={styles.fila}>
            {OPCIONES.map((valor) => (
                <SelectorPill
                    key={valor}
                    etiqueta={t(`modos.${valor}`)}
                    activo={modo === valor}
                    onPress={() => onCambiar(valor)}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    fila: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, justifyContent: "center", marginTop: ESPACIADO.xl },
});