import { FontAwesome6 } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FORMATOS } from "../constants/formatos";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS } from "../lib/destinos";

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
                {FORMATOS.map((f) => {
                    const activo = seleccionados.includes(f.valor);
                    const deshabilitado = !activo && seleccionados.length >= maximo;
                    const dest = DESTINOS[f.valor];
                    return (
                        <TouchableOpacity
                            key={f.valor}
                            onPress={() => alternar(f.valor)}
                            disabled={deshabilitado}
                            accessibilityLabel={f.etiqueta}
                            style={[
                                styles.boton,
                                {
                                    backgroundColor: activo ? COLORES.accentCool : "transparent",
                                    borderColor: activo ? COLORES.accentCool : deshabilitado ? "#20232E" : COLORES.border,
                                },
                            ]}
                        >
                            <FontAwesome6
                                name={dest?.icono ?? "circle"}
                                iconStyle={dest?.iconoBrand ? "brand" : "solid"}
                                size={18}
                                color={activo ? "white" : deshabilitado ? "#3A3E4D" : COLORES.textMuted}
                            />
                        </TouchableOpacity>
                    );
                })}
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
    boton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: "center", justifyContent: "center" },
    contador: { color: COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno },
});