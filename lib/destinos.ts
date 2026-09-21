import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

type TipoDestino = "abrir" | "mailto" | "ninguno";

type Destino = {
    tipo: TipoDestino;
    url?: string;
    etiqueta: string;
};

export const DESTINOS: Record<string, Destino> = {
    linkedin: { tipo: "abrir", url: "https://www.linkedin.com/feed/?shareActive=true", etiqueta: "Copiar y abrir LinkedIn" },
    hilo: { tipo: "abrir", url: "https://twitter.com/compose/tweet", etiqueta: "Copiar y abrir X" },
    tiktok: { tipo: "abrir", url: "https://www.tiktok.com/upload", etiqueta: "Copiar y abrir TikTok" },
    youtube: { tipo: "abrir", url: "https://studio.youtube.com/", etiqueta: "Copiar y abrir YouTube" },
    instagram: { tipo: "abrir", url: "https://www.instagram.com/", etiqueta: "Copiar y abrir Instagram" },
    email: { tipo: "mailto", etiqueta: "Copiar y abrir correo" },
};

function extraerAsuntoYCuerpo(texto: string): { asunto: string; cuerpo: string } {
    const match = texto.match(/^Asunto:\s*(.+)\n+([\s\S]*)/i);
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