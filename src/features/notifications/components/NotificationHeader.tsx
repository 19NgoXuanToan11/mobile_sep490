import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const NotificationHeader = React.memo(() => {
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Thông báo</Text>
            </View>
        </View>
    );
});

NotificationHeader.displayName = "NotificationHeader";

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    content: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
    },
});

