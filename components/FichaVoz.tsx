import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { obtenerFicha, regenerarFicha, type EstadoFicha, type FichaVoz as FichaVozType } from "../lib/api";

function Lista({ titulo, items }: { titulo: string; items: string[] }) {
    if (!items?.length) return null;
    return (
        <View style={{ gap: 2, marginBottom: ESPACIADO.sm }}>
            <Text style={s.etiqueta}>{titulo}</Text>
            {items.map((it, i) => (
                <View key={i} style={{ flexDirection: "row", gap: ESPACIADO.xs }}>
                    <Text style={{ color: COLORES.accentWarm, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno }}>·</Text>
                    <Text style={s.item}>{it}</Text>
                </View>
            ))}
        </View>
    );
}

function Chips({ titulo, items }: { titulo: string; items: string[] }) {
    if (!items?.length) return null;
    return (
        <View style={{ marginBottom: ESPACIADO.sm }}>
            <Text style={s.etiqueta}>{titulo}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.xs, marginTop: 4 }}>
                {items.map((it, i) => (
                    <View key={i} style={s.chip}>
                        <Text style={s.chipTexto}>{it}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

export default function FichaVoz() {
    const { t, i18n } = useTranslation();
    const [estado, setEstado] = useState<EstadoFicha | null>(null);
    const [regenerando, setRegenerando] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        obtenerFicha().then(setEstado).catch(() => {});
    }, []);

    async function regenerar() {
        setRegenerando(true);
        setError(false);
        try {
            const ficha = await regenerarFicha();
            setEstado((prev) => prev ? { ...prev, ficha, actualizada_en: new Date().toISOString() } : prev);
        } catch {
            setError(true);
        } finally {
            setRegenerando(false);
        }
    }

    if (!estado) return null;

    const puedeRegenerar = estado.num_notas >= estado.minimo_notas;
    const f = estado.ficha;
    const fecha = estado.actualizada_en
        ? new Date(estado.actualizada_en).toLocaleDateString(i18n.language === "en" ? "en-GB" : "es-ES", { day: "numeric", month: "short" })
        : "";

    return (
        <View style={s.contenedor}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: ESPACIADO.sm }}>
                <Text style={s.titulo}>{t("ficha.titulo")}</Text>
                {puedeRegenerar && (
                    <TouchableOpacity onPress={regenerar} disabled={regenerando}>
                        {regenerando
                            ? <ActivityIndicator size="small" color={COLORES.accentCool} />
                            : <Text style={{ color: COLORES.accentCool, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1 }}>{t("ficha.actualizar")}</Text>
                        }
                    </TouchableOpacity>
                )}
            </View>

            {!f ? (
                <Text style={s.item}>{t("ficha.vacia", { minimo: estado.minimo_notas, actual: estado.num_notas })}</Text>
            ) : (
                <>
                    {f.resumen ? <Text style={[s.item, { fontStyle: "italic", marginBottom: ESPACIADO.sm }]}>{f.resumen}</Text> : null}
                    <Lista titulo={t("ficha.comoEscribes")} items={f.rasgos_escritura} />
                    <Chips titulo={t("ficha.expresiones")} items={f.expresiones_propias} />
                    <Lista titulo={t("ficha.correcciones")} items={f.correcciones_habituales} />
                    <Lista titulo={t("ficha.evitar")} items={f.evitar} />
                    <Chips titulo={t("ficha.temas")} items={f.temas_recurrentes} />
                    <Lista titulo={t("ficha.posturas")} items={f.posturas} />
                    {fecha ? <Text style={[s.item, { marginTop: ESPACIADO.xs }]}>{t("ficha.actualizada", { fecha })}</Text> : null}
                </>
            )}
            {error ? <Text style={{ color: "#F87171", fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, marginTop: ESPACIADO.xs }}>{t("ficha.error")}</Text> : null}
        </View>
    );
}

const s = StyleSheet.create({
    contenedor: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
        marginBottom: ESPACIADO.lg,
    },
    titulo: {
        fontFamily: FUENTES.mono,
        fontSize: TIPOGRAFIA.minimo,
        color: COLORES.accentWarm,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    etiqueta: {
        fontFamily: FUENTES.cuerpoMedio,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.text,
        marginBottom: 2,
    },
    item: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
        lineHeight: 18,
    },
    chip: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: 999,
        paddingHorizontal: ESPACIADO.sm,
        paddingVertical: 2,
    },
    chipTexto: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo,
        color: COLORES.textMuted,
    },
});
