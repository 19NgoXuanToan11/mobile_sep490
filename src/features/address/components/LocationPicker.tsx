import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { removeDiacritics } from "../../../shared/utils/addressValidation";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;
interface LocationItem {
    code: string;
    name: string;
}
interface LocationPickerProps {
    visible: boolean;
    title: string;
    items: LocationItem[];
    selectedCode?: string;
    onSelect: (item: LocationItem) => void;
    onClose: () => void;
    searchPlaceholder?: string;
}
export const LocationPicker = React.memo<LocationPickerProps>(
    ({
        visible,
        title,
        items,
        selectedCode,
        onSelect,
        onClose,
        searchPlaceholder = "Tìm kiếm...",
    }) => {
        const [searchQuery, setSearchQuery] = useState("");
        const [slideAnim] = useState(new Animated.Value(BOTTOM_SHEET_HEIGHT));
        const [fadeAnim] = useState(new Animated.Value(0));

        useEffect(() => {
            if (visible) {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 160,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 120,
                        useNativeDriver: true,
                    }),
                ]).start();
            } else {
                Animated.parallel([
                    Animated.timing(slideAnim, {
                        toValue: BOTTOM_SHEET_HEIGHT,
                        duration: 140,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }, [visible]);

        const filteredItems = useMemo(() => {
            if (!searchQuery.trim()) return items;
            const normalizedQuery = removeDiacritics(searchQuery.toLowerCase());
            return items.filter((item) => {
                const normalizedName = removeDiacritics(item.name.toLowerCase());
                return normalizedName.includes(normalizedQuery);
            });
        }, [items, searchQuery]);
        const handleSelect = useCallback(
            (item: LocationItem) => {
                onSelect(item);
                setSearchQuery("");
                onClose();
            },
            [onSelect, onClose]
        );
        const handleClose = useCallback(() => {
            setSearchQuery("");
            onClose();
        }, [onClose]);
        const renderItem = useCallback(
            ({ item }: { item: LocationItem }) => {
                const isSelected = item.code === selectedCode;
                return (
                    <TouchableOpacity
                        style={[styles.item, isSelected && styles.itemSelected]}
                        onPress={() => handleSelect(item)}
                        activeOpacity={0.6}
                    >
                        <Text
                            style={[styles.itemText, isSelected && styles.itemTextSelected]}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        {isSelected && (
                            <Ionicons name="checkmark-circle" size={22} color="#00A86B" />
                        )}
                    </TouchableOpacity>
                );
            },
            [selectedCode, handleSelect]
        );
        const renderEmpty = useCallback(
            () => (
                <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                    <Text style={styles.emptySubtext}>
                        Thử tìm kiếm với từ khóa khác
                    </Text>
                </View>
            ),
            []
        );
        if (!visible) return null;
        return (
            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={handleClose}
                statusBarTranslucent
            >
                <View style={styles.overlay}>
                    <TouchableOpacity
                        style={styles.backdrop}
                        activeOpacity={1}
                        onPress={handleClose}
                    >
                        <Animated.View
                            style={[styles.backdropAnimated, { opacity: fadeAnim }]}
                        />
                    </TouchableOpacity>
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <KeyboardAvoidingView
                            behavior={Platform.OS === "ios" ? "padding" : undefined}
                            style={styles.container}
                        >
                            {}
                            <View style={styles.header}>
                                <View style={styles.handleBar} />
                                <View style={styles.headerContent}>
                                    <Text style={styles.headerTitle}>{title}</Text>
                                    <TouchableOpacity
                                        onPress={handleClose}
                                        style={styles.closeButton}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="close" size={24} color="#6B7280" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {}
                            <View style={styles.searchContainer}>
                                <Ionicons
                                    name="search-outline"
                                    size={20}
                                    color="#9CA3AF"
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder={searchPlaceholder}
                                    placeholderTextColor="#9CA3AF"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="search"
                                />
                                {searchQuery.length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => setSearchQuery("")}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                                    </TouchableOpacity>
                                )}
                            </View>
                            {}
                            {searchQuery.trim() && (
                                <View style={styles.countContainer}>
                                    <Text style={styles.countText}>
                                        {filteredItems.length} kết quả
                                    </Text>
                                </View>
                            )}
                            {}
                            <FlatList
                                data={filteredItems}
                                renderItem={renderItem}
                                keyExtractor={(item) => item.code}
                                ListEmptyComponent={renderEmpty}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            />
                        </KeyboardAvoidingView>
                    </Animated.View>
                </View>
            </Modal>
        );
    }
);
LocationPicker.displayName = "LocationPicker";
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropAnimated: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    bottomSheet: {
        height: BOTTOM_SHEET_HEIGHT,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
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
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 12,
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
        marginBottom: 12,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: "center",
        justifyContent: "center",
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 16,
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#111827",
        paddingVertical: 0,
    },
    countContainer: {
        paddingHorizontal: 20,
        paddingVertical: 8,
    },
    countText: {
        fontSize: 14,
        color: "#6B7280",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    item: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 8,
        backgroundColor: "#F9FAFB",
    },
    itemSelected: {
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#00A86B",
    },
    itemText: {
        fontSize: 16,
        color: "#374151",
        flex: 1,
    },
    itemTextSelected: {
        color: "#00A86B",
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6B7280",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9CA3AF",
        marginTop: 4,
    },
});
