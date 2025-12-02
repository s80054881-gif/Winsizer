import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiClient from "../../apiClient";
import SubscriptionBanner from "../../components/SubscriptionBanner"; // ⭐ ADD THIS

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUser();
      fetchSubscription();
    });
    fetchUser();
    fetchSubscription();
    return unsubscribe;
  }, []);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        navigation.replace("Login");
        return;
      }

      const res = await ApiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log(err);
      Alert.alert("Session expired", "Please login again");
      navigation.replace("Login");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await ApiClient.get("/subscription/status");
      setSubscription(res.data);
    } catch (err) {
      console.log("Error fetching subscription status:", err);
    }
  };

const handleLogout = async () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("authToken");

          // Reset to Auth Navigator
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }], // <-- IMPORTANT
          });
        },
      },
    ]
  );
};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffa200ff" />
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* ⭐ Subscription Banner */}
      <SubscriptionBanner navigation={navigation} />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* ===================== */}
          {/* ⭐ SUBSCRIPTION STATUS */}
          {/* ===================== */}
          {subscription && (
            <View style={styles.subscriptionCard}>
              <Text style={styles.sectionTitle}>Subscription</Text>

              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Plan:</Text>
                <Text style={styles.subValue}>
                  {subscription.plan === "FREE" ? "Free Plan" : "Premium"}
                </Text>
              </View>

              <View style={styles.subRow}>
                <Text style={styles.subLabel}>Free Orders Left:</Text>
                <Text style={styles.subValue}>{subscription.remainingFreeOrders}</Text>
              </View>

              {subscription.plan !== "FREE" && (
                <View style={styles.subRow}>
                  <Text style={styles.subLabel}>Valid Until:</Text>
                  <Text style={styles.subValue}>{subscription.expiryDate || "N/A"}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => navigation.navigate("Subscription")}
              >
                <Text style={styles.upgradeText}>
                  {subscription.plan === "FREE" ? "Upgrade Now" : "Manage Plan"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* User Information */}
          <View style={styles.infoContainer}>
            {/* Username */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Icon name="person-outline" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{user?.username || "N/A"}</Text>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Icon name="call-outline" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                <Text style={styles.infoValue}>{user?.phone || "N/A"}</Text>
              </View>
            </View>

            {/* Address */}
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Icon name="location-outline" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{user?.address || "N/A"}</Text>
              </View>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb", marginTop: 25 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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

  scrollContent: { flex: 1 },
  content: { padding: 16 },

  /* ===== subscription card ===== */
  subscriptionCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#333" },
  subRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  subLabel: { fontSize: 14, color: "#666" },
  subValue: { fontSize: 14, fontWeight: "600", color: "#333" },
  upgradeButton: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ffa200ff",
    alignItems: "center",
  },
  upgradeText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  /* ===== user info ===== */
  infoContainer: { marginBottom: 24 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#ffa2001a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#888", marginBottom: 4, fontWeight: "500" },
  infoValue: { fontSize: 16, color: "#333", fontWeight: "600" },

  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
  },
  logoutText: { color: "#fff", fontSize: 16, fontWeight: "600", marginLeft: 8 },
});
