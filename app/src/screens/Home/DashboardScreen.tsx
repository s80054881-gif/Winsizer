import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../apiClient";

interface Order {
  id: number;
  partyName: string;
  windowType: string;
  totalCost: number;
  quantity: number;
  createdAt?: string;
}

export default function DashboardScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalParties: 0, // ADDED: Party count
  });

  // Get card color based on index
  const getCardColor = (index: number) => {
    const colors = ['#ff6b35', '#00d4aa', '#9e9e9e', '#ffa200ff', '#6366f1'];
    return colors[index % colors.length];
  };

  // Fetch user info
  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("⚠️ No token found, redirecting to login");
        navigation.replace("Login");
        return;
      }

      console.log("✅ Token found, fetching user info");
      const res = await apiClient.get("/auth/me");
      setUser(res.data);
      console.log("✅ User info loaded:", res.data.username);
    } catch (err: any) {
      console.log("❌ Error fetching user:", err.response?.data || err.message);
      
      // Only redirect to login if it's an auth error
      if (err.response?.status === 401 || err.response?.status === 403) {
        await AsyncStorage.removeItem("authToken");
        Alert.alert("Session expired", "Please login again", [
          { text: "OK", onPress: () => navigation.replace("Login") }
        ]);
      }
    }
  };

  // Fetch orders and parties from API
  const fetchOrders = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      // Fetch orders
      const ordersResponse = await apiClient.get("/orders");
      const ordersData = ordersResponse.data;

      // Fetch parties
      const partiesResponse = await apiClient.get("/parties");
      const partiesData = partiesResponse.data;

      // Sort orders by most recent first
      const sortedOrders = ordersData.sort((a: Order, b: Order) => {
        return b.id - a.id;
      });

      setOrders(sortedOrders);

      // Calculate stats
      const totalRevenue = ordersData.reduce(
        (sum: number, order: Order) => sum + order.totalCost,
        0
      );

      setStats({
        totalOrders: ordersData.length,
        totalRevenue: totalRevenue,
        totalParties: partiesData.length, // ADDED: Count parties
      });

      console.log("✅ Orders fetched:", ordersData.length);
      console.log("✅ Parties fetched:", partiesData.length);
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUser();
      fetchOrders();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Today";
    
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  };

  // Handle delete order
  const handleDeleteOrder = (id: number, partyName: string) => {
    Alert.alert(
      "Delete Order",
      `Are you sure you want to delete order for "${partyName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/orders/${id}`);

              // Remove from local state
              setOrders((prev) => prev.filter((o) => o.id !== id));

              // Recalculate stats
              const updatedOrders = orders.filter((o) => o.id !== id);
              const totalRevenue = updatedOrders.reduce(
                (sum, order) => sum + order.totalCost,
                0
              );

              setStats(prev => ({
                ...prev,
                totalOrders: updatedOrders.length,
                totalRevenue,
              }));

              Alert.alert("Success", "Order deleted successfully");
            } catch (error: any) {
              console.error("❌ Error deleting order:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete order"
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={() => navigation.navigate("Profile")}
        >
          <Image
            source={{
              uri: user?.avatar || "https://placehold.co/80x80/ffa200/ffffff?text=U",
            }}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ffa200ff"]}
          />
        }
      >
        <View style={styles.content}>
          {/* Stats Cards - ADDED PARTY COUNT */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Icon name="receipt-outline" size={24} color="#ffa200ff" />
              <Text style={styles.statValue}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="cash-outline" size={24} color="#10b981" />
              <Text style={styles.statValue}>
                {formatCurrency(stats.totalRevenue)}
              </Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="people-outline" size={24} color="#6366f1" />
              <Text style={styles.statValue}>{stats.totalParties}</Text>
              <Text style={styles.statLabel}>Parties</Text>
            </View>
          </View>

          {/* Quick Action Buttons */}
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("AddParty")}
            >
              <Icon name="add-circle-outline" size={32} color="#ffa200ff" />
              <Text style={styles.quickActionText}>Add Party</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate("Party")}
            >
              <Icon name="people-outline" size={32} color="#ffa200ff" />
              <Text style={styles.quickActionText}>View Parties</Text>
            </TouchableOpacity>
          </View>

          {/* All Orders Section */}
          <View style={styles.ordersSection}>
            <View style={styles.ordersSectionHeader}>
              <Text style={styles.ordersTitle}>Recent Orders</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffa200ff" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyContainer}>
                <Icon name="receipt-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No orders yet</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate("AddParty")}
                >
                  <Text style={styles.addButtonText}>Create First Order</Text>
                </TouchableOpacity>

                <TouchableOpacity
  style={styles.subscriptionButton}
  onPress={() => navigation.navigate("Subscription")}
>
  <Icon name="star" size={24} color="#fff" />
  <Text style={styles.subscriptionButtonText}>Manage Subscription</Text>
</TouchableOpacity>
              </View>
            ) : (
              /* Order Cards */
              orders.slice(0, 5).map((order, index) => {
                const borderColor = getCardColor(index);
                
                return (
                  <View 
                    key={order.id} 
                    style={[styles.orderCard, { borderLeftColor: borderColor }]}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.orderLeft}>
                        <Icon name="receipt" size={20} color={borderColor} />
                        <Text style={styles.orderNumber}>Order #{order.id}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteOrder(order.id, order.partyName)}
                      >
                        <Icon name="trash-outline" size={20} color="#ff4444" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.orderDetails}>
                      <View style={styles.orderDetailRow}>
                        <Icon name="person-outline" size={16} color="#666" />
                        <Text style={styles.orderDetailText}>{order.partyName}</Text>
                      </View>
                      <View style={styles.orderDetailRow}>
                        <Icon name="cube-outline" size={16} color="#666" />
                        <Text style={styles.orderDetailText}>
                          {order.windowType} ({order.quantity} qty)
                        </Text>
                      </View>
                      <View style={styles.orderDetailRow}>
                        <Icon name="calendar-outline" size={16} color="#666" />
                        <Text style={styles.orderDetailText}>
                          {formatDate(order.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderFooter}>
                      <Text style={[styles.orderAmount, { color: borderColor }]}>
                        {formatCurrency(order.totalCost)}
                      </Text>
                      <TouchableOpacity
                        style={[styles.viewButton, { backgroundColor: borderColor }]}
                        onPress={() =>
                          navigation.navigate("OrderDetails", { orderId: order.id })
                        }
                      >
                        <Text style={styles.viewButtonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#ffa200ff" />
          <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Party")}
        >
          <Icon name="people-outline" size={24} color="#888" />
          <Text style={styles.navText}>Party</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Seller")}
        >
          <Icon name="cube-outline" size={24} color="#888" />
          <Text style={styles.navText}>Item</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Videos")}
        >
          <Icon name="videocam-outline" size={24} color="#888" />
          <Text style={styles.navText}>Videos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Seller")}
        >
          <Icon name="business-outline" size={24} color="#888" />
          <Text style={styles.navText}>Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    marginTop: 25,
  },

  subscriptionButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#10b981",
  padding: 16,
  borderRadius: 12,
  gap: 8,
  marginVertical: 16,
},
subscriptionButtonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "700",
},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffa200ff",
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ffb84d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  ordersSection: {
    marginBottom: 16,
  },
  ordersSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffa200ff",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
  },
  addButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#ffa200ff",
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  orderDetails: {
    gap: 8,
    marginBottom: 12,
  },
  orderDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 14,
    color: "#666",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    marginBottom: 45,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    padding: 8,
  },
  navText: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
  navTextActive: {
    color: "#ffa200ff",
    fontWeight: "600",
  },
});