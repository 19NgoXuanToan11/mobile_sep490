import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Platform,
    Animated,
} from "react-native";

interface ProfileSummaryCardProps {
    fullName: string;
    email: string;
    role: string;
}

export const ProfileSummaryCard = React.memo<ProfileSummaryCardProps>(
    ({ fullName, email, role }) => {
        const fadeAnim = React.useRef(new Animated.Value(0)).current;
        const scaleAnim = React.useRef(new Animated.Value(0.95)).current;

        React.useEffect(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 120,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 80,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();
        }, [fadeAnim, scaleAnim]);

        const getInitials = (name: string): string => {
            const words = name.trim().split(/\s+/);
            if (words.length === 1) {
                return words[0].charAt(0).toUpperCase();
            }
            return (
                words[0].charAt(0).toUpperCase() +
                words[words.length - 1].charAt(0).toUpperCase()
            );
        };

        const getRoleColor = (roleText: string): string => {
            const lowerRole = roleText.toLowerCase();
            if (lowerRole.includes("admin")) return "#00A86B";
            if (lowerRole.includes("staff")) return "#F59E0B";
            return "#6B7280";
        };

        const getRoleBackground = (roleText: string): string => {
            const lowerRole = roleText.toLowerCase();
            if (lowerRole.includes("admin")) return "#E8F9F1";
            if (lowerRole.includes("staff")) return "#FEF3C7";
            return "#F3F4F6";
        };

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
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getInitials(fullName)}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {fullName}
                    </Text>
                    <Text style={styles.email} numberOfLines={1}>
                        {email}
                    </Text>
                    <View
                        style={[
                            styles.roleChip,
                            { backgroundColor: getRoleBackground(role) },
                        ]}
                    >
                        <Text
                            style={[
                                styles.roleText,
                                { color: getRoleColor(role) },
                            ]}
                        >
                            {role}
                        </Text>
                    </View>
                </View>
            </Animated.View>
        );
    }
);

ProfileSummaryCard.displayName = "ProfileSummaryCard";

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        marginHorizontal: 16,
        marginTop: 12,
        padding: 20,
        alignItems: "center",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    avatarContainer: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: "#E8F5F0",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderWidth: 3,
        borderColor: "#FFFFFF",
        ...Platform.select({
            ios: {
                shadowColor: "#00A86B",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    avatarText: {
        fontSize: 32,
        fontWeight: "700",
        color: "#00A86B",
        letterSpacing: 0.5,
    },
    infoContainer: {
        alignItems: "center",
        width: "100%",
    },
    name: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 4,
        letterSpacing: 0.2,
        textAlign: "center",
    },
    email: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 12,
        letterSpacing: 0.1,
        textAlign: "center",
    },
    roleChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 13,
        fontWeight: "600",
        letterSpacing: 0.3,
    },
});
