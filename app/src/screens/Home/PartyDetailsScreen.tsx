import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../../apiClient";

interface Party {
  id: number;
  partyName: string;
  contactNumber?: string;
  partyType: string;
  gstNumber?: string;
  panNumber?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
}

interface Order {
  id: number;
  partyId: number;
  partyName: string;
  windowType: string;
  height: number;
  width: number;
  quantity: number;
  tracks: number;
  rate: number;
  totalCost: number;
  createdAt?: string;
}

export default function PartyDetailsScreen({ route, navigation }: any) {
  const { partyId } = route.params;
  const [party, setParty] = useState<Party | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      // Fetch party details
      const partyResponse = await apiClient.get(`/parties/${partyId}`);
      setParty(partyResponse.data);
      console.log("✅ Party loaded:", partyResponse.data);

      // ✅ Fetch only orders belonging to this party
      const ordersResponse = await apiClient.get(`/orders/party/${partyId}`);
      setOrders(ordersResponse.data || []);
      console.log(`✅ Orders fetched for party ${partyId}:`, ordersResponse.data.length);
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [partyId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(false);
  };

  const handleDeleteParty = () => {
    Alert.alert(
      "Delete Party",
      `Are you sure you want to delete "${party?.partyName}"? This will also delete all associated orders.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/parties/${partyId}`);
              Alert.alert("Success", "Party deleted successfully");
              navigation.goBack();
            } catch (error: any) {
              console.error("❌ Error deleting party:", error);
              Alert.alert("Error", error.response?.data?.message || "Failed to delete party");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    if (typeof amount !== "number") return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      onPress={() => navigation.navigate("OrderDetails", { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderLeft}>
          <Text style={styles.orderNumber}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
        </View>
        <View style={styles.orderRight}>
          <Text style={styles.orderAmount}>{formatCurrency(item.totalCost)}</Text>
          <Text style={styles.orderMeta}>
            {item.quantity} × {item.windowType}
          </Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <View style={styles.orderSpecs}>
          <Icon name="resize" size={14} color="#666" />
          <Text style={styles.orderSpecsText}>
            {item.height}" × {item.width}" • {item.tracks} Track
          </Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#ffa200ff" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffa200ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!party) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Party Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Party not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Party Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate("EditParty", { partyId })}>
          <Icon name="create-outline" size={24} color="#ffa200ff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#ffa200ff"]}
          />
        }
      >
        {/* Party Info */}
        <View style={styles.partyCard}>
          <View style={styles.partyIconContainer}>
            <View style={styles.partyIcon}>
              <Icon name="business" size={32} color="#ffa200ff" />
            </View>
            <View style={styles.partyMainInfo}>
              <Text style={styles.partyName}>{party.partyName}</Text>
              <View style={styles.partyTypeBadge}>
                <Text style={styles.partyTypeText}>{party.partyType}</Text>
              </View>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.infoSection}>
            {party.contactNumber && (
              <View style={styles.infoRow}>
                <Icon name="call" size={18} color="#666" />
                <Text style={styles.infoText}>{party.contactNumber}</Text>
              </View>
            )}
            {party.billingAddress && (
              <View style={styles.infoRow}>
                <Icon name="location" size={18} color="#666" />
                <Text style={styles.infoText}>
                  {[party.billingAddress, party.city, party.state].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {party.gstNumber && (
              <View style={styles.infoRow}>
                <Icon name="document-text" size={18} color="#666" />
                <Text style={styles.infoText}>GST: {party.gstNumber}</Text>
              </View>
            )}
            {party.panNumber && (
              <View style={styles.infoRow}>
                <Icon name="card" size={18} color="#666" />
                <Text style={styles.infoText}>PAN: {party.panNumber}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() =>
                navigation.navigate("Calulator", {
                  prefilledPartyName: party.partyName,
                  partyId: party.id,
                })
              }
            >
              <Icon name="add-circle" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>New Order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSecondary]}
              onPress={() => navigation.navigate("EditParty", { partyId })}
            >
              <Icon name="create" size={20} color="#ffa200ff" />
              <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={handleDeleteParty}
            >
              <Icon name="trash" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Orders Section */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.ordersTitle}>Order History</Text>
            <View style={styles.ordersCount}>
              <Text style={styles.ordersCountText}>{orders.length}</Text>
            </View>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyOrders}>
              <Icon name="document-text-outline" size={64} color="#ccc" />
              <Text style={styles.emptyOrdersText}>No orders yet</Text>
              <TouchableOpacity
                style={styles.createOrderButton}
                onPress={() =>
                  navigation.navigate("Calulator", {
                    prefilledPartyName: party.partyName,
                    partyId: party.id,
                  })
                }
              >
                <Icon name="add" size={20} color="#fff" />
                <Text style={styles.createOrderButtonText}>Create First Order</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={orders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              contentContainerStyle={styles.ordersList}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", marginTop: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#666" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { marginTop: 16, fontSize: 18, color: "#666" },
  content: { flex: 1 },
  partyCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  partyIconContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  partyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ffa20020",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  partyMainInfo: { flex: 1 },
  partyName: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 8 },
  partyTypeBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  partyTypeText: { fontSize: 12, fontWeight: "600", color: "#666" },
  infoSection: { marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 12 },
  infoText: { fontSize: 15, color: "#666", flex: 1 },
  actionButtons: { flexDirection: "row", gap: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#ffa200ff",
    gap: 6,
  },
  actionBtnSecondary: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ffa200ff" },
  actionBtnDanger: { backgroundColor: "#ef4444" },
  actionBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  actionBtnTextSecondary: { color: "#ffa200ff" },
  ordersSection: { paddingHorizontal: 16 },
  ordersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  ordersTitle: { fontSize: 18, fontWeight: "700", color: "#333" },
  ordersCount: {
    backgroundColor: "#ffa200ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ordersCountText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  emptyOrders: { 
    alignItems: "center", 
    paddingVertical: 48, 
    backgroundColor: "#fff", 
    borderRadius: 12,
  },
  emptyOrdersText: { fontSize: 16, color: "#999", marginTop: 16, marginBottom: 20 },
  createOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffa200ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createOrderButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  ordersList: { gap: 12 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#ffa200ff",
  },
  orderHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 12,
  },
  orderLeft: { flex: 1 },
  orderNumber: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 4 },
  orderDate: { fontSize: 13, color: "#999" },
  orderRight: { alignItems: "flex-end" },
  orderAmount: { fontSize: 18, fontWeight: "700", color: "#ffa200ff", marginBottom: 2 },
  orderMeta: { fontSize: 12, color: "#666" },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  orderSpecs: { flexDirection: "row", alignItems: "center", gap: 6 },
  orderSpecsText: { fontSize: 13, color: "#666" },
});
