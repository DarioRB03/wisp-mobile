import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";

type Props = {
    grabando: boolean;
    transcribiendo: boolean;
    onGrabando: (valor: boolean) => void;
    onTranscripcionLista: (uri: string) => void;
    onError: (mensaje: string) => void;
    onEmpezar: () => void;
};

const NUM_BARRAS = 20;
const ALTURAS = Array.from({ length: NUM_BARRAS }, (_, i) => 8 + ((i * 7) % 24));

function BarraOnda({ altura, retraso }: { altura: number; retraso: number }) {
    const opacidad = useRef(new Animated.Value(0.4)).current;

    useEffect(() => {
        const animacion = Animated.loop(
            Animated.sequence([
                Animated.timing(opacidad, { toValue: 1, duration: 500, delay: retraso, useNativeDriver: true }),
                Animated.timing(opacidad, { toValue: 0.4, duration: 500, useNativeDriver: true }),
            ])
        );
        animacion.start();
        return () => animacion.stop();
    }, []);

    return (
        <Animated.View
            style={[styles.barra, { height: altura, opacity: opacidad }]}
        />
    );
}

export default function GrabadorAudio({ grabando, transcribiendo, onGrabando, onTranscripcionLista, onError, onEmpezar }: Props) {
    const { t } = useTranslation();
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const pulso = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        AudioModule.requestRecordingPermissionsAsync();
    }, []);

    useEffect(() => {
        if (!grabando) {
            pulso.setValue(0.3);
            return;
        }
        const animacion = Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, { toValue: 0, duration: 900, useNativeDriver: true }),
                Animated.timing(pulso, { toValue: 0.3, duration: 0, useNativeDriver: true }),
            ])
        );
        animacion.start();
        return () => animacion.stop();
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
            onGrabando(true);
        } catch (err: any) {
            onError(t("grabador.errorIniciar", { detalle: err?.message || String(err) }));
        }
    }

    async function parar() {
        onGrabando(false);
        try {
            await audioRecorder.stop();
            const uri = audioRecorder.uri;
            if (uri) onTranscripcionLista(uri);
        } catch (err) {
            onError(t("grabador.errorParar"));
        }
    }

    const etiquetaBoton = grabando ? t("grabador.pararCorto") : t("grabador.grabarCorto");

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
                <View style={[styles.boton, { backgroundColor: grabando ? COLORES.danger : COLORES.accentWarm }]}>
                    {transcribiendo ? (
                        <ActivityIndicator color={COLORES.bg} />
                    ) : (
                        <Text style={styles.texto}>{etiquetaBoton}</Text>
                    )}
                </View>
            </TouchableOpacity>

            {grabando && (
                <View style={styles.fila}>
                    {ALTURAS.map((altura, i) => (
                        <BarraOnda key={i} altura={altura} retraso={i * 50} />
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { alignItems: "center", marginTop: ESPACIADO.xl },
    wrapperBoton: { width: 90, height: 90, alignItems: "center", justifyContent: "center" },
    anillo: {
        position: "absolute",
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: COLORES.accentWarm,
    },
    boton: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
    texto: { color: COLORES.bg, fontWeight: "700", fontSize: TIPOGRAFIA.pequeno },
    fila: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 32, marginTop: ESPACIADO.md },
    barra: { width: 4, borderRadius: 2, backgroundColor: COLORES.accentWarm },
});