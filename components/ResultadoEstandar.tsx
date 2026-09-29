import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { DESTINOS, copiarYAbrir, etiquetaDestino } from "../lib/destinos";
import SelectorPill from "./SelectorPill";

type Variante = { tono: string; post: string };

type Props = {
    variantes: Variante[];
    formato: string;
    onGuardar: (post: string) => Promise<void>;
};

export default function ResultadoEstandar({ variantes, formato, onGuardar }: Props) {
    const { t } = useTranslation();
    const [activa, setActiva] = useState(0);
    const [guardado, setGuardado] = useState(false);
    const [copiado, setCopiado] = useState(false);

    const destino = DESTINOS[formato];

    async function guardar() {
        await onGuardar(variantes[activa].post);
        setGuardado(true);
    }

    async function copiar() {
        await Clipboard.setStringAsync(variantes[activa].post);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1800);
    }

    return (
        <View style={styles.contenedor}>
            <View style={styles.pestanas}>
                {variantes.map((v, i) => (
                    <SelectorPill
                        key={v.tono}
                        etiqueta={t(`tonos.${v.tono}`, { defaultValue: v.tono })}
                        activo={activa === i}
                        onPress={() => {
                            setActiva(i);
                            setGuardado(false);
                        }}
                    />
                ))}
            </View>

            <View style={styles.caja}>
                <Text style={styles.texto}>{variantes[activa].post}</Text>
            </View>

            <TouchableOpacity style={[styles.boton, { backgroundColor: COLORES.accentCool }]} onPress={copiar}>
                <Text style={styles.botonTexto}>{copiado ? t("comun.copiado") : t("comun.copiar")}</Text>
            </TouchableOpacity>

            {destino && (
                <TouchableOpacity
                    style={[styles.boton, { backgroundColor: COLORES.surface, borderWidth: 1, borderColor: COLORES.border }]}
                    onPress={() => copiarYAbrir(formato, variantes[activa].post)}
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
    pestanas: { flexDirection: "row", gap: ESPACIADO.sm, marginBottom: ESPACIADO.md },
    caja: { width: "100%", borderWidth: 1, borderColor: COLORES.accentWarm, borderRadius: RADIOS.sm, padding: ESPACIADO.md },
    texto: { color: COLORES.text, fontSize: TIPOGRAFIA.cuerpo },
    boton: { width: "100%", borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, alignItems: "center" },
    botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
});