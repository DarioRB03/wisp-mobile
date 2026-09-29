import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { FORMATOS } from "../constants/formatos";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";
import SelectorPill from "./SelectorPill";

type Props = {
    seleccionados: string[];
    onCambiar: (formatos: string[]) => void;
    maximo?: number;
};

export default function SelectorFormatosMultiple({ seleccionados, onCambiar, maximo = 3 }: Props) {
    const { t } = useTranslation();

    function alternar(f: string) {
        if (seleccionados.includes(f)) {
            onCambiar(seleccionados.filter((x) => x !== f));
        } else if (seleccionados.length < maximo) {
            onCambiar([...seleccionados, f]);
        }
    }

    return (
        <View style={styles.contenedor}>
            <View style={styles.fila}>
                {FORMATOS.map((f) => (
                    <SelectorPill key={f.valor} etiqueta={f.etiqueta} activo={seleccionados.includes(f.valor)} onPress={() => alternar(f.valor)} />
                ))}
            </View>
            <Text style={styles.contador}>
                {t("formatos.seleccionados", { actuales: seleccionados.length, max: maximo })}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { alignItems: "center", gap: ESPACIADO.sm, marginTop: ESPACIADO.lg },
    fila: { flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, justifyContent: "center" },
    contador: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno },
});