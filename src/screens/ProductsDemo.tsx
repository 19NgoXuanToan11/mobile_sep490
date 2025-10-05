import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import env from "../config/env";
import { OpenAPI } from "../api/core/OpenAPI";
import { ProductService } from "../api/services/ProductService";

type ProductItem = {
  productId?: number;
  productName?: string | null;
};

type Pagination<T> = {
  totalItemCount: number;
  pageSize: number;
  pageIndex: number;
  items: T[];
};

type ApiEnvelope = {
  status: number;
  message?: string;
  data?: Pagination<ProductItem>;
};

export default function ProductsDemo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductItem[]>([]);

  useEffect(() => {
    OpenAPI.BASE = env.API_URL;
    // eslint-disable-next-line no-console
    (async () => {
      try {
        const res = (await ProductService.getApiV1ProductsProductsList({
          pageIndex: 1,
          pageSize: 20,
        })) as unknown as ApiEnvelope;
        if (!res || res.status !== 200 || !res.data) {
          throw new Error(res?.message || "Unexpected API response");
        }
        setItems(res.data.items || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading products…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>Products</Text>
        <Text style={{ marginTop: 4, color: "#666" }}>Base: {env.API_URL}</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item, index) => String(item.productId ?? index)}
        renderItem={({ item }) => (
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text>{item.productName ?? "(no name)"}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
