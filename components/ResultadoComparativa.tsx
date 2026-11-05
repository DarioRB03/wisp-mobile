import * as Clipboard from "expo-clipboard";
import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS, copiarYAbrir, etiquetaDestino } from "../lib/destinos";
import BotonConRebote from "./BotonConRebote";

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
            <View style={styles.cabecera}>
                <FontAwesome6
                    name={destino?.icono ?? "circle"}
                    iconStyle={destino?.iconoBrand ? "brand" : "solid"}
                    size={14}
                    color={COLORES.textMuted}
                />
                <Text style={styles.etiquetaFormato}>{destino?.nombre ?? item.formato}</Text>
            </View>
            <Text style={styles.texto}>{item.post}</Text>

            <BotonConRebote style={[styles.botonPequeno, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                <Text style={styles.botonTextoPequeno}>{copiado ? t("comun.copiado") : t("comun.copiar")}</Text>
            </BotonConRebote>

            {destino && (
                <TouchableOpacity
                    style={[styles.botonPequeno, { backgroundColor: destino.color }]}
                    onPress={() => copiarYAbrir(item.formato, item.post)}
                >
                    <Text style={styles.botonTextoPequeno}>{etiquetaDestino(item.formato, t)}</Text>
                </TouchableOpacity>
            )}

            <BotonConRebote
                style={[styles.botonPequeno, { backgroundColor: "transparent", borderWidth: 1, borderColor: COLORES.border, opacity: guardado ? 0.5 : 1 }]}
                onPress={guardar}
                disabled={guardado}
            >
                <Text style={[styles.botonTextoPequeno, { color: COLORES.textMuted }]}>{guardado ? t("comun.guardado") : t("comun.guardarHistorial")}</Text>
            </BotonConRebote>
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
    cabecera: { flexDirection: "row", alignItems: "center", gap: ESPACIADO.sm, marginBottom: ESPACIADO.xs },
    etiquetaFormato: { color: COLORES.text, fontSize: TIPOGRAFIA.cuerpo, fontWeight: "500" },
    texto: { color: COLORES.text, fontSize: TIPOGRAFIA.pequeno + 1 },
    botonPequeno: { borderRadius: RADIOS.sm, paddingVertical: ESPACIADO.sm, alignItems: "center" },
    botonTextoPequeno: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.minimo + 1 },
});