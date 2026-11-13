import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { guardarPerfil } from "../lib/api";

const ONBOARDING_KEY = "wisp_onboarding_done";
const ESTILOS = ["directo", "reflexivo", "cercano", "tecnico"] as const;

type Perfil = { sector: string; audiencia: string; estilo: string };
const PERFIL_VACIO: Perfil = { sector: "", audiencia: "", estilo: "" };

function PuntosProgreso({ paso }: { paso: number }) {
    return (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {[0, 1, 2].map((i) => (
                <View
                    key={i}
                    style={{
                        height: 8,
                        width: i === paso ? 28 : 8,
                        borderRadius: 999,
                        backgroundColor: i <= paso ? COLORES.accentWarm : COLORES.border,
                    }}
                />
            ))}
        </View>
    );
}

function PasoUno({ perfil, onChange }: { perfil: Perfil; onChange: (p: Perfil) => void }) {
    const { t } = useTranslation();
    return (
        <View style={{ gap: ESPACIADO.xl }}>
            <View>
                <Text style={s.tituloPaso}>{t("wizard.paso1Titulo")}</Text>
                <Text style={s.descPaso}>{t("wizard.paso1Desc")}</Text>
            </View>

            <View style={{ gap: ESPACIADO.lg }}>
                <View style={{ gap: ESPACIADO.sm }}>
                    <Text style={s.label}>{t("perfil.sector")}</Text>
                    <TextInput
                        style={s.input}
                        value={perfil.sector}
                        onChangeText={(v) => onChange({ ...perfil, sector: v })}
                        placeholder={t("perfil.sectorPlaceholder")}
                        placeholderTextColor={COLORES.textMuted}
                        maxLength={200}
                    />
                </View>

                <View style={{ gap: ESPACIADO.sm }}>
                    <Text style={s.label}>{t("perfil.audiencia")}</Text>
                    <TextInput
                        style={s.input}
                        value={perfil.audiencia}
                        onChangeText={(v) => onChange({ ...perfil, audiencia: v })}
                        placeholder={t("perfil.audienciaPlaceholder")}
                        placeholderTextColor={COLORES.textMuted}
                        maxLength={200}
                    />
                </View>

                <View style={{ gap: ESPACIADO.sm }}>
                    <Text style={s.label}>{t("perfil.estiloLabel")}</Text>
                    <View style={{ flexDirection: "row", gap: ESPACIADO.sm, flexWrap: "wrap" }}>
                        {ESTILOS.map((e) => {
                            const activo = perfil.estilo === e;
                            return (
                                <TouchableOpacity
                                    key={e}
                                    onPress={() => onChange({ ...perfil, estilo: activo ? "" : e })}
                                    style={[
                                        s.chipEstilo,
                                        activo && { backgroundColor: COLORES.accentCool, borderColor: COLORES.accentCool },
                                    ]}
                                >
                                    <Text style={[s.chipEstiloTexto, activo && { color: "#fff" }]}>
                                        {t(`perfil.estilo_${e}`)}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>
        </View>
    );
}

function PasoDos() {
    const { t } = useTranslation();
    const opciones = [
        { icon: "🎙️", texto: "Graba tu idea en voz" },
        { icon: "⌨️", texto: "Escríbela directamente" },
        { icon: "📋", texto: "Pega notas que tengas" },
    ];
    return (
        <View style={{ gap: ESPACIADO.xl }}>
            <View>
                <Text style={s.tituloPaso}>{t("wizard.paso2Titulo")}</Text>
                <Text style={s.descPaso}>{t("wizard.paso2Desc")}</Text>
            </View>
            <View style={s.tarjeta}>
                {opciones.map(({ icon, texto }) => (
                    <View key={texto} style={{ flexDirection: "row", alignItems: "center", gap: ESPACIADO.md }}>
                        <Text style={{ fontSize: 20 }}>{icon}</Text>
                        <Text style={{ fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.cuerpo, color: COLORES.text }}>
                            {texto}
                        </Text>
                    </View>
                ))}
            </View>
            <Text style={s.descPaso}>{t("wizard.paso2Sub")}</Text>
        </View>
    );
}

function PasoTres() {
    const { t } = useTranslation();
    return (
        <View style={{ gap: ESPACIADO.xl }}>
            <View>
                <Text style={s.tituloPaso}>{t("wizard.paso3Titulo")}</Text>
                <Text style={s.descPaso}>{t("wizard.paso3Desc")}</Text>
            </View>
            <View style={[s.tarjeta, {
                backgroundColor: "rgba(212,162,76,0.07)",
                borderColor: "rgba(212,162,76,0.2)",
            }]}>
                <Text style={{ fontFamily: FUENTES.mono, fontSize: TIPOGRAFIA.minimo, color: COLORES.accentWarm, textTransform: "uppercase", letterSpacing: 1, marginBottom: ESPACIADO.sm }}>
                    Ficha de Voz
                </Text>
                <Text style={{ fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted }}>
                    Wisp aprende cómo escribes, qué expresiones usas y qué nunca dirías — y lo aplica en cada post.
                </Text>
            </View>
        </View>
    );
}

export default function OnboardingScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [paso, setPaso] = useState(0);
    const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);
    const [guardando, setGuardando] = useState(false);

    const nums = ["wizard.paso1Num", "wizard.paso2Num", "wizard.paso3Num"] as const;
    const esFinal = paso === 2;

    async function terminar() {
        await AsyncStorage.setItem(ONBOARDING_KEY, "1").catch(() => {});
        router.replace("/");
    }

    async function avanzar() {
        if (paso === 0) {
            const tieneAlgo = perfil.sector.trim() || perfil.audiencia.trim() || perfil.estilo;
            if (tieneAlgo) {
                setGuardando(true);
                try { await guardarPerfil(JSON.stringify(perfil)); } catch {}
                finally { setGuardando(false); }
            }
        }
        if (!esFinal) {
            setPaso(paso + 1);
        } else {
            terminar();
        }
    }

    const pasos = [
        <PasoUno perfil={perfil} onChange={setPerfil} />,
        <PasoDos />,
        <PasoTres />,
    ];

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: COLORES.bg }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={[s.header, { paddingTop: (insets.top || ESPACIADO.xl) + ESPACIADO.lg }]}>
                <Text style={s.logo}>Wisp</Text>
                <PuntosProgreso paso={paso} />
                <Text style={s.numPaso}>{t(nums[paso])}</Text>
            </View>

            {/* Contenido */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingHorizontal: ESPACIADO.xl, paddingVertical: ESPACIADO.xl }}
                keyboardShouldPersistTaps="handled"
            >
                {pasos[paso]}
            </ScrollView>

            {/* Footer */}
            <View style={[s.footer, { paddingBottom: (insets.bottom || ESPACIADO.sm) + ESPACIADO.lg }]}>
                <TouchableOpacity
                    style={[s.botonPrincipal, guardando && { opacity: 0.6 }]}
                    onPress={avanzar}
                    disabled={guardando}
                    activeOpacity={0.85}
                >
                    <Text style={s.botonPrincipalTexto}>
                        {guardando ? t("wizard.guardando") : esFinal ? t("wizard.empezar") : t("wizard.siguiente")}
                    </Text>
                </TouchableOpacity>

                {!esFinal && (
                    <TouchableOpacity onPress={terminar} style={{ paddingVertical: ESPACIADO.sm }}>
                        <Text style={s.omitir}>{t("wizard.omitir")}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    header: {
        alignItems: "center",
        gap: ESPACIADO.md,
        paddingBottom: ESPACIADO.lg,
        paddingHorizontal: ESPACIADO.xl,
    },
    logo: {
        fontFamily: FUENTES.display,
        fontSize: 26,
        color: COLORES.accentWarm,
    },
    numPaso: {
        fontFamily: FUENTES.mono,
        fontSize: TIPOGRAFIA.minimo,
        color: COLORES.textMuted,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    tituloPaso: {
        fontFamily: FUENTES.display,
        fontSize: TIPOGRAFIA.subtitulo + 2,
        color: COLORES.text,
        marginBottom: ESPACIADO.sm,
    },
    descPaso: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.pequeno + 1,
        color: COLORES.textMuted,
        lineHeight: 20,
    },
    label: {
        fontFamily: FUENTES.cuerpoMedio,
        fontSize: TIPOGRAFIA.pequeno,
        color: COLORES.text,
    },
    input: {
        backgroundColor: COLORES.surface,
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.md - 2,
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.cuerpo,
        color: COLORES.text,
    },
    chipEstilo: {
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        paddingHorizontal: ESPACIADO.md,
        paddingVertical: ESPACIADO.sm - 2,
    },
    chipEstiloTexto: {
        fontFamily: FUENTES.cuerpoMedio,
        fontSize: TIPOGRAFIA.pequeno,
        color: COLORES.textMuted,
    },
    tarjeta: {
        backgroundColor: COLORES.surface,
        borderWidth: 1,
        borderColor: COLORES.border,
        borderRadius: RADIOS.sm,
        padding: ESPACIADO.lg,
        gap: ESPACIADO.md,
    },
    footer: {
        paddingHorizontal: ESPACIADO.xl,
        paddingTop: ESPACIADO.lg,
        gap: ESPACIADO.sm,
        borderTopWidth: 1,
        borderTopColor: COLORES.border,
    },
    botonPrincipal: {
        backgroundColor: COLORES.accentCool,
        borderRadius: RADIOS.sm,
        paddingVertical: ESPACIADO.md + 2,
        alignItems: "center",
    },
    botonPrincipalTexto: {
        fontFamily: FUENTES.cuerpoNegro,
        fontSize: TIPOGRAFIA.cuerpo,
        color: "#fff",
    },
    omitir: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.pequeno,
        color: COLORES.textMuted,
        textAlign: "center",
    },
});
