import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { COLORES, ESPACIADO, RADIOS, TIPOGRAFIA } from "../constants/theme";

type Props = {
    etiqueta: string;
    activo: boolean;
    onPress: () => void;
};

export default function SelectorPill({ etiqueta, activo, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.pestana,
                { backgroundColor: activo ? COLORES.accentCool : "transparent", borderColor: activo ? COLORES.accentCool : COLORES.border },
            ]}
        >
            <Text style={{ color: activo ? "white" : COLORES.textMuted, fontSize: TIPOGRAFIA.pequeno }}>{etiqueta}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    pestana: { paddingHorizontal: ESPACIADO.md, paddingVertical: ESPACIADO.xs + 2, borderRadius: RADIOS.full, borderWidth: 1 },
});