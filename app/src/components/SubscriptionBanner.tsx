import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../apiClient";

interface SubscriptionBannerProps {
  navigation: any;
}

export default function SubscriptionBanner({ navigation }: SubscriptionBannerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await apiClient.get("/subscription/status");
      setSubscriptionStatus(response.data);
      
      // Show banner if user is on free plan with less than 3 orders remaining
      if (response.data.plan === "FREE" && response.data.remainingFreeOrders <= 3) {
        setVisible(true);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  if (!visible || !subscriptionStatus) return null;

  const isUrgent = subscriptionStatus.remainingFreeOrders === 0;

  return (
    <View style={[styles.banner, isUrgent && styles.bannerUrgent]}>
      <Icon 
        name={isUrgent ? "lock-closed" : "warning"} 
        size={24} 
        color={isUrgent ? "#ef4444" : "#f59e0b"} 
      />
      
      <View style={styles.textContainer}>
        {isUrgent ? (
          <>
            <Text style={styles.urgentTitle}>Order Limit Reached!</Text>
            <Text style={styles.urgentText}>
              Upgrade to create unlimited orders
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.warningTitle}>
              {subscriptionStatus.remainingFreeOrders} Free Orders Left
            </Text>
            <Text style={styles.warningText}>
              Upgrade now to unlock unlimited orders
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.upgradeButton, isUrgent && styles.upgradeButtonUrgent]}
        onPress={() => navigation.navigate("Subscription")}
      >
        <Text style={styles.upgradeButtonText}>Upgrade</Text>
        <Icon name="arrow-forward" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerUrgent: {
    backgroundColor: "#fee2e2",
    borderLeftColor: "#ef4444",
  },
  textContainer: { flex: 1 },
  warningTitle: { fontSize: 16, fontWeight: "700", color: "#92400e", marginBottom: 2 },
  warningText: { fontSize: 13, color: "#78350f" },
  urgentTitle: { fontSize: 16, fontWeight: "700", color: "#991b1b", marginBottom: 2 },
  urgentText: { fontSize: 13, color: "#7f1d1d" },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f59e0b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  upgradeButtonUrgent: {
    backgroundColor: "#ef4444",
  },
  upgradeButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});