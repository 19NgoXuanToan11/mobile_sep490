import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    Dimensions,
    Platform,
    TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LogoutButtonProps {
    onLogout: () => void;
}

export const LogoutButton = React.memo<LogoutButtonProps>(({ onLogout }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

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

    const openModal = useCallback(() => {
        setModalVisible(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 280,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 280,
                useNativeDriver: true,
            }),
        ]).start();
    }, [slideAnim, backdropOpacity]);

    const closeModal = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 240,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 240,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setModalVisible(false);
        });
    }, [slideAnim, backdropOpacity]);

    const handleLogout = useCallback(() => {
        closeModal();
        // Delay logout to allow modal to close smoothly
        setTimeout(() => {
            onLogout();
        }, 150);
    }, [closeModal, onLogout]);

    return (
        <>
            {/* Logout Button */}
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={openModal}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.85}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color="#00A86B"
                        style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>Đăng xuất</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Confirmation Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="none"
                statusBarTranslucent
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    {/* Backdrop */}
                    <TouchableWithoutFeedback onPress={closeModal}>
                        <Animated.View
                            style={[
                                styles.backdrop,
                                {
                                    opacity: backdropOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 0.5],
                                    }),
                                },
                            ]}
                        />
                    </TouchableWithoutFeedback>

                    {/* Bottom Sheet */}
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Handle */}
                        <View style={styles.handle} />

                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Ionicons
                                name="log-out-outline"
                                size={32}
                                color="#EF4444"
                            />
                        </View>

                        {/* Title & Message */}
                        <Text style={styles.title}>Xác nhận đăng xuất</Text>
                        <Text style={styles.message}>
                            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
                        </Text>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.logoutButton]}
                                onPress={handleLogout}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.logoutButtonText}>
                                    Đăng xuất
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={closeModal}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.cancelButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
});

LogoutButton.displayName = "LogoutButton";

const styles = StyleSheet.create({
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: "#00A86B",
        backgroundColor: "#FFFFFF",
        marginHorizontal: 16,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 3,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    buttonIcon: {
        marginRight: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#00A86B",
        letterSpacing: 0.3,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
    },
    bottomSheet: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: Platform.OS === "ios" ? 40 : 24,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: "#E5E7EB",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111827",
        textAlign: "center",
        marginBottom: 8,
        letterSpacing: 0.3,
    },
    message: {
        fontSize: 15,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    actions: {
        gap: 12,
    },
    actionButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    logoutButton: {
        backgroundColor: "#EF4444",
    },
    logoutButtonText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#374151",
        letterSpacing: 0.2,
    },
});

