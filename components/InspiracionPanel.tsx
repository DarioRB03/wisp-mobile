import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { listarIdeas, crearIdea, borrarIdea, obtenerSugerencias, type Idea } from "../lib/api";

type Props = {
    onUsar: (texto: string) => void;
};

export default function InspiracionPanel({ onUsar }: Props) {
    const { t } = useTranslation();
    const [abierto, setAbierto] = useState(false);
    const [temas, setTemas] = useState<string[]>([]);
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [nuevaIdea, setNuevaIdea] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [ideasCargadas, setIdeasCargadas] = useState(false);

    useEffect(() => {
        obtenerSugerencias().then((s) => setTemas(s.temas)).catch(() => {});
        listarIdeas().then((lista) => { setIdeas(lista); setIdeasCargadas(true); }).catch(() => {});
    }, []);

    useEffect(() => {
        if (abierto && !ideasCargadas) {
            setCargando(true);
            listarIdeas()
                .then((lista) => { setIdeas(lista); setIdeasCargadas(true); })
                .catch(() => {})
                .finally(() => setCargando(false));
        }
    }, [abierto]);

    async function guardar() {
        if (!nuevaIdea.trim()) return;
        setGuardando(true);
        try {
            const id = await crearIdea(nuevaIdea.trim());
            setIdeas((prev) => [{ id, texto: nuevaIdea.trim(), creado_en: new Date().toISOString() }, ...prev]);
            setNuevaIdea("");
        } catch {
        } finally {
            setGuardando(false);
        }
    }

    async function eliminar(id: string) {
        await borrarIdea(id);
        setIdeas((prev) => prev.filter((i) => i.id !== id));
    }

    function usar(texto: string) {
        onUsar(texto);
        setAbierto(false);
    }

    return (
        <View style={{ width: "100%", marginBottom: ESPACIADO.sm }}>
            <TouchableOpacity
                style={[s.toggle, abierto && { borderColor: COLORES.accentCool }]}
                onPress={() => setAbierto((v) => !v)}
                activeOpacity={0.7}
            >
                <Text style={{ fontSize: 14 }}>💡</Text>
                <Text style={[s.toggleTexto, abierto && { color: COLORES.accentCool }]}>
                    {t("inspiracion.titulo")}
                </Text>
                {ideas.length > 0 && (
                    <View style={s.badge}>
                        <Text style={s.badgeTexto}>{ideas.length}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {abierto && (
                <View style={s.panel}>
                    {temas.length > 0 && (
                        <View style={{ marginBottom: ESPACIADO.md }}>
                            <Text style={s.seccionLabel}>{t("sugerencias.titulo")}</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.xs, marginTop: ESPACIADO.xs }}>
                                {temas.map((tema) => (
                                    <TouchableOpacity
                                        key={tema}
                                        style={s.chip}
                                        onPress={() => usar(t("sugerencias.prefijo", { tema }))}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={s.chipTexto}>{tema}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={s.separador} />
                        </View>
                    )}

                    <View style={{ flexDirection: "row", gap: ESPACIADO.sm, marginBottom: ESPACIADO.sm }}>
                        <TextInput
                            style={[s.input, { flex: 1 }]}
                            value={nuevaIdea}
                            onChangeText={setNuevaIdea}
                            onSubmitEditing={guardar}
                            placeholder={t("ideas.placeholder")}
                            placeholderTextColor={COLORES.textMuted}
                            maxLength={500}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={[s.botonGuardar, (!nuevaIdea.trim() || guardando) && { opacity: 0.4 }]}
                            onPress={guardar}
                            disabled={!nuevaIdea.trim() || guardando}
                        >
                            {guardando
                                ? <ActivityIndicator size="small" color="white" />
                                : <Text style={s.botonGuardarTexto}>{t("ideas.guardar")}</Text>
                            }
                        </TouchableOpacity>
                    </View>

                    {cargando && <Text style={s.muted}>{t("comun.cargando")}</Text>}
                    {!cargando && ideasCargadas && ideas.length === 0 && (
                        <Text style={s.muted}>{t("ideas.vacio")}</Text>
                    )}

                    {ideas.map((idea) => (
                        <View key={idea.id} style={s.ideaFila}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => usar(idea.texto)} activeOpacity={0.7}>
                                <Text style={s.ideaTexto}>{idea.texto}</Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: "row", gap: ESPACIADO.xs }}>
                                <TouchableOpacity style={s.botonUsar} onPress={() => usar(idea.texto)}>
                                    <Text style={s.botonUsarTexto}>{t("ideas.usar")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={s.botonBorrar} onPress={() => eliminar(idea.id)}>
                                    <Text style={s.botonBorrarTexto}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    toggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACIADO.xs,
        paddingHorizontal: ESPACIADO.sm + 2,
        paddingVertical: ESPACIADO.xs + 2,
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    toggleTexto: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
    },
    badge: {
        backgroundColor: COLORES.accentCool,
        borderRadius: 999,
        paddingHorizontal: 5,
        paddingVertical: 1,
        marginLeft: 2,
    },
    badgeTexto: {
        color: "white",
        fontFamily: FUENTES.mono,
        fontSize: 10,
    },
    panel: {
        marginTop: ESPACIADO.sm,
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.md,
    },
    seccionLabel: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
    },
    chip: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: 999,
        paddingHorizontal: ESPACIADO.sm,
        paddingVertical: 4,
    },
    chipTexto: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
    },
    separador: {
        borderTopWidth: 1,
        borderColor: COLORES.border,
        marginTop: ESPACIADO.md,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: 6,
        paddingHorizontal: ESPACIADO.sm,
        paddingVertical: ESPACIADO.xs,
        color: COLORES.text,
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.pequeno,
    },
    botonGuardar: {
        backgroundColor: COLORES.accentCool,
        borderRadius: 6,
        paddingHorizontal: ESPACIADO.md,
        justifyContent: "center",
    },
    botonGuardarTexto: {
        color: "white",
        fontFamily: FUENTES.cuerpoNegro,
        fontSize: TIPOGRAFIA.pequeno,
    },
    muted: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
    },
    ideaFila: {
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACIADO.sm,
        paddingVertical: ESPACIADO.xs,
        borderBottomWidth: 1,
        borderBottomColor: COLORES.border,
    },
    ideaTexto: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.pequeno,
        color: COLORES.text,
    },
    botonUsar: {
        borderWidth: 1,
        borderColor: COLORES.accentCool,
        borderRadius: 4,
        paddingHorizontal: ESPACIADO.xs,
        paddingVertical: 2,
    },
    botonUsarTexto: {
        color: COLORES.accentCool,
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo,
    },
    botonBorrar: {
        borderWidth: 1,
        borderColor: "#B34747",
        borderRadius: 4,
        paddingHorizontal: ESPACIADO.xs,
        paddingVertical: 2,
    },
    botonBorrarTexto: {
        color: "#E07C7C",
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo,
    },
});
