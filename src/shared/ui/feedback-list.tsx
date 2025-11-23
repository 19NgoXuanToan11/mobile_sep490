import React from "react";
import { View, Text, FlatList } from "react-native";
import { RatingStars } from "./rating-stars";
export type FeedbackListItem = {
  id?: string;
  comment: string;
  rating?: number | null;
  createdAt?: string;
  phone?: string;
  fullName?: string;
};
export interface FeedbackListProps {
  data: FeedbackListItem[];
  isLoading?: boolean;
  onEndReached?: () => void;
  onEditPress?: (item: FeedbackListItem) => void;
  currentUserPhone?: string;
}
const Item = ({
  item,
  canEdit,
  onEditPress,
}: {
  item: FeedbackListItem;
  canEdit?: boolean;
  onEditPress?: (it: FeedbackListItem) => void;
}) => {
  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <RatingStars rating={Number(item.rating ?? 0)} size={14} readonly />
          <Text className="ml-2 text-neutral-900 font-medium">
            {Number(item.rating ?? 0).toFixed(1)}
          </Text>
        </View>
        {item.createdAt && (
          <Text className="text-xs text-neutral-500">{item.createdAt}</Text>
        )}
      </View>
      <Text className="text-neutral-800 leading-6">{item.comment}</Text>
      {canEdit && (
        <View className="mt-3">
          <Text
            className="text-primary-600 font-medium"
            onPress={() => onEditPress && onEditPress(item)}
          >
            Sửa đánh giá
          </Text>
        </View>
      )}
      {(item.fullName || item.phone) && (
        <Text className="text-xs text-neutral-400 mt-2">
          {item.fullName || item.phone}
        </Text>
      )}
    </View>
  );
};
const FeedbackList = React.memo(function FeedbackList({
  data,
  isLoading,
  onEndReached,
  onEditPress,
  currentUserPhone,
}: FeedbackListProps) {
  if (isLoading) {
    return (
      <View className="bg-neutral-50 rounded-2xl p-4">
        <Text className="text-neutral-500">Đang tải đánh giá…</Text>
      </View>
    );
  }
  if (!data?.length) {
    return (
      <View className="bg-neutral-50 rounded-2xl p-4">
        <Text className="text-neutral-500">Chưa có đánh giá nào</Text>
      </View>
    );
  }
  const renderItem = React.useCallback(
    ({ item }: { item: FeedbackListItem }) => (
      <Item
        item={item}
        canEdit={Boolean(
          item.id && currentUserPhone && item.phone === currentUserPhone
        )}
        onEditPress={onEditPress}
      />
    ),
    [currentUserPhone, onEditPress]
  );

  const keyExtractor = React.useCallback(
    (item: FeedbackListItem, idx: number) => item.id ?? String(idx),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      scrollEnabled={false}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
});

export default FeedbackList;
