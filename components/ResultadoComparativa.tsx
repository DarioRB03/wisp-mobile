import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS, copiarYAbrir, etiquetaDestino } from "../lib/destinos";

type Item = { formato: string; post: string };

type Props = {
    resultados: Item[];
    onGuardar: (post: string, formato: string) => Promise<void>;
};

function TarjetaComparativa({ item, onGuardar }: { item: Item; onGuardar: (post: string, formato: string) => Promise<void> }) {
    const { t } = useTranslation();
    const [guardado, setGuardado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const destino = DESTINOS[item.formato];

    async function guardar() {
        await onGuardar(item.post, item.formato);
        setGuardado(true);
    }

    async function copiar() {
        await Clipboard.setStringAsync(item.post);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
    }

    return (
        <View style={styles.caja}>
            <Text style={styles.etiquetaFormato}>{item.formato.toUpperCase()}</Text>
            <Text style={styles.texto}>{item.post}</Text>

            <TouchableOpacity style={[styles.botonPequeno, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                <Text style={styles.botonTextoPequeno}>{copiado ? t("comun.copiado") : t("comun.copiar")}</Text>
            </TouchableOpacity>

            {destino && (
                <TouchableOpacity
                    style={[styles.botonPequeno, { backgroundColor: COLORES.bg, borderWidth: 1, borderColor: COLORES.border }]}
                    onPress={() => copiarYAbrir(item.formato, item.post)}
                >
                    <Text style={styles.botonTextoPequeno}>{etiquetaDestino(item.formato, t)}</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={[styles.botonPequeno, { backgroundColor: guardado ? COLORES.border : COLORES.accentWarm }]}
                onPress={guardar}
                disabled={guardado}
            >
                <Text style={styles.botonTextoPequeno}>{guardado ? t("comun.guardado") : t("comun.guardarHistorial")}</Text>
            </TouchableOpacity>
        </View>
    );
}

export default function ResultadoComparativa({ resultados, onGuardar }: Props) {
    return (
        <View style={styles.contenedor}>
            {resultados.map((item, i) => (
                <TarjetaComparativa key={i} item={item} onGuardar={onGuardar} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { width: "100%", marginTop: ESPACIADO.xl - 4, gap: ESPACIADO.md },
    caja: { width: "100%", borderWidth: 1, borderColor: COLORES.border, borderRadius: RADIOS.sm, padding: ESPACIADO.md, gap: ESPACIADO.sm },
    etiquetaFormato: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.minimo, fontWeight: "600", marginBottom: ESPACIADO.xs },
    texto: { color: COLORES.text, fontSize: TIPOGRAFIA.pequeno + 1 },
    botonPequeno: { borderRadius: RADIOS.sm, paddingVertical: ESPACIADO.sm, alignItems: "center" },
    botonTextoPequeno: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.minimo + 1 },
});