import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBadge } from "../components/StatusBadge";
import { PrimaryButton } from "../components/PrimaryButton";
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getOrdersByUser } from "../services/orderService";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useAuth, useCart } from "../store/hooks";
import { formatDateTime } from "../utils/format";
import { showMessage } from "../utils/dialog";
import { RootScreenProps } from "../navigation/types";
import { Order, OrderStatus } from "../types";
import { colors, formatPrice, radius } from "../theme";

export const PAYMENT_LABEL = { cod: "Thanh toán khi nhận hàng (COD)", bank: "Chuyển khoản ngân hàng" } as const;

// Câu 5 (câu hỏi bổ sung): bộ lọc trạng thái cho màn Đơn hàng.
type StatusFilter = "all" | OrderStatus;
const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "completed", label: "Hoàn tất" },
  { value: "cancelled", label: "Đã huỷ" },
];

export function OrdersScreen({ navigation }: RootScreenProps<"Orders">) {
  const { user, isLoggedIn } = useAuth();
  const { items: cartItems, add, setQty } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null); // đơn đang mở rộng (xem chi tiết ngay tại màn này)
  const [status, setStatus] = useState<StatusFilter>("all"); // câu 5

  const load = useCallback(async () => {
    // BT9.3a: sắp xếp lại ở client cho chắc, mới nhất lên đầu (chuỗi ISO so sánh được).
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrdersByUser(user.id);
      setOrders([...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [user]);
  useEffect(() => {
    load();
  }, [load]);

  // BT9.C1 (thử thách "Mua lại"): thêm lại toàn bộ sản phẩm của đơn vào giỏ hiện tại.
  // Lấy giá và tồn kho mới nhất từ getBooks() vì giá trong đơn cũ có thể đã khác.
  // Cùng sách thì cộng số lượng; setQty của store tự chặn ở tồn kho.
  const reorder = async (order: Order) => {
    try {
      const books = await getBooks();
      order.items.forEach((it) => {
        const book = books.find((b) => b.id === it.bookId);
        if (!book || book.stock <= 0) return;
        const inCart = cartItems.find((c) => c.bookId === it.bookId);
        if (!inCart) add({ bookId: book.id, title: book.title, price: book.price, emoji: book.emoji, color: book.color, stock: book.stock });
        setQty(it.bookId, (inCart?.quantity ?? 0) + it.quantity);
      });
      showMessage("Đã thêm vào giỏ", "Các sản phẩm của đơn hàng đã được thêm lại vào giỏ.", () =>
        navigation.navigate("Tabs", { screen: "Cart" }),
      );
    } catch (e) {
      showMessage("Không thể mua lại", getErrorMessage(e));
    }
  };

  if (!isLoggedIn) {
    return <EmptyState emoji="🔒" title="Bạn cần đăng nhập" actionLabel="Đăng nhập" onAction={() => navigation.navigate("Login")} />;
  }
  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  // Câu 5: chỗ sửa duy nhất trong dữ liệu truyền cho FlatList.
  const visibleOrders = orders.filter((o) => status === "all" || o.status === status);

  // SỬA LỖI NÚT LỌC QUÁ TO: trước đây ScrollView lọc đặt ngang hàng với FlatList
  // trong một View flex:1, nên ScrollView bị kéo giãn theo chiều dọc và các chip
  // (mặc định alignItems: stretch trong hàng ngang) cũng bị kéo cao theo.
  // Đưa hàng lọc vào ListHeaderComponent của FlatList thì chiều cao của nó chỉ
  // bằng đúng nội dung, cộng thêm alignItems: "center" để chip không bị stretch.
  const filterBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filters}>
      {STATUS_FILTERS.map((f) => {
        const active = status === f.value;
        return (
          <Pressable key={f.value} style={[styles.chip, active && styles.chipActive]} onPress={() => setStatus(f.value)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* BT9.3b + BT9.3c: chi tiết mở ngay trong thẻ, không sang màn khác */}
      <FlatList
        data={visibleOrders}
        keyExtractor={(o) => String(o.id)}
        ListHeaderComponent={filterBar}
        contentContainerStyle={{ padding: 12, gap: 10, flexGrow: 1 }}
        ListEmptyComponent={
          orders.length === 0 ? (
            <EmptyState emoji="🧾" title="Bạn chưa có đơn hàng nào" message="Đặt đơn đầu tiên để theo dõi tại đây." actionLabel="Mua sắm ngay" onAction={() => navigation.navigate("Tabs", { screen: "Home" })} />
          ) : (
            <EmptyState emoji="🧾" title="Không có đơn hàng ở trạng thái này" message="Hãy chọn trạng thái khác để xem các đơn còn lại." />
          )
        }
        renderItem={({ item: o }) => {
          const open = openId === o.id;
          return (
            <View style={styles.card}>
              <Pressable onPress={() => setOpenId(open ? null : o.id)} style={styles.head}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.code}>Đơn #{o.id}</Text>
                  <Text style={styles.date}>{formatDateTime(o.createdAt)}</Text>
                  <Text style={styles.total}>{formatPrice(o.total)}</Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 6 }}>
                  <StatusBadge status={o.status} />
                  <Text style={styles.toggle}>{open ? "Thu gọn ▲" : "Chi tiết ▼"}</Text>
                </View>
              </Pressable>
              {open && (
                <View style={styles.detail}>
                  {o.items.map((it) => (
                    <View key={it.bookId} style={styles.itemRow}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {it.title} × {it.quantity}
                      </Text>
                      <Text style={styles.itemPrice}>{formatPrice(it.price * it.quantity)}</Text>
                    </View>
                  ))}
                  <View style={styles.addr}>
                    <Text style={styles.addrH}>Giao đến</Text>
                    <Text style={styles.addrT}>
                      {o.address.name} · {o.address.phone}
                    </Text>
                    <Text style={styles.addrT}>{o.address.address}</Text>
                    <Text style={styles.addrT}>Thanh toán: {PAYMENT_LABEL[o.paymentMethod]}</Text>
                  </View>
                  {o.status === "completed" && <PrimaryButton title="Mua lại" variant="outline" onPress={() => reorder(o)} />}
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  filterBar: { flexGrow: 0, flexShrink: 0 },
  filters: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: "center" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.indigo, borderColor: colors.indigo },
  chipText: { color: colors.text, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  card: { backgroundColor: "#fff", borderRadius: radius.md, padding: 14, gap: 10 },
  head: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  code: { fontWeight: "800", color: colors.navy, fontSize: 16 },
  date: { color: colors.muted, fontSize: 12 },
  total: { fontWeight: "800", color: colors.indigo, fontSize: 16 },
  toggle: { color: colors.indigo, fontWeight: "700", fontSize: 12 },
  detail: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 8 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  itemTitle: { flex: 1, color: colors.text },
  itemPrice: { fontWeight: "700", color: colors.text },
  addr: { gap: 2 },
  addrH: { fontWeight: "800", color: colors.navy },
  addrT: { color: colors.muted },
});
