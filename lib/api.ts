import { API_URL } from "./config";
import { supabase } from "./supabase";

async function obtenerToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No hay sesión activa");
    return session.access_token;
}

export async function transcribirAudio(uri: string): Promise<string> {
    const token = await obtenerToken();
    const formData = new FormData();
    formData.append("audio", {
        uri,
        name: "grabacion.m4a",
        type: "audio/m4a",
    } as any);

    const response = await fetch(`${API_URL}/transcribir`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });

    if (!response.ok) throw new Error("No se pudo transcribir el audio");
    const data = await response.json();
    return data.texto;
}

export async function generarPost(texto: string, formato: string) {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/generar-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto, formato }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo generar el post");
    }
    const data = await response.json();
    return data.variantes;
}


export async function guardarPost(texto: string, post: string, formato: string) {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/guardar-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto, post, formato }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo guardar el post");
    }
}

export async function obtenerHistorial() {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/historial`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) throw new Error("No se pudo obtener el historial");
    return response.json();
}

export async function generarTonoPersonalizado(texto: string, formato: string, tono: string) {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/generar-tono-personalizado`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto, formato, tono }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo generar el post");
    }
    const data = await response.json();
    return data.post;
}

export async function generarComparativa(texto: string, formatos: string[]) {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/generar-comparativa`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ texto, formatos }),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || "No se pudo generar la comparativa");
    }
    const data = await response.json();
    return data.resultados;
}

export async function obtenerUso() {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/uso`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("No se pudo obtener el uso");
    return response.json();
}

export async function obtenerPerfil(): Promise<string> {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("No se pudo obtener el perfil");
    const data = await response.json();
    return data.contexto;
}

export async function guardarPerfil(contexto: string): Promise<void> {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/perfil`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contexto }),
    });

    if (!response.ok) throw new Error("No se pudo guardar el perfil");
}

export async function borrarNota(id: string): Promise<void> {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/historial/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("No se pudo borrar la nota");
}

export async function enviarFeedback(id: string, feedback: "positivo" | "negativo"): Promise<void> {
    const token = await obtenerToken();
    const response = await fetch(`${API_URL}/historial/${id}/feedback`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feedback }),
    });
    if (!response.ok) throw new Error("No se pudo enviar el feedback");
}
