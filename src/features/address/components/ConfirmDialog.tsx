import React, { useEffect, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Platform,
    Pressable,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";
interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText?: string;
    confirmColor?: "primary" | "danger";
    onConfirm: () => void;
    onCancel: () => void;
}
export const ConfirmDialog = React.memo<ConfirmDialogProps>(
    ({
        visible,
        title,
        message,
        confirmText,
        cancelText = "Hủy",
        confirmColor = "primary",
        onConfirm,
        onCancel,
    }) => {
        const backdropOpacity = useSharedValue(0);
        const translateY = useSharedValue(300);
        const backdropStyle = useAnimatedStyle(() => ({
            opacity: backdropOpacity.value,
        }));
        const sheetStyle = useAnimatedStyle(() => ({
            transform: [{ translateY: translateY.value }],
        }));
        useEffect(() => {
            if (visible) {
                backdropOpacity.value = withTiming(1, { duration: 200 });
                translateY.value = withSpring(0, {
                    damping: 20,
                    stiffness: 300,
                });
            } else {
                backdropOpacity.value = withTiming(0, { duration: 200 });
                translateY.value = withTiming(300, { duration: 200 });
            }
        }, [visible]);
        const handleConfirm = useCallback(() => {
            onConfirm();
        }, [onConfirm]);
        const handleCancel = useCallback(() => {
            onCancel();
        }, [onCancel]);
        if (!visible) return null;
        return (
            <Modal
                visible={visible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={onCancel}
            >
                <View style={styles.overlay}>
                    <Animated.View style={[styles.backdrop, backdropStyle]}>
                        <Pressable style={styles.backdropPressable} onPress={onCancel} />
                    </Animated.View>
                    <Animated.View style={[styles.sheet, sheetStyle]}>
                        {}
                        <View style={styles.handleBar} />
                        {}
                        <View style={styles.content}>
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>
                            {}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    onPress={handleCancel}
                                    style={[styles.button, styles.cancelButton]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleConfirm}
                                    style={[
                                        styles.button,
                                        confirmColor === "danger"
                                            ? styles.dangerButton
                                            : styles.confirmButton,
                                    ]}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.confirmButtonText}>{confirmText}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        );
    }
);
ConfirmDialog.displayName = "ConfirmDialog";
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    backdropPressable: {
        flex: 1,
    },
    sheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: "#D1D5DB",
        borderRadius: 2,
        alignSelf: "center",
        marginTop: 12,
        marginBottom: 20,
    },
    content: {
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 8,
        textAlign: "center",
    },
    message: {
        fontSize: 15,
        color: "#6B7280",
        lineHeight: 22,
        marginBottom: 24,
        textAlign: "center",
    },
    actions: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
    },
    confirmButton: {
        backgroundColor: "#00A86B",
    },
    dangerButton: {
        backgroundColor: "#EF4444",
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
});
