import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { COLORES, ESPACIADO, RADIOS } from "../constants/theme";

function SkeletonCard({ pulso }: { pulso: Animated.Value }) {
    return (
        <Animated.View style={[styles.tarjeta, { opacity: pulso }]}>
            <View style={styles.filaHeader}>
                <View style={[styles.rect, { width: 16, height: 13, borderRadius: 4 }]} />
                <View style={[styles.rect, { width: 72, height: 10 }]} />
            </View>
            <View style={[styles.rect, { width: "100%", height: 10, marginTop: ESPACIADO.sm }]} />
            <View style={[styles.rect, { width: "88%", height: 10, marginTop: ESPACIADO.xs + 2 }]} />
            <View style={[styles.rect, { width: "68%", height: 10, marginTop: ESPACIADO.xs + 2 }]} />
        </Animated.View>
    );
}

export default function SkeletonHistorial({ cantidad = 5 }: { cantidad?: number }) {
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
        <View style={styles.contenedor}>
            {Array.from({ length: cantidad }).map((_, i) => (
                <SkeletonCard key={i} pulso={pulso} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { padding: ESPACIADO.lg, gap: ESPACIADO.sm + 2 },
    tarjeta: { backgroundColor: COLORES.surface, borderRadius: RADIOS.sm, borderWidth: 1, borderColor: COLORES.border, padding: ESPACIADO.md },
    filaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: ESPACIADO.xs + 2 },
    rect: { backgroundColor: COLORES.border, borderRadius: 4 },
});
