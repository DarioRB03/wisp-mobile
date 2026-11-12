import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SelectorIdioma from "../components/SelectorIdioma";
import SkeletonPerfil from "../components/SkeletonPerfil";
import TabBar from "../components/TabBar";
import FichaVoz from "../components/FichaVoz";
import OnboardingVoz from "../components/OnboardingVoz";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { guardarPerfil, obtenerPerfil, obtenerFicha, type EstadoFicha } from "../lib/api";
import { supabase } from "../lib/supabase";

type Perfil = { sector: string; audiencia: string; estilo: string; postsReferencia: string };
const PERFIL_VACIO: Perfil = { sector: "", audiencia: "", estilo: "", postsReferencia: "" };
const ESTILOS = ["directo", "reflexivo", "cercano", "tecnico"] as const;

function parsearPerfil(raw: string): Perfil {
    if (!raw) return PERFIL_VACIO;
    try {
        const p = JSON.parse(raw);
        return { sector: p.sector || "", audiencia: p.audiencia || "", estilo: p.estilo || "", postsReferencia: p.postsReferencia || "" };
    } catch { return PERFIL_VACIO; }
}

export default function Perfil() {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [guardado, setGuardado] = useState(false);
    const [error, setError] = useState("");
    const [estadoFicha, setEstadoFicha] = useState<EstadoFicha | null>(null);

    useEffect(() => {
        obtenerPerfil()
            .then((raw) => setPerfil(parsearPerfil(raw)))
            .finally(() => setCargando(false));
        obtenerFicha().then(setEstadoFicha).catch(() => {});
    }, []);

    function set(campo: keyof Perfil, valor: string) {
        setPerfil((p) => ({ ...p, [campo]: valor }));
    }

    async function manejarGuardar() {
        setGuardando(true);
        setError("");
        try {
            await guardarPerfil(JSON.stringify(perfil));
            setGuardado(true);
            setTimeout(() => setGuardado(false), 1800);
        } catch {
            setError(t("perfil.errorGuardar"));
        } finally {
            setGuardando(false);
        }
    }

    const perfilCompleto = !!(perfil.sector.trim() || perfil.audiencia.trim() || perfil.estilo);

    return (
        <View style={{ flex: 1, backgroundColor: COLORES.bg }}>
            <ScrollView
                contentContainerStyle={[s.scroll, { paddingTop: (insets.top || ESPACIADO.xl) + ESPACIADO.lg, paddingBottom: 90 }]}
                keyboardShouldPersistTaps="handled"
            >
                <View style={s.header}>
                    <Text style={s.titulo}>{t("perfil.titulo")}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: ESPACIADO.md }}>
                        <SelectorIdioma />
                        <TouchableOpacity onPress={() => supabase.auth.signOut()}>
                            <Text style={s.cerrar}>{t("nav.cerrarSesion")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={s.descripcion}>{t("perfil.descripcion")}</Text>

                {cargando ? (
                    <SkeletonPerfil />
                ) : (
                    <>
                        {perfilCompleto && (
                            <View style={s.perfilActivoBadge}>
                                <View style={s.dot} />
                                <Text style={s.perfilActivoTexto}>{t("perfil.perfilActivo")}</Text>
                            </View>
                        )}

                        <FichaVoz />

                        {estadoFicha && (
                            <OnboardingVoz
                                numNotas={estadoFicha.num_notas}
                                minimoNotas={estadoFicha.minimo_notas}
                                tieneficha={!!estadoFicha.ficha}
                            />
                        )}

                        {/* Sector */}
                        <View style={s.campo}>
                            <Text style={s.label}>{t("perfil.sector")}</Text>
                            <TextInput
                                style={s.input}
                                value={perfil.sector}
                                onChangeText={(v) => set("sector", v)}
                                placeholder={t("perfil.sectorPlaceholder")}
                                placeholderTextColor={COLORES.textMuted}
                                maxLength={200}
                            />
                        </View>

                        {/* Audiencia */}
                        <View style={s.campo}>
                            <Text style={s.label}>{t("perfil.audiencia")}</Text>
                            <TextInput
                                style={s.input}
                                value={perfil.audiencia}
                                onChangeText={(v) => set("audiencia", v)}
                                placeholder={t("perfil.audienciaPlaceholder")}
                                placeholderTextColor={COLORES.textMuted}
                                maxLength={200}
                            />
                        </View>

                        {/* Estilo */}
                        <View style={s.campo}>
                            <Text style={s.label}>{t("perfil.estiloLabel")}</Text>
                            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: ESPACIADO.sm, marginTop: ESPACIADO.xs }}>
                                {ESTILOS.map((e) => (
                                    <TouchableOpacity
                                        key={e}
                                        style={[s.pill, perfil.estilo === e && s.pillActivo]}
                                        onPress={() => set("estilo", perfil.estilo === e ? "" : e)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[s.pillTexto, perfil.estilo === e && s.pillTextoActivo]}>
                                            {t(`perfil.estilo_${e}`)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Posts de referencia */}
                        <View style={s.campo}>
                            <Text style={s.label}>{t("perfil.postsReferencia")}</Text>
                            <Text style={s.descripcionCampo}>{t("perfil.postsReferenciaDesc")}</Text>
                            <TextInput
                                style={[s.input, { minHeight: 120, textAlignVertical: "top", paddingTop: ESPACIADO.sm }]}
                                value={perfil.postsReferencia}
                                onChangeText={(v) => set("postsReferencia", v)}
                                placeholder={t("perfil.postsReferenciaPlaceholder")}
                                placeholderTextColor={COLORES.textMuted}
                                multiline
                                maxLength={4000}
                            />
                            <Text style={s.contador}>{perfil.postsReferencia.length}/4000</Text>
                        </View>

                        {error ? <Text style={s.error}>{error}</Text> : null}

                        <TouchableOpacity style={s.boton} onPress={manejarGuardar} disabled={guardando}>
                            {guardando
                                ? <ActivityIndicator color="white" />
                                : <Text style={s.botonTexto}>{guardado ? t("comun.guardado") : t("perfil.guardar")}</Text>
                            }
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
            <TabBar />
        </View>
    );
}

const s = StyleSheet.create({
    scroll: { paddingHorizontal: ESPACIADO.lg },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: ESPACIADO.sm },
    titulo: { fontFamily: FUENTES.display, fontSize: TIPOGRAFIA.subtitulo, color: COLORES.text },
    cerrar: { color: COLORES.danger, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno },
    descripcion: { color: COLORES.textMuted, fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, marginBottom: ESPACIADO.lg },
    perfilActivoBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACIADO.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.sm,
        borderRadius: RADIOS.sm,
        backgroundColor: "rgba(108,111,240,0.12)",
        borderWidth: 1,
        borderColor: "rgba(108,111,240,0.25)",
        marginBottom: ESPACIADO.lg,
    },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORES.accentCool },
    perfilActivoTexto: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.accentCool, flex: 1 },
    campo: { marginBottom: ESPACIADO.lg },
    label: { fontFamily: FUENTES.cuerpoMedio, fontSize: TIPOGRAFIA.pequeno, color: COLORES.text, marginBottom: ESPACIADO.xs },
    descripcionCampo: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo + 1, color: COLORES.textMuted, marginBottom: ESPACIADO.sm },
    input: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.sm,
        color: COLORES.text,
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.pequeno,
    },
    contador: { fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.minimo, color: COLORES.textMuted, textAlign: "right", marginTop: 4 },
    pill: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.xs + 2,
    },
    pillActivo: { backgroundColor: COLORES.accentCool, borderColor: COLORES.accentCool },
    pillTexto: { fontFamily: FUENTES.cuerpoMedio, fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted },
    pillTextoActivo: { color: "white" },
    boton: { backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, alignItems: "center", marginTop: ESPACIADO.sm },
    botonTexto: { color: "white", fontFamily: FUENTES.cuerpoNegro, fontSize: TIPOGRAFIA.cuerpo },
    error: { color: "#F87171", fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, marginBottom: ESPACIADO.sm },
});
