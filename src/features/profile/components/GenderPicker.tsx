import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Pressable,
    StyleSheet,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInDown,
    SlideOutDown,
} from "react-native-reanimated";

interface GenderPickerProps {
    visible: boolean;
    selectedValue: number;
    onSelect: (value: number) => void;
    onClose: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const GENDER_OPTIONS = [
    { value: 0, label: "Không xác định", icon: "help-circle-outline" },
    { value: 1, label: "Nam", icon: "male-outline" },
    { value: 2, label: "Nữ", icon: "female-outline" },
] as const;

export const GenderPicker = React.memo<GenderPickerProps>(
    ({ visible, selectedValue, onSelect, onClose }) => {
        return (
            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={onClose}
                statusBarTranslucent
            >
                <AnimatedPressable
                    style={styles.overlay}
                    onPress={onClose}
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                >
                    <Animated.View
                        entering={SlideInDown.duration(300).springify().damping(20)}
                        exiting={SlideOutDown.duration(250)}
                    >
                        <Pressable
                            style={styles.container}
                            onPress={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.handleBar} />
                                <View style={styles.headerContent}>
                                    <Text style={styles.title}>Chọn giới tính</Text>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Options */}
                            <View style={styles.optionsContainer}>
                                {GENDER_OPTIONS.map((option, index) => {
                                    const isSelected = selectedValue === option.value;
                                    const isLast = index === GENDER_OPTIONS.length - 1;

                                    return (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => onSelect(option.value)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.option,
                                                isSelected && styles.optionSelected,
                                                !isLast && styles.optionWithMargin,
                                            ]}
                                        >
                                            <View style={styles.optionContent}>
                                                <View
                                                    style={[
                                                        styles.iconContainer,
                                                        isSelected && styles.iconContainerSelected,
                                                    ]}
                                                >
                                                    <Ionicons
                                                        name={option.icon}
                                                        size={22}
                                                        color={isSelected ? "#00A86B" : "#6B7280"}
                                                    />
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.optionLabel,
                                                        isSelected && styles.optionLabelSelected,
                                                    ]}
                                                >
                                                    {option.label}
                                                </Text>
                                            </View>

                                            {isSelected && (
                                                <Ionicons
                                                    name="checkmark-circle"
                                                    size={24}
                                                    color="#00A86B"
                                                />
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Pressable>
                    </Animated.View>
                </AnimatedPressable>
            </Modal>
        );
    }
);

GenderPicker.displayName = "GenderPicker";

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    header: {
        paddingTop: 8,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: "#E5E7EB",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        letterSpacing: 0.3,
    },
    closeButton: {
        padding: 4,
    },
    optionsContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: "#E5E7EB",
        ...Platform.select({
            ios: {
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 2,
            },
            android: {
                elevation: 1,
            },
        }),
    },
    optionWithMargin: {
        marginBottom: 10,
    },
    optionSelected: {
        backgroundColor: "#E8F9F1",
        borderColor: "#00A86B",
        borderWidth: 2,
    },
    optionContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "#F3F4F6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    iconContainerSelected: {
        backgroundColor: "#C7F4DF",
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#374151",
        letterSpacing: 0.2,
    },
    optionLabelSelected: {
        color: "#00A86B",
        fontWeight: "600",
    },
});

