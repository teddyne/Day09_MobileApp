import React from "react";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TabBar, TabItem } from "../components/TabBar";
import { useCart } from "../store/hooks";

const ICONS: Record<string, TabItem["icon"]> = {
  Home: "home",
  Categories: "grid",
  Cart: "cart",
  Account: "person",
};

// Nối Tab Bar tự dựng với React Navigation: nhận { state, descriptors, navigation }
export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { totalQuantity } = useCart();

  const items: TabItem[] = state.routes.map((route) => ({
    key: route.key,
    label: descriptors[route.key].options.title ?? route.name,
    icon: ICONS[route.name] ?? "ellipse",
    badge: route.name === "Cart" ? totalQuantity : undefined,
  }));

  const onPress = (key: string) => {
    const route = state.routes.find((r) => r.key === key);
    if (!route) return;
    const isFocused = state.routes[state.index].key === key;
    const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
  };

  return <TabBar items={items} activeKey={state.routes[state.index].key} onPress={onPress} />;
}
