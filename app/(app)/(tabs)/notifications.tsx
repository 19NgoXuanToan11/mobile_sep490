import React, { useCallback, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    StatusBar,
    RefreshControl,
    StyleSheet,
    ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../../../src/shared/ui";
import { useNotifications, Notification } from "../../../src/shared/hooks";
import {
    NotificationCard,
    NotificationSkeleton,
    NotificationHeader,
} from "../../../src/features/notifications/components";

interface GroupedNotification {
    type: "header" | "item";
    id: string;
    title?: string;
    notification?: Notification;
}

const getTimeGroup = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24 && date.getDate() === now.getDate()) {
        return "Hôm nay";
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.getDate() === yesterday.getDate() && diffInHours < 48) {
        return "Hôm qua";
    }

    if (diffInHours < 7 * 24) {
        return "Tuần này";
    }

    return "Trước đó";
};

const groupNotificationsByTime = (
    notifications: Notification[]
): GroupedNotification[] => {
    const groups: { [key: string]: Notification[] } = {};

    notifications.forEach((notification) => {
        const group = getTimeGroup(notification.timestamp);
        if (!groups[group]) {
            groups[group] = [];
        }
        groups[group].push(notification);
    });

    const result: GroupedNotification[] = [];
    const groupOrder = ["Hôm nay", "Hôm qua", "Tuần này", "Trước đó"];

    groupOrder.forEach((groupTitle) => {
        if (groups[groupTitle] && groups[groupTitle].length > 0) {
            result.push({
                type: "header",
                id: `header-${groupTitle}`,
                title: groupTitle,
            });

            groups[groupTitle].forEach((notification) => {
                result.push({
                    type: "item",
                    id: notification.id,
                    notification,
                });
            });
        }
    });

    return result;
};

export default function NotificationsScreen() {
    const [refreshing, setRefreshing] = React.useState(false);

    const { notifications, isLoading, markAsRead, loadNotifications } =
        useNotifications();

    const groupedData = useMemo(() => {
        return groupNotificationsByTime(notifications);
    }, [notifications]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    }, [loadNotifications]);

    const handleNotificationPress = useCallback(
        (notification: Notification) => {
            if (!notification.isRead) {
                markAsRead(notification.id);
            }

            if (notification.actionUrl) {   
            }
        },
        [markAsRead]
    );

    const keyExtractor = useCallback(
        (item: GroupedNotification) => item.id,
        []
    );

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<GroupedNotification>) => {
            if (item.type === "header") {
                return (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionHeaderText}>{item.title}</Text>
                    </View>
                );
            }

            if (item.notification) {
                return (
                    <NotificationCard
                        notification={item.notification}
                        onPress={handleNotificationPress}
                    />
                );
            }

            return null;
        },
        [handleNotificationPress]
    );

    const getItemLayout = useCallback(
        (_: any, index: number) => ({
            length: 120,
            offset: 120 * index,
            index,
        }),
        []
    );

    const ListEmptyComponent = useMemo(() => {
        if (isLoading) {
            return <NotificationSkeleton count={3} />;
        }

        return (
            <EmptyState
                icon="notifications-outline"
                title={"Không có thông báo"}
                description={"Chưa có thông báo nào được gửi đến bạn"}
            />
        );
    }, [isLoading]);

    return (
        <View style={styles.container}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor="transparent"
                translucent
            />

            <SafeAreaView edges={["top"]} style={styles.safeArea}>
                <NotificationHeader />
            </SafeAreaView>

            <FlatList
                data={groupedData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListEmptyComponent={ListEmptyComponent}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#00A86B"
                        colors={["#00A86B"]}
                    />
                }
                initialNumToRender={8}
                maxToRenderPerBatch={8}
                windowSize={7}
                removeClippedSubviews={true}
                getItemLayout={getItemLayout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
    },
    safeArea: {
        backgroundColor: "#FFFFFF",
    },
    listContent: {
        paddingTop: 16,
        paddingBottom: 110,
        flexGrow: 1,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    sectionHeaderText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#9CA3AF",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});
