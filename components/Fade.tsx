import { useEffect, useRef } from "react";
import { Animated } from "react-native";

type Props = {
    children: React.ReactNode;
    style?: any;
};

export default function Fade({ children, style }: Props) {
    const opacidad = useRef(new Animated.Value(0)).current;
    const desplazamiento = useRef(new Animated.Value(6)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacidad, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(desplazamiento, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    return (
        <Animated.View style={[style, { opacity: opacidad, transform: [{ translateY: desplazamiento }] }]}>
            {children}
        </Animated.View>
    );
}