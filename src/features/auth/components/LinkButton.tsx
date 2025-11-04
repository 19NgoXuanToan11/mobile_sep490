import React, { useState, useCallback } from "react";
import { TouchableOpacity, Text } from "react-native";

interface LinkButtonProps {
    title: string;
    onPress: () => void;
}

export const LinkButton = React.memo<LinkButtonProps>(({ title, onPress }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePressIn = useCallback(() => {
        setIsPressed(true);
    }, []);

    const handlePressOut = useCallback(() => {
        setIsPressed(false);
    }, []);

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
            <Text
                style={{
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#00A86B",
                    opacity: isPressed ? 0.6 : 1,
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
});

LinkButton.displayName = "LinkButton";

