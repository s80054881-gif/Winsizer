import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import RazorpayCheckout from "react-native-razorpay";
import apiClient from "../../apiClient"; // assumes axios instance with auth

export default function SubscriptionScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchData();
    const unsub = navigation.addListener("focus", fetchData);
    return unsub;
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, plansRes] = await Promise.all([
        apiClient.get("/subscription/status"),
        apiClient.get("/subscription/plans"), // returns available plans
      ]);
      setSubscriptionStatus(statusRes.data);
      setPlans(plansRes.data.plans);
    } catch (error: any) {
      console.error("Error fetching subscription data:", error);
      Alert.alert("Error", "Failed to load subscription data");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: any) => {
    try {
      setPurchasing(true);

      // 1) Create order on backend (backend creates Razorpay order_id)
      const orderResponse = await apiClient.post("/subscription/create-order", {
        plan: plan.id, // expected "MONTHLY" or "YEARLY"
      });

      const { orderId, amount, currency, keyId, user } = orderResponse.data;

      // 2) Open Razorpay checkout pointing to the order
      const options = {
        description: `${plan.name} Subscription`,
        image: "https://your-logo-url.com/logo.png",
        currency: currency,
        key: keyId,
        amount: amount, // in paise (backend should return integer)
        name: "WinSizer",
        order_id: orderId,
        prefill: {
          email: user?.email || "",
          contact: user?.phone || "",
          name: user?.username || "",
        },
        theme: { color: "#ffb30e" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          // 3) Verify payment on backend (pass razorpay params + plan)
          try {
            await apiClient.post("/subscription/verify-payment", {
              razorpay_order_id: orderId,
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_signature: data.razorpay_signature,
              plan: plan.id,
            });

            Alert.alert(
              "Success!",
              "Subscription activated successfully! You now have access for the plan period.",
              [{ text: "OK", onPress: () => fetchData() }]
            );
          } catch (verifyError: any) {
            console.error("Verification error", verifyError);
            Alert.alert("Error", "Payment verification failed. Contact support.");
          }
        })
        .catch((err: any) => {
          console.log("Payment canceled/error", err);
          Alert.alert("Payment Cancelled", "Payment was not completed");
        })
        .finally(() => {
          setPurchasing(false);
        });
    } catch (error: any) {
      console.error("Purchase error:", error);
      Alert.alert("Error", "Failed to initiate payment");
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffb30e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon
              name={subscriptionStatus?.isActive ? "checkmark-circle" : "warning"}
              size={32}
              color={subscriptionStatus?.isActive ? "#10b981" : "#ff9800"}
            />
            <Text style={styles.statusTitle}>
              {subscriptionStatus?.plan === "FREE" ? "Free Plan" : `${subscriptionStatus?.plan} Plan`}
            </Text>
          </View>

          {subscriptionStatus?.plan === "FREE" && (
            <View style={styles.freeOrdersInfo}>
              <Text style={styles.ordersUsedText}>
                {subscriptionStatus.freeOrdersUsed} / {subscriptionStatus.freeOrdersLimit} Free Orders Used
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(subscriptionStatus.freeOrdersUsed / subscriptionStatus.freeOrdersLimit) * 100}%`,
                      backgroundColor: subscriptionStatus.remainingFreeOrders > 3 ? "#10b981" : "#ef4444",
                    },
                  ]}
                />
              </View>
              <Text style={styles.remainingText}>{subscriptionStatus.remainingFreeOrders} orders remaining</Text>
            </View>
          )}

          {subscriptionStatus?.isActive && subscriptionStatus?.plan !== "FREE" && (
            <View style={styles.activeSubInfo}>
              <Icon name="infinite" size={24} color="#10b981" />
              <Text style={styles.unlimitedText}>Access valid until:</Text>
              <Text style={styles.validUntil}>
                {subscriptionStatus.expiryDate ? new Date(subscriptionStatus.expiryDate).toLocaleDateString() : "N/A"}
              </Text>
            </View>
          )}
        </View>

        {/* Subscription Plans */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>

        {plans.map((plan: any) => (
          <View key={plan.id} style={styles.planCard}>
            {plan.savings && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>{plan.savings}</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Text style={styles.price}>{plan.price}</Text>
              <Text style={styles.duration}>/ {plan.duration}</Text>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features?.map((feature: string, index: number) => (
                <View key={index} style={styles.featureRow}>
                  <Icon name="checkmark-circle" size={20} color="#10b981" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.subscribeButton,
                plan.id === "YEARLY" && styles.subscribeButtonPremium,
                purchasing && styles.subscribeButtonDisabled,
              ]}
              onPress={() => handlePurchase(plan)}
              disabled={purchasing}
            >
              {purchasing ? <ActivityIndicator color="#fff" /> : <Text style={styles.subscribeButtonText}>Pay Now</Text>}
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.infoSection}>
          <Icon name="information-circle" size={24} color="#64748b" />
          <Text style={styles.infoText}>This is a one-time payment. After payment you will have access for the plan duration.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // (same styles you already had — omitted for brevity; keep the styles you provided earlier)
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#ffb30e",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  content: { flex: 1, padding: 16 },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
  },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  statusTitle: { fontSize: 22, fontWeight: "700", color: "#333" },
  freeOrdersInfo: { gap: 8 },
  ordersUsedText: { fontSize: 16, fontWeight: "600", color: "#555" },
  progressBar: {
    height: 10,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 10 },
  remainingText: { fontSize: 14, color: "#6b7280", fontStyle: "italic" },
  activeSubInfo: { alignItems: "center", gap: 8 },
  unlimitedText: { fontSize: 18, fontWeight: "700", color: "#10b981" },
  validUntil: { fontSize: 14, color: "#6b7280" },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 16 },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 3,
    position: "relative",
  },
  savingsBadge: {
    position: "absolute",
    top: -10,
    right: 16,
    backgroundColor: "#ef4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  planName: { fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 12 },
  priceContainer: { flexDirection: "row", alignItems: "flex-end", marginBottom: 20 },
  currencySymbol: { fontSize: 24, fontWeight: "600", color: "#ffb30e" },
  price: { fontSize: 42, fontWeight: "800", color: "#ffb30e" },
  duration: { fontSize: 16, color: "#6b7280", marginBottom: 8, marginLeft: 4 },
  featuresContainer: { gap: 12, marginBottom: 20 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureText: { fontSize: 15, color: "#555" },
  subscribeButton: {
    backgroundColor: "#ffb30e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  subscribeButtonPremium: { backgroundColor: "#10b981" },
  subscribeButtonDisabled: { backgroundColor: "#9ca3af" },
  subscribeButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  infoText: { flex: 1, fontSize: 14, color: "#64748b" },
});
