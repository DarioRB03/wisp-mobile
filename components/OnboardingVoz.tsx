import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import { obtenerVozInicial, guardarVozInicial, type VozInicial } from "../lib/api";

type Props = {
    numNotas: number;
    minimoNotas: number;
    tieneficha: boolean;
};

const VOZ_VACIA: VozInicial = { estilo: "", evitar: "", expresiones: "" };

export default function OnboardingVoz({ numNotas, minimoNotas, tieneficha }: Props) {
    const { t } = useTranslation();
    const [voz, setVoz] = useState<VozInicial>(VOZ_VACIA);
    const [guardado, setGuardado] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [cargado, setCargado] = useState(false);

    useEffect(() => {
        obtenerVozInicial()
            .then((v) => { if (v) setVoz(v); setCargado(true); })
            .catch(() => setCargado(true));
    }, []);

    if (!cargado || tieneficha) return null;

    function set(campo: keyof VozInicial, valor: string) {
        setVoz((prev) => ({ ...prev, [campo]: valor }));
    }

    async function guardar() {
        setGuardando(true);
        try {
            await guardarVozInicial(voz);
            setGuardado(true);
            setTimeout(() => setGuardado(false), 2000);
        } catch {
        } finally {
            setGuardando(false);
        }
    }

    const hayContenido = voz.estilo.trim() || voz.evitar.trim() || voz.expresiones.trim();

    return (
        <View style={s.contenedor}>
            <Text style={s.titulo}>{t("vozInicial.titulo")}</Text>
            <Text style={s.descripcion}>{t("vozInicial.descripcion", { minimo: minimoNotas, actual: numNotas })}</Text>

            <Text style={s.label}>{t("vozInicial.estiloLabel")}</Text>
            <TextInput
                style={s.input}
                value={voz.estilo}
                onChangeText={(v) => set("estilo", v)}
                placeholder={t("vozInicial.estiloPlaceholder")}
                placeholderTextColor={COLORES.textMuted}
                maxLength={300}
            />

            <Text style={s.label}>{t("vozInicial.evitarLabel")}</Text>
            <TextInput
                style={s.input}
                value={voz.evitar}
                onChangeText={(v) => set("evitar", v)}
                placeholder={t("vozInicial.evitarPlaceholder")}
                placeholderTextColor={COLORES.textMuted}
                maxLength={300}
            />

            <Text style={s.label}>{t("vozInicial.expresionesLabel")}</Text>
            <TextInput
                style={s.input}
                value={voz.expresiones}
                onChangeText={(v) => set("expresiones", v)}
                placeholder={t("vozInicial.expresionesPlaceholder")}
                placeholderTextColor={COLORES.textMuted}
                maxLength={200}
            />

            {hayContenido ? (
                <TouchableOpacity style={s.boton} onPress={guardar} disabled={guardando}>
                    {guardando
                        ? <ActivityIndicator color="white" size="small" />
                        : <Text style={s.botonTexto}>{guardado ? t("comun.guardado") : t("vozInicial.guardar")}</Text>
                    }
                </TouchableOpacity>
            ) : null}
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
        gap: ESPACIADO.xs,
    },
    titulo: {
        fontFamily: FUENTES.mono,
        fontSize: TIPOGRAFIA.minimo,
        color: COLORES.accentCool,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 2,
    },
    descripcion: {
        fontFamily: FUENTES.cuerpo,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.textMuted,
        marginBottom: ESPACIADO.sm,
    },
    label: {
        fontFamily: FUENTES.cuerpoMedio,
        fontSize: TIPOGRAFIA.minimo + 1,
        color: COLORES.text,
        marginTop: ESPACIADO.xs,
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
    boton: {
        backgroundColor: COLORES.accentCool,
        borderRadius: RADIOS.sm,
        paddingVertical: ESPACIADO.sm,
        alignItems: "center",
        marginTop: ESPACIADO.sm,
    },
    botonTexto: {
        color: "white",
        fontFamily: FUENTES.cuerpoNegro,
        fontSize: TIPOGRAFIA.pequeno,
    },
});
