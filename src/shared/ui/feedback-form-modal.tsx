import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { RatingStars } from "./rating-stars";
export interface FeedbackFormModalProps {
  visible: boolean;
  initialComment?: string;
  initialRating?: number | null;
  onClose: () => void;
  onSubmit: (payload: {
    comment: string;
    rating: number | null;
  }) => Promise<void> | void;
  submitting?: boolean;
}
export default function FeedbackFormModal({
  visible,
  initialComment,
  initialRating,
  onClose,
  onSubmit,
  submitting,
}: FeedbackFormModalProps) {
  const [comment, setComment] = useState(initialComment ?? "");
  const [rating, setRating] = useState<number | null>(initialRating ?? 5);
  useEffect(() => {
    if (visible) {
      setComment(initialComment ?? "");
      setRating(initialRating ?? 5);
    }
  }, [visible, initialComment, initialRating]);
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-black/30">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View
              className="bg-white w-full rounded-t-2xl p-6"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -8 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
              }}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                <View className="items-center mb-4">
                  <View className="w-12 h-1.5 bg-neutral-200 rounded-full" />
                </View>
                <Text className="text-xl font-semibold text-neutral-900 mb-4">
                  Viết đánh giá
                </Text>
                <View className="mb-4">
                  <RatingStars
                    rating={Number(rating ?? 0)}
                    readonly={false}
                    size={24}
                    onRatingChange={(r) => setRating(r)}
                  />
                </View>
                <View className="bg-neutral-50 rounded-xl p-3">
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Chia sẻ cảm nhận của bạn…"
                    multiline
                    className="min-h-24 text-base text-neutral-800"
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit
                  />
                </View>
              </ScrollView>
              <View className="flex-row space-x-3 pt-4">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 bg-white border border-neutral-200 rounded-xl py-3 items-center"
                >
                  <Text className="text-neutral-700 font-medium">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onSubmit({ comment, rating })}
                  disabled={submitting || !comment.trim()}
                  className="flex-1 bg-primary-500 rounded-xl py-3 items-center"
                  style={{ opacity: submitting || !comment.trim() ? 0.6 : 1 }}
                >
                  <Text className="text-white font-semibold">Gửi đánh giá</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
