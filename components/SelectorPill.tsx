import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORES, ESPACIADO, FUENTES, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    etiqueta: string;
    activo: boolean;
    onPress: () => void;
    colorActivo?: string;
    colorTextoActivo?: string;
};

export default function SelectorPill({ etiqueta, activo, onPress, colorActivo = COLORES.accentCool, colorTextoActivo = "white" }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.pestana,
                { backgroundColor: activo ? colorActivo : "transparent", borderColor: activo ? colorActivo : COLORES.border },
            ]}
        >
            <Text style={{ color: activo ? colorTextoActivo : COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno, fontFamily: FUENTES.cuerpoMedio }}>{etiqueta}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pestana: { paddingHorizontal: ESPACIADO.md, paddingVertical: ESPACIADO.xs + 2, borderRadius: RADIOS.full, borderWidth: 1 },
});