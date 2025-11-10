import React, { useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Platform,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
interface ProfileCardProps {
    name?: string;
    email?: string;
    avatarUri?: string;
    onEditPress: () => void;
}
export const ProfileCard = React.memo<ProfileCardProps>(
    ({ name = "Người dùng", email = "", avatarUri, onEditPress }) => {
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const scaleAnim = useRef(new Animated.Value(0.95)).current;
        const avatarBounce = useRef(new Animated.Value(0)).current;
        const buttonScale = useRef(new Animated.Value(1)).current;
        useEffect(() => {

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            Animated.sequence([
                Animated.delay(80),
                Animated.spring(avatarBounce, {
                    toValue: 1,
                    friction: 6,
                    tension: 30,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [fadeAnim, scaleAnim, avatarBounce]);
        const handlePressIn = () => {
            Animated.spring(buttonScale, {
                toValue: 0.98,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };
        const handlePressOut = () => {
            Animated.spring(buttonScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }).start();
        };
        const getInitials = (name: string) => {
            const parts = name.trim().split(" ");
            if (parts.length >= 2) {
                return (
                    parts[0].charAt(0).toUpperCase() +
                    parts[parts.length - 1].charAt(0).toUpperCase()
                );
            }
            return name.charAt(0).toUpperCase();
        };
        const avatarScale = avatarBounce.interpolate({
            inputRange: [0, 1],
            outputRange: [0.9, 1],
        });
        return (
            <Animated.View
                style={[
                    styles.container,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                { }
                <Animated.View
                    style={[
                        styles.avatarContainer,
                        { transform: [{ scale: avatarScale }] },
                    ]}
                >
                    {avatarUri ? (
                        <Image
                            source={{ uri: avatarUri }}
                            style={styles.avatar}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{getInitials(name)}</Text>
                        </View>
                    )}
                </Animated.View>
                { }
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    {email ? (
                        <Text style={styles.email} numberOfLines={1}>
                            {email}
                        </Text>
                    ) : null}
                </View>
                { }
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={onEditPress}
                        onPressIn={handlePressIn}
                        onPressOut={handlePressOut}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="create-outline"
                            size={16}
                            color="#00A86B"
                            style={styles.editIcon}
                        />
                        <Text style={styles.editText}>Chỉnh sửa thông tin</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        );
    }
);
ProfileCard.displayName = "ProfileCard";
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        marginHorizontal: 16,
        marginTop: 8,
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "#E8F5F0",
        borderWidth: 3,
        borderColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "600",
        color: "#00A86B",
        letterSpacing: 0.5,
    },
    infoContainer: {
        alignItems: "center",
        marginBottom: 20,
        width: "100%",
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    email: {
        fontSize: 14,
        color: "#6B7280",
        letterSpacing: 0.1,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "#00A86B",
        backgroundColor: "rgba(0, 168, 107, 0.03)",
    },
    editIcon: {
        marginRight: 6,
    },
    editText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00A86B",
        letterSpacing: 0.2,
    },
});
