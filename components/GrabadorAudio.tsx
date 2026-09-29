import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORES, ESPACIADO, TIPOGRAFIA } from "../constants/theme";

type Props = {
    grabando: boolean;
    transcribiendo: boolean;
    onGrabando: (valor: boolean) => void;
    onTranscripcionLista: (uri: string) => void;
    onError: (mensaje: string) => void;
    onEmpezar: () => void;
};

export default function GrabadorAudio({ grabando, transcribiendo, onGrabando, onTranscripcionLista, onError, onEmpezar }: Props) {
    const { t } = useTranslation();
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    useEffect(() => {
        AudioModule.requestRecordingPermissionsAsync();
    }, []);

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
        <TouchableOpacity
            onPress={grabando ? parar : iniciar}
            disabled={transcribiendo}
            accessibilityLabel={grabando ? t("grabador.parar") : t("grabador.empezar")}
            style={[styles.boton, { backgroundColor: grabando ? COLORES.danger : COLORES.accentWarm }]}
        >
            {transcribiendo ? (
                <ActivityIndicator color={COLORES.bg} />
            ) : (
                <Text style={styles.texto}>{etiquetaBoton}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    boton: { width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center", marginTop: ESPACIADO.xl },
    texto: { color: COLORES.bg, fontWeight: "700", fontSize: TIPOGRAFIA.pequeno },
});