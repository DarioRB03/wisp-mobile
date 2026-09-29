import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import es from "../locales/es.json";

export const IDIOMAS_SOPORTADOS = ["es", "en"];
export const CLAVE_IDIOMA = "wisp-idioma";

let inicializado = false;

async function detectarIdioma(): Promise<string> {
    const guardado = await AsyncStorage.getItem(CLAVE_IDIOMA);
    if (guardado && IDIOMAS_SOPORTADOS.includes(guardado)) return guardado;

    const codigoDispositivo = getLocales()[0]?.languageCode ?? "es";
    return IDIOMAS_SOPORTADOS.includes(codigoDispositivo) ? codigoDispositivo : "es";
}

export async function inicializarI18n(): Promise<void> {
    if (inicializado) return;
    const idioma = await detectarIdioma();

    await i18n.use(initReactI18next).init({
        resources: {
            es: { translation: es },
            en: { translation: en },
        },
        lng: idioma,
        fallbackLng: "es",
        interpolation: { escapeValue: false },
    });

    inicializado = true;
}

export async function cambiarIdioma(codigo: string): Promise<void> {
    await i18n.changeLanguage(codigo);
    await AsyncStorage.setItem(CLAVE_IDIOMA, codigo);
}

export default i18n;