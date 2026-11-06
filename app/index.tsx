import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";
import {
  generarComparativa,
  generarPost,
  generarTonoPersonalizado,
  guardarPost,
  obtenerUso,
  transcribirAudio,
} from "../lib/api";
import { supabase } from "../lib/supabase";

import TabBar from "../components/TabBar";
import BannerBorrador from "../components/BannerBorrador";
import CampoTono from "../components/CampoTono";
import ContadorUso from "../components/ContadorUso";
import Fade from "../components/Fade";
import GrabadorAudio from "../components/GrabadorAudio";
import PantallaAuth from "../components/PantallaAuth";
import ResultadoComparativa from "../components/ResultadoComparativa";
import ResultadoEstandar from "../components/ResultadoEstandar";
import ResultadoSimple from "../components/ResultadoSimple";
import SelectorFormato from "../components/SelectorFormato";
import SelectorFormatosMultiple from "../components/SelectorFormatosMultiple";
import SelectorModo from "../components/SelectorModo";

type Modo = "estandar" | "personalizado" | "comparativa";

const CLAVE_BORRADOR = "wisp-borrador";

export default function Index() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargandoSesion(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (cargandoSesion) {
    return (
      <View style={[styles.container, styles.centrado]}>
        <ActivityIndicator color={COLORES.accentCool} />
      </View>
    );
  }

  if (!session) return <PantallaAuth />;

  return <PantallaPrincipal />;
}

function PantallaPrincipal() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [modo, setModo] = useState<Modo>("estandar");
  const [formato, setFormato] = useState("linkedin");
  const [formatosMultiples, setFormatosMultiples] = useState<string[]>(["linkedin", "tiktok"]);
  const [tonoPersonalizado, setTonoPersonalizado] = useState("");

  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
  const [transcripcionEditada, setTranscripcionEditada] = useState(false);
  const [borradorDisponible, setBorradorDisponible] = useState<string | null>(null);

  const [variantes, setVariantes] = useState<{ tono: string; post: string }[]>([]);
  const [postSimple, setPostSimple] = useState("");
  const [comparativa, setComparativa] = useState<{ formato: string; post: string }[]>([]);

  const [uso, setUso] = useState<{ usadas: number; limite: number; restantes: number; racha: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarUso();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(CLAVE_BORRADOR).then((guardado) => {
      if (guardado && guardado.trim()) setBorradorDisponible(guardado);
    });
  }, []);

  useEffect(() => {
    if (transcripcion.trim()) {
      AsyncStorage.setItem(CLAVE_BORRADOR, transcripcion);
    } else {
      AsyncStorage.removeItem(CLAVE_BORRADOR);
    }
  }, [transcripcion]);

  async function cargarUso() {
    try {
      setUso(await obtenerUso());
    } catch (err) {
      // No mostrar datos erróneos; ContadorUso oculta el componente cuando uso=null
    }
  }

  function limpiarResultados() {
    setVariantes([]);
    setPostSimple("");
    setComparativa([]);
    setError("");
  }

  function recuperarBorrador() {
    if (borradorDisponible) {
      setTranscripcion(borradorDisponible);
      setBorradorDisponible(null);
    }
  }

  function descartarBorrador() {
    AsyncStorage.removeItem(CLAVE_BORRADOR);
    setBorradorDisponible(null);
  }

  async function aplicarTranscripcion(texto: string) {
    setTranscripcion(texto);
    setTranscripcionEditada(false);
    setBorradorDisponible(null);
    limpiarResultados();
  }

  async function manejarAudioListo(uri: string) {
    setTranscribiendo(true);
    try {
      const texto = await transcribirAudio(uri);
      if (!texto.trim()) {
        setError(t("grabador.sinVoz"));
        return;
      }
      if (transcripcionEditada && transcripcion.trim()) {
        Alert.alert(
          t("grabador.reemplazarTitulo"),
          t("grabador.reemplazarMensaje"),
          [
            { text: t("comun.cancelar"), style: "cancel" },
            { text: t("grabador.reemplazar"), style: "destructive", onPress: () => aplicarTranscripcion(texto) },
          ]
        );
      } else {
        await aplicarTranscripcion(texto);
      }
    } catch (err: any) {
      setError(err?.message || t("grabador.errorTranscribir"));
    } finally {
      setTranscribiendo(false);
    }
  }

  async function generar() {
    setGenerando(true);
    setError("");
    limpiarResultados();

    try {
      if (modo === "estandar") {
        setVariantes(await generarPost(transcripcion, formato));
      } else if (modo === "personalizado") {
        if (!tonoPersonalizado.trim()) {
          setError(t("generar.errorTono"));
          return;
        }
        setPostSimple(await generarTonoPersonalizado(transcripcion, formato, tonoPersonalizado));
      } else if (modo === "comparativa") {
        if (formatosMultiples.length < 2) {
          setError(t("generar.errorFormatos"));
          return;
        }
        setComparativa(await generarComparativa(transcripcion, formatosMultiples));
      }
      cargarUso();
    } catch (err: any) {
      setError(err.message || t("generar.errorGenerico"));
    } finally {
      setGenerando(false);
    }
  }

  async function guardar(post: string, formatoUsado: string = formato) {
    try {
      await guardarPost(transcripcion, post, formatoUsado);
    } catch (err: any) {
      setError(err.message || t("generar.errorGuardar"));
      throw err;
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORES.bg }}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: (insets.bottom || ESPACIADO.sm) + 56 + ESPACIADO.xl }]}>
      <View style={styles.centrado}>
        <Text style={[styles.titulo, { color: COLORES.accentWarm, fontFamily: "Fraunces-SemiBold" }]}>{t("app.nombre")}</Text>
        <Text style={[styles.subtitulo, { fontFamily: FUENTES.cuerpo }]}>{t("app.lema")}</Text>

        <ContadorUso uso={uso} />

        <SelectorModo
          modo={modo}
          onCambiar={(m) => {
            setModo(m);
            limpiarResultados();
          }}
        />

        <Fade key={modo} style={{ width: "100%", alignItems: "center" }}>
          {modo !== "comparativa" && <SelectorFormato formato={formato} onCambiar={setFormato} />}
          {modo === "comparativa" && (
            <SelectorFormatosMultiple seleccionados={formatosMultiples} onCambiar={setFormatosMultiples} />
          )}
          {modo === "personalizado" && <CampoTono tono={tonoPersonalizado} onCambiar={setTonoPersonalizado} />}
        </Fade>

        {borradorDisponible && (
          <View style={{ width: "100%", marginTop: ESPACIADO.lg }}>
            <BannerBorrador onRecuperar={recuperarBorrador} onDescartar={descartarBorrador} />
          </View>
        )}

        <GrabadorAudio
          grabando={grabando}
          transcribiendo={transcribiendo}
          onGrabando={setGrabando}
          onTranscripcionLista={manejarAudioListo}
          onError={setError}
          onEmpezar={() => {
            setError("");
            setTranscripcion("");
            limpiarResultados();
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {transcripcion && !transcribiendo && !grabando ? (
          <Fade style={{ width: "100%" }}>
            <TextInput
              style={[styles.input, { minHeight: 100, marginTop: ESPACIADO.xl - 4 }]}
              value={transcripcion}
              onChangeText={(v) => { setTranscripcion(v); setTranscripcionEditada(true); }}
              multiline
            />
            <TouchableOpacity style={styles.boton} onPress={generar} disabled={generando}>
              {generando ? <ActivityIndicator color="white" /> : <Text style={styles.botonTexto}>{t("generar.boton")}</Text>}
            </TouchableOpacity>
          </Fade>
        ) : null}

        {modo === "estandar" && variantes.length > 0 && (
          <Fade style={{ width: "100%" }}>
            <ResultadoEstandar variantes={variantes} formato={formato} onGuardar={(post) => guardar(post, formato)} />
          </Fade>
        )}
        {modo === "personalizado" && postSimple && (
          <Fade style={{ width: "100%" }}>
            <ResultadoSimple post={postSimple} formato={formato} onGuardar={(post) => guardar(post, formato)} />
          </Fade>
        )}
        {modo === "comparativa" && comparativa.length > 0 && (
          <Fade style={{ width: "100%" }}>
            <ResultadoComparativa resultados={comparativa} onGuardar={(post, f) => guardar(post, f)} />
          </Fade>
        )}
      </View>
      <StatusBar style="light" />
    </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.bg, paddingHorizontal: ESPACIADO.xl },
  scrollContent: { flexGrow: 1, paddingHorizontal: ESPACIADO.xl, paddingTop: 80 },
  centrado: { justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: TIPOGRAFIA.titulo, fontFamily: FUENTES.display, color: COLORES.accentWarm },
  subtitulo: { fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted, marginTop: ESPACIADO.xs },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORES.border,
    borderRadius: RADIOS.sm,
    padding: ESPACIADO.md,
    marginTop: ESPACIADO.sm,
    color: COLORES.text,
    fontSize: TIPOGRAFIA.cuerpo,
    fontFamily: FUENTES.cuerpo,
  },
  boton: { width: "100%", backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.lg, alignItems: "center" },
  botonTexto: { color: "white", fontFamily: FUENTES.cuerpoNegro, fontSize: TIPOGRAFIA.cuerpo },
  error: { color: "#F87171", fontFamily: FUENTES.cuerpo, fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
});