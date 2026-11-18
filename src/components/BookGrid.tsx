import React from "react";
import { FlatList, RefreshControl } from "react-native";
import { Book } from "../types";
import { BookCard } from "./BookCard";

interface Props {
  data: Book[];
  onPressBook?: (book: Book) => void;
  // SDK 58 / React Native 0.88: FlatList không còn nhận null cho 2 prop này,
  // chỉ nhận element hoặc undefined, nên bỏ "| null" ở đây cho typecheck qua.
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  bottomSpace?: number;
  refreshing?: boolean; // kéo để làm mới
  onRefresh?: () => void;
}

// Lưới sách 2 cột, dùng lại ở Home, kết quả tìm kiếm, Yêu thích…
export function BookGrid({ data, onPressBook, ListHeaderComponent, ListEmptyComponent, bottomSpace = 90, refreshing, onRefresh }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(b) => String(b.id)}
      numColumns={2}
      renderItem={({ item }) => <BookCard book={item} onPress={onPressBook} />}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      contentContainerStyle={{ padding: 6, paddingBottom: bottomSpace }}
      refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
    />
  );
}
