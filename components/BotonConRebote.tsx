import { useRef } from "react";
import { Animated, GestureResponderEvent, TouchableOpacity, ViewStyle } from "react-native";

type Props = {
    onPress: (e: GestureResponderEvent) => void;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[];
    children: React.ReactNode;
};

export default function BotonConRebote({ onPress, disabled, style, children }: Props) {
    const escala = useRef(new Animated.Value(1)).current;

    function manejarPress(e: GestureResponderEvent) {
        Animated.sequence([
            Animated.timing(escala, { toValue: 0.94, duration: 80, useNativeDriver: true }),
            Animated.spring(escala, { toValue: 1, useNativeDriver: true, friction: 4 }),
        ]).start();
        onPress(e);
    }

    return (
        <TouchableOpacity onPress={manejarPress} disabled={disabled} activeOpacity={0.85}>
            <Animated.View style={[style, { transform: [{ scale: escala }] }]}>
                {children}
            </Animated.View>
        </TouchableOpacity>
    );
}