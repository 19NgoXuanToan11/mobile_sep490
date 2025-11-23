import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { ordersApi } from "../../../shared/data/api";
import { Order } from "../../../types";

export function useOrderDetail(orderId: string | undefined) {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: orderResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  });

  const { data: fullOrderResponse } = useQuery({
    queryKey: ["order-full", orderId],
    queryFn: () => ordersApi.getFullDetailById(orderId!),
    enabled: !!orderId,
  });

  const order = orderResponse?.data;
  const fullOrderData = fullOrderResponse?.data ?? null;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return {
    order,
    fullOrderData,
    isLoading,
    error,
    refreshing,
    onRefresh,
  };
}
