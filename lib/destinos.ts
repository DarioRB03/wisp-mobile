import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import type { TFunction } from "i18next";

type TipoDestino = "abrir" | "mailto" | "ninguno";

type Destino = {
    tipo: TipoDestino;
    url?: string;
    nombre?: string;
};

export const DESTINOS: Record<string, Destino> = {
    linkedin: { tipo: "abrir", url: "https://www.linkedin.com/feed/?shareActive=true", nombre: "LinkedIn" },
    hilo: { tipo: "abrir", url: "https://twitter.com/compose/tweet", nombre: "X" },
    tiktok: { tipo: "abrir", url: "https://www.tiktok.com/upload", nombre: "TikTok" },
    youtube: { tipo: "abrir", url: "https://studio.youtube.com/", nombre: "YouTube" },
    instagram: { tipo: "abrir", url: "https://www.instagram.com/", nombre: "Instagram" },
    email: { tipo: "mailto" },
};

export function etiquetaDestino(formato: string, t: TFunction): string {
    const destino = DESTINOS[formato];
    if (!destino) return "";
    const nombre = destino.nombre ?? t("destinos.correo");
    return t("comun.copiarYAbrir", { destino: nombre });
}

function extraerAsuntoYCuerpo(texto: string): { asunto: string; cuerpo: string } {
    const match = texto.match(/^(?:Asunto|Subject):\s*(.+)\n+([\s\S]*)/i);
    if (match) return { asunto: match[1].trim(), cuerpo: match[2].trim() };
    return { asunto: "", cuerpo: texto };
}

export async function copiarYAbrir(formato: string, post: string) {
    const destino = DESTINOS[formato];
    if (!destino) return;

    await Clipboard.setStringAsync(post);

    if (destino.tipo === "mailto") {
        const { asunto, cuerpo } = extraerAsuntoYCuerpo(post);
        const url = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        await Linking.openURL(url);
        return;
    }

    if (destino.tipo === "abrir" && destino.url) {
        await Linking.openURL(destino.url);
    }
}