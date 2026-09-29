import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";
import {
  generarComparativa,
  generarPost,
  generarTonoPersonalizado,
  guardarPost,
  obtenerUso,
  transcribirAudio,
} from "../lib/api";
import { supabase } from "../lib/supabase";

import SelectorIdioma from "@/components/SelectorIdioma";
import BannerBorrador from "../components/BannerBorrador";
import CampoTono from "../components/CampoTono";
import ContadorUso from "../components/ContadorUso";
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

  const [modo, setModo] = useState<Modo>("estandar");
  const [formato, setFormato] = useState("linkedin");
  const [formatosMultiples, setFormatosMultiples] = useState<string[]>(["linkedin", "tiktok"]);
  const [tonoPersonalizado, setTonoPersonalizado] = useState("");

  const [grabando, setGrabando] = useState(false);
  const [transcribiendo, setTranscribiendo] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [transcripcion, setTranscripcion] = useState("");
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
      // Silencioso
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

  async function manejarAudioListo(uri: string) {
    setTranscribiendo(true);
    try {
      const texto = await transcribirAudio(uri);
      if (!texto.trim()) {
        setError(t("grabador.sinVoz"));
      } else {
        setTranscripcion(texto);
        setBorradorDisponible(null);
      }
    } catch (err) {
      setError(t("grabador.errorTranscribir"));
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
    <ScrollView contentContainerStyle={styles.scrollContent} style={{ backgroundColor: COLORES.bg }}>
      <View style={styles.centrado}>
        <Text style={styles.titulo}>{t("app.nombre")}</Text>
        <Text style={styles.subtitulo}>{t("app.lema")}</Text>

        <View style={[styles.filaEnlaces, { alignItems: "center" }]}>
          <TouchableOpacity onPress={() => router.push("/historial")}>
            <Text style={styles.enlace}>{t("nav.historial")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/perfil")}>
            <Text style={styles.enlace}>{t("nav.perfil")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={cerrarSesion}>
            <Text style={styles.enlace}>{t("nav.cerrarSesion")}</Text>
          </TouchableOpacity>
          <SelectorIdioma />
        </View>

        <ContadorUso uso={uso} />

        <SelectorModo
          modo={modo}
          onCambiar={(m) => {
            setModo(m);
            limpiarResultados();
          }}
        />

        {modo !== "comparativa" && <SelectorFormato formato={formato} onCambiar={setFormato} />}
        {modo === "comparativa" && (
          <SelectorFormatosMultiple seleccionados={formatosMultiples} onCambiar={setFormatosMultiples} />
        )}
        {modo === "personalizado" && <CampoTono tono={tonoPersonalizado} onCambiar={setTonoPersonalizado} />}

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
          <>
            <TextInput
              style={[styles.input, { minHeight: 100, marginTop: ESPACIADO.xl - 4 }]}
              value={transcripcion}
              onChangeText={setTranscripcion}
              multiline
            />
            <TouchableOpacity style={styles.boton} onPress={generar} disabled={generando}>
              {generando ? <ActivityIndicator color="white" /> : <Text style={styles.botonTexto}>{t("generar.boton")}</Text>}
            </TouchableOpacity>
          </>
        ) : null}

        {modo === "estandar" && variantes.length > 0 && (
          <ResultadoEstandar variantes={variantes} formato={formato} onGuardar={(post) => guardar(post, formato)} />
        )}
        {modo === "personalizado" && postSimple && (
          <ResultadoSimple post={postSimple} formato={formato} onGuardar={(post) => guardar(post, formato)} />
        )}
        {modo === "comparativa" && comparativa.length > 0 && (
          <ResultadoComparativa resultados={comparativa} onGuardar={(post, f) => guardar(post, f)} />
        )}
      </View>
      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORES.bg, paddingHorizontal: ESPACIADO.xl },
  scrollContent: { flexGrow: 1, paddingHorizontal: ESPACIADO.xl, paddingTop: 80, paddingBottom: ESPACIADO.xxl + 8 },
  centrado: { justifyContent: "center", alignItems: "center" },
  titulo: { fontSize: TIPOGRAFIA.titulo, fontWeight: "600", color: COLORES.text },
  subtitulo: { fontSize: TIPOGRAFIA.pequeno, color: COLORES.textMuted, marginTop: ESPACIADO.xs },
  filaEnlaces: { flexDirection: "row", gap: ESPACIADO.lg, marginTop: ESPACIADO.sm },
  enlace: { color: COLORES.accentCool, fontSize: TIPOGRAFIA.pequeno },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORES.border,
    borderRadius: RADIOS.sm,
    padding: ESPACIADO.md,
    marginTop: ESPACIADO.sm,
    color: COLORES.text,
    fontSize: TIPOGRAFIA.cuerpo,
  },
  boton: { width: "100%", backgroundColor: COLORES.accentCool, borderRadius: RADIOS.sm, padding: ESPACIADO.md + 2, marginTop: ESPACIADO.lg, alignItems: "center" },
  botonTexto: { color: "white", fontWeight: "600", fontSize: TIPOGRAFIA.cuerpo },
  error: { color: "#F87171", fontSize: TIPOGRAFIA.pequeno, marginTop: ESPACIADO.sm },
});