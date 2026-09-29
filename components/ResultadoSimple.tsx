import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS, copiarYAbrir, etiquetaDestino } from "../lib/destinos";

type Props = {
    post: string;
    formato: string;
    onGuardar: (post: string) => Promise<void>;
};

export default function ResultadoSimple({ post, formato, onGuardar }: Props) {
    const { t } = useTranslation();
    const [guardado, setGuardado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const destino = DESTINOS[formato];

    async function guardar() {
        await onGuardar(post);
        setGuardado(true);
    }

    async function copiar() {
        await Clipboard.setStringAsync(post);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
    }

    return (
        <View style={styles.contenedor}>
            <View style={styles.caja}>
                <Text style={styles.texto}>{post}</Text>
            </View>

            <TouchableOpacity style={[styles.boton, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                <Text style={styles.botonTexto}>{copiado ? t("comun.copiado") : t("comun.copiar")}</Text>
            </TouchableOpacity>

            {destino && (
                <TouchableOpacity
                    style={[styles.boton, { backgroundColor: COLORES.surface, borderWidth: 1, borderColor: COLORES.border }]}
                    onPress={() => copiarYAbrir(formato, post)}
                >
                    <Text style={styles.botonTexto}>{etiquetaDestino(formato, t)}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.boton, { backgroundColor: guardado ? COLORES.border : COLORES.accentWarm }]}
                onPress={guardar}
                disabled={guardado}
            >
                <Text style={styles.botonTexto}>{guardado ? t("comun.guardado") : t("comun.guardarHistorial")}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { width: "100%", marginTop: ESPACIADO.xl - 4, gap: ESPACIADO.sm },
    caja: { width: "100%", borderWidth: 1, borderColor: COLORES.accentWarm, borderRadius: RADIOS.sm, padding: ESPACIADO.md },
    texto: { color: COLORES.text, fontSize: TIPOGRAFIA.cuerpo },
    boton: { width: "100%", borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, alignItems: "center" },
    botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
});