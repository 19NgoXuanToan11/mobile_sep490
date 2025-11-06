import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { appleDesign } from "../lib/theme";
interface RecommendationItem {
    id: string;
    title: string;
    subtitle?: string;
    image?: string;
    icon?: string;
    color?: string;
}
interface RecommendationSectionProps {
    title: string;
    emoji?: string;
    items: RecommendationItem[];
    onItemPress?: (item: RecommendationItem) => void;
    onSeeAll?: () => void;
}
export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
    title,
    emoji = "🌱",
    items,
    onItemPress,
    onSeeAll,
}) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);
    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <View className="mb-6">
                {}
                <View className="flex-row items-center justify-between mb-4 px-5">
                    <View className="flex-row items-center gap-2">
                        <Text style={{ fontSize: appleDesign.typography.title3.fontSize }}>
                            {emoji}
                        </Text>
                        <Text
                            className="font-semibold"
                            style={{
                                color: appleDesign.colors.text.primary,
                                fontSize: appleDesign.typography.headline.fontSize,
                            }}
                        >
                            {title}
                        </Text>
                    </View>
                    {onSeeAll && (
                        <TouchableOpacity
                            onPress={onSeeAll}
                            className="flex-row items-center gap-1"
                        >
                            <Text
                                className="font-medium"
                                style={{
                                    color: appleDesign.colors.green.primary,
                                    fontSize: appleDesign.typography.subheadline.fontSize,
                                }}
                            >
                                Xem tất cả
                            </Text>
                            <Ionicons
                                name="chevron-forward"
                                size={16}
                                color={appleDesign.colors.green.primary}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                {}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-5"
                    contentContainerStyle={{ paddingRight: 20 }}
                >
                    <View className="flex-row gap-4">
                        {items.map((item, index) => (
                            <RecommendationCard
                                key={item.id}
                                item={item}
                                index={index}
                                onPress={() => onItemPress?.(item)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </View>
        </Animated.View>
    );
};
interface RecommendationCardProps {
    item: RecommendationItem;
    index: number;
    onPress?: () => void;
}
const RecommendationCard: React.FC<RecommendationCardProps> = ({
    item,
    index,
    onPress,
}) => {
    const scaleAnim = React.useRef(new Animated.Value(1)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        Animated.spring(fadeAnim, {
            toValue: 1,
            delay: index * 100,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
    }, [index]);
    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };
    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [
                    { scale: scaleAnim },
                    {
                        translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        }),
                    },
                ],
            }}
        >
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                <View
                    className="w-36 bg-white overflow-hidden"
                    style={{
                        borderRadius: appleDesign.radius.lg,
                        ...appleDesign.shadows.soft,
                    }}
                >
                    {}
                    <View className="relative w-full h-24 bg-neutral-100">
                        {item.image ? (
                            <Image
                                source={{ uri: item.image }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="cover"
                            />
                        ) : (
                            <LinearGradient
                                colors={[
                                    item.color || "rgba(0,168,107,0.15)",
                                    item.color ? `${item.color}40` : "rgba(0,168,107,0.05)",
                                ]}
                                className="flex-1 items-center justify-center"
                            >
                                <Ionicons
                                    name={(item.icon as any) || "leaf-outline"}
                                    size={40}
                                    color={appleDesign.colors.green.primary}
                                />
                            </LinearGradient>
                        )}
                    </View>
                    {}
                    <View className="p-3">
                        <Text
                            className="font-semibold mb-1"
                            style={{
                                color: appleDesign.colors.text.primary,
                                fontSize: appleDesign.typography.footnote.fontSize,
                                lineHeight: appleDesign.typography.footnote.lineHeight,
                            }}
                            numberOfLines={2}
                        >
                            {item.title}
                        </Text>
                        {item.subtitle && (
                            <Text
                                style={{
                                    color: appleDesign.colors.text.secondary,
                                    fontSize: appleDesign.typography.caption1.fontSize,
                                    lineHeight: appleDesign.typography.caption1.lineHeight,
                                }}
                                numberOfLines={1}
                            >
                                {item.subtitle}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
