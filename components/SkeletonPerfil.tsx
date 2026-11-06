import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS } from "../constants/theme";

export default function SkeletonPerfil() {
    const pulso = useRef(new Animated.Value(0.35)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulso, { toValue: 0.8, duration: 750, useNativeDriver: true }),
                Animated.timing(pulso, { toValue: 0.35, duration: 750, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[styles.contenedor, { opacity: pulso }]}>
            <View style={styles.descripcion} />
            <View style={styles.textarea} />
            <View style={styles.boton} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    contenedor: { paddingHorizontal: ESPACIADO.lg, gap: ESPACIADO.md },
    descripcion: { height: 36, backgroundColor: COLORES.border, borderRadius: RADIOS.sm },
    textarea: { height: 120, backgroundColor: COLORES.border, borderRadius: RADIOS.sm },
    boton: { height: 44, backgroundColor: COLORES.border, borderRadius: RADIOS.sm },
});
