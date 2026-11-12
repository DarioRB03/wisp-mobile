import { API_URL } from "./config";
import i18n from "./i18n";
import { supabase } from "./supabase";

async function obtenerToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión activa");
    return session.access_token;
}

async function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
    const token = await obtenerToken();
    return fetch(`${API_URL}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(opts.headers || {}),
        },
    });
}

export type Idea = { id: string; texto: string; creado_en: string };
export type VozInicial = { estilo: string; evitar: string; expresiones: string };
export type FichaVoz = {
    resumen: string;
    rasgos_escritura: string[];
    expresiones_propias: string[];
    correcciones_habituales: string[];
    evitar: string[];
    temas_recurrentes: string[];
    posturas: string[];
};
export type EstadoFicha = {
    ficha: FichaVoz | null;
    num_notas: number;
    minimo_notas: number;
    actualizada_en: string | null;
};
export type ExtraGuardado = { motivo?: string; tono?: string; esOriginal?: boolean };

export async function transcribirAudio(uri: string): Promise<string> {
    const token = await obtenerToken();
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("audio", { uri, name: "grabacion.m4a", type: "audio/m4a" } as any);
        formData.append("idioma", i18n.language);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_URL}/transcribir`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try { resolve(JSON.parse(xhr.responseText).texto); }
                catch { reject(new Error("Respuesta inválida del servidor")); }
            } else {
                try {
                    const data = JSON.parse(xhr.responseText);
                    reject(new Error(data.detail || `Error ${xhr.status}`));
                } catch { reject(new Error(`Error ${xhr.status}`)); }
            }
        };
        xhr.onerror = () => reject(new Error("Error de red al transcribir"));
        xhr.ontimeout = () => reject(new Error("Tiempo de espera agotado"));
        xhr.timeout = 60000;
        xhr.send(formData);
    });
}

export async function generarPost(texto: string, formato: string, nivelReescritura = "equilibrado") {
    const res = await apiFetch("/generar-post", {
        method: "POST",
        body: JSON.stringify({ texto, formato, idioma: i18n.language, nivel_reescritura: nivelReescritura }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.detail || "No se pudo generar el post"); }
    return (await res.json()).variantes;
}

export async function generarTonoPersonalizado(texto: string, formato: string, tono: string, nivelReescritura = "equilibrado") {
    const res = await apiFetch("/generar-tono-personalizado", {
        method: "POST",
        body: JSON.stringify({ texto, formato, tono, idioma: i18n.language, nivel_reescritura: nivelReescritura }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.detail || "No se pudo generar el post"); }
    return (await res.json()).post;
}

export async function generarComparativa(texto: string, formatos: string[], nivelReescritura = "equilibrado") {
    const res = await apiFetch("/generar-comparativa", {
        method: "POST",
        body: JSON.stringify({ texto, formatos, idioma: i18n.language, nivel_reescritura: nivelReescritura }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.detail || "No se pudo generar la comparativa"); }
    return (await res.json()).resultados;
}

export async function guardarPost(
    texto: string,
    post: string,
    formato: string,
    feedback?: "positivo" | "negativo",
    extra?: ExtraGuardado,
): Promise<string> {
    const res = await apiFetch("/guardar-post", {
        method: "POST",
        body: JSON.stringify({ texto, post, formato, idioma: i18n.language, feedback, ...extra }),
    });
    if (!res.ok) { const d = await res.json().catch(() => null); throw new Error(d?.detail || "No se pudo guardar el post"); }
    return (await res.json()).id;
}

export async function enviarFeedback(id: string, feedback: "positivo" | "negativo"): Promise<void> {
    const res = await apiFetch(`/historial/${id}/feedback`, {
        method: "PATCH",
        body: JSON.stringify({ feedback, idioma: i18n.language }),
    });
    if (!res.ok) throw new Error("No se pudo enviar el feedback");
}

export async function enviarMotivoFeedback(id: string, motivo: string): Promise<void> {
    const res = await apiFetch(`/historial/${id}/feedback`, {
        method: "PATCH",
        body: JSON.stringify({ feedback: "negativo", motivo, idioma: i18n.language }),
    });
    if (!res.ok) throw new Error("No se pudo enviar el motivo");
}

export async function obtenerHistorial() {
    const res = await apiFetch("/historial");
    if (!res.ok) throw new Error("No se pudo obtener el historial");
    return res.json();
}

export async function borrarNota(id: string): Promise<void> {
    const res = await apiFetch(`/historial/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo borrar la nota");
}

export async function obtenerUso() {
    const res = await apiFetch("/uso");
    if (!res.ok) throw new Error("No se pudo obtener el uso");
    return res.json();
}

export async function obtenerPerfil(): Promise<string> {
    const res = await apiFetch("/perfil");
    if (!res.ok) throw new Error("No se pudo obtener el perfil");
    return (await res.json()).contexto;
}

export async function guardarPerfil(contexto: string): Promise<void> {
    const res = await apiFetch("/perfil", {
        method: "PUT",
        body: JSON.stringify({ contexto }),
    });
    if (!res.ok) throw new Error("No se pudo guardar el perfil");
}

export async function obtenerFicha(): Promise<EstadoFicha> {
    const res = await apiFetch("/ficha-voz");
    if (!res.ok) throw new Error("No se pudo obtener la ficha");
    return res.json();
}

export async function regenerarFicha(): Promise<FichaVoz> {
    const res = await apiFetch("/ficha-voz/regenerar", { method: "POST" });
    if (!res.ok) throw new Error("No se pudo regenerar la ficha");
    return (await res.json()).ficha;
}

export async function listarIdeas(): Promise<Idea[]> {
    const res = await apiFetch("/ideas");
    if (!res.ok) throw new Error("No se pudo obtener las ideas");
    return res.json();
}

export async function crearIdea(texto: string): Promise<string> {
    const res = await apiFetch("/ideas", {
        method: "POST",
        body: JSON.stringify({ texto }),
    });
    if (!res.ok) throw new Error("No se pudo guardar la idea");
    return (await res.json()).id;
}

export async function borrarIdea(id: string): Promise<void> {
    const res = await apiFetch(`/ideas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("No se pudo borrar la idea");
}

export async function obtenerVozInicial(): Promise<VozInicial | null> {
    const res = await apiFetch("/perfil/voz-inicial");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.voz_inicial) return null;
    try { return JSON.parse(data.voz_inicial); } catch { return null; }
}

export async function guardarVozInicial(voz: VozInicial): Promise<void> {
    const res = await apiFetch("/perfil/voz-inicial", {
        method: "POST",
        body: JSON.stringify(voz),
    });
    if (!res.ok) throw new Error("No se pudo guardar la voz inicial");
}

export async function obtenerSugerencias(): Promise<{ temas: string[]; posturas: string[] }> {
    const res = await apiFetch("/perfil/sugerencias");
    if (!res.ok) return { temas: [], posturas: [] };
    return res.json();
}
