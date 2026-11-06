import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO } from "../constants/theme";

type Props = {
    grabando: boolean;
    transcribiendo: boolean;
    onGrabando: (valor: boolean) => void;
    onTranscripcionLista: (uri: string) => void;
    onError: (mensaje: string) => void;
    onEmpezar: () => void;
};

const NUM_BARRAS = 20;
const ALTURAS_BASE = Array.from({ length: NUM_BARRAS }, (_, i) => 8 + ((i * 7) % 24));

export default function GrabadorAudio({ grabando, transcribiendo, onGrabando, onTranscripcionLista, onError, onEmpezar }: Props) {
    const { t } = useTranslation();
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const pulso = useRef(new Animated.Value(0.3)).current;
    const alturas = useRef(ALTURAS_BASE.map((h) => new Animated.Value(h))).current;
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        AudioModule.requestRecordingPermissionsAsync();
    }, []);

    useEffect(() => {
        if (!grabando) {
            pulso.setValue(0.3);
            if (timerRef.current) clearInterval(timerRef.current);
            ALTURAS_BASE.forEach((h, i) => {
                Animated.timing(alturas[i], { toValue: h, duration: 300, useNativeDriver: false }).start();
            });
            return;
        }
        const animacion = Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, { toValue: 0, duration: 900, useNativeDriver: true }),
                Animated.timing(pulso, { toValue: 0.3, duration: 0, useNativeDriver: true }),
            ])
        );
        animacion.start();
        timerRef.current = setInterval(() => {
            alturas.forEach((anim) => {
                Animated.timing(anim, {
                    toValue: 4 + Math.random() * 28,
                    duration: 140,
                    useNativeDriver: false,
                }).start();
            });
        }, 150);
        return () => {
            animacion.stop();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [grabando]);

    async function iniciar() {
        onEmpezar();
        try {
            const permiso = await AudioModule.requestRecordingPermissionsAsync();
            if (!permiso.granted) {
                onError(t("grabador.errorPermiso"));
                return;
            }

            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onGrabando(true);
        } catch (err: any) {
            onError(t("grabador.errorIniciar", { detalle: err?.message || String(err) }));
        }
    }

    async function parar() {
        onGrabando(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        try {
            await audioRecorder.stop();
            const uri = audioRecorder.uri;
            if (uri) onTranscripcionLista(uri);
        } catch (err) {
            onError(t("grabador.errorParar"));
        }
    }

    const etiquetaBoton = grabando ? t("grabador.parar") : t("grabador.empezar");

    return (
        <View style={styles.contenedor}>
            <TouchableOpacity
                onPress={grabando ? parar : iniciar}
                disabled={transcribiendo}
                accessibilityLabel={grabando ? t("grabador.parar") : t("grabador.empezar")}
                style={styles.wrapperBoton}
            >
                {grabando && (
                    <Animated.View
                        style={[
                            styles.anillo,
                            {
                                opacity: pulso,
                                transform: [
                                    {
                                        scale: pulso.interpolate({
                                            inputRange: [0, 0.3],
                                            outputRange: [1.6, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    />
                )}
                <View style={[styles.boton, grabando ? styles.botonGrabando : styles.botonIdle]}>
                    {transcribiendo ? (
                        <ActivityIndicator color={grabando ? COLORES.bg : COLORES.accentWarm} />
                    ) : (
                        <View style={grabando ? styles.iconoCuadrado : styles.iconoCirculo} />
                    )}
                </View>
            </TouchableOpacity>

            {grabando && (
                <View style={styles.fila}>
                    {alturas.map((altura, i) => (
                        <Animated.View key={i} style={[styles.barra, { height: altura }]} />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { alignItems: "center", marginTop: ESPACIADO.xl },
    wrapperBoton: { width: 80, height: 80, alignItems: "center", justifyContent: "center" },
    anillo: {
        position: "absolute",
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORES.accentWarm,
    },
    boton: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center" },
    botonIdle: { backgroundColor: COLORES.surface, borderWidth: 1, borderColor: COLORES.border },
    botonGrabando: { backgroundColor: COLORES.accentWarm },
    iconoCirculo: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORES.accentWarm },
    iconoCuadrado: { width: 16, height: 16, borderRadius: 3, backgroundColor: COLORES.bg },
    fila: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 32, marginTop: ESPACIADO.md },
    barra: { width: 4, borderRadius: 2, backgroundColor: COLORES.accentWarm },
});