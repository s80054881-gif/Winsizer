import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function InvoiceScreen({ navigation, route }: any) {
  const { order } = route.params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const shareInvoice = async () => {
    try {
      const message = `
🪟 WINDOW ORDER INVOICE

Party: ${order.partyName}
Date: ${formatDate(order.date)}
Type: ${order.windowType === "regular" ? "Regular Window" : "18 x 50 Window"}

📐 MEASUREMENTS:
Size: ${order.billing.actualSize}
Billing: ${order.billing.billingSize}
Quantity: ${order.billing.quantity}

💰 BILLING:
Area per Window: ${order.billing.areaPerWindow} sq. ft
Total Area: ${order.billing.totalArea} sq. ft
Rate: ₹${order.billing.rate}/sq. ft
━━━━━━━━━━━━━━━━
TOTAL: ₹${order.billing.totalCost}

🔧 ALUMINUM CUTTING:
• Track Top Height: ${order.aluminum.trackTopHeight}"
• Track Top Width: ${order.aluminum.trackTopWidth}"
• Track Bottom: ${order.aluminum.trackBottom}"
• Handle Patti: ${order.aluminum.handlePatti}"
• Interlock: ${order.aluminum.interlock}"
• Bearing Bottom: ${order.aluminum.bearingBottom}"

🪟 GLASS CUTTING:
• Width: ${order.glass.width}"
• Height: ${order.glass.height}"
• Quantity: ${order.glass.quantity} pieces
      `.trim();

      await Share.share({
        message: message,
        title: `Invoice - ${order.partyName}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice</Text>
        <TouchableOpacity onPress={shareInvoice}>
          <Icon name="share-social" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceHeaderTop}>
              <View>
                <Text style={styles.invoiceTitle}>INVOICE</Text>
                <Text style={styles.invoiceId}>#{order.id}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Confirmed</Text>
              </View>
            </View>
            <Text style={styles.invoiceDate}>{formatDate(order.date)}</Text>
          </View>

          {/* Party Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="person" size={20} color="#ffb30eff" />
              <Text style={styles.cardTitle}>Party Details</Text>
            </View>
            <Text style={styles.partyName}>{order.partyName}</Text>
            <Text style={styles.windowType}>
              {order.windowType === "regular" ? "Regular Window" : "18 x 50 Window"}
            </Text>
          </View>

          {/* Billing Summary */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="receipt" size={20} color="#ffb30eff" />
              <Text style={styles.cardTitle}>Billing Summary</Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Actual Size:</Text>
              <Text style={styles.billingValue}>{order.billing.actualSize}</Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Billing Size:</Text>
              <Text style={[styles.billingValue, styles.highlight]}>
                {order.billing.billingSize}
              </Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Quantity:</Text>
              <Text style={styles.billingValue}>{order.billing.quantity}</Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Area per Window:</Text>
              <Text style={styles.billingValue}>{order.billing.areaPerWindow} sq. ft</Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Total Area:</Text>
              <Text style={[styles.billingValue, styles.highlight]}>
                {order.billing.totalArea} sq. ft
              </Text>
            </View>

            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Rate:</Text>
              <Text style={styles.billingValue}>₹{order.billing.rate}/sq. ft</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>₹{order.billing.totalCost}</Text>
            </View>
          </View>

          {/* Aluminum Cutting */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="construct" size={20} color="#ffb30eff" />
              <Text style={styles.cardTitle}>Aluminum Cutting List</Text>
            </View>

            <View style={styles.cuttingList}>
              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Track Top Height</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.trackTopHeight}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>

              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Track Top Width</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.trackTopWidth}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>

              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Track Bottom</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.trackBottom}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>

              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Handle Patti</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.handlePatti}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>

              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Interlock</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.interlock}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>

              <View style={styles.cuttingItem}>
                <Text style={styles.cuttingLabel}>Bearing Bottom</Text>
                <Text style={styles.cuttingValue}>{order.aluminum.bearingBottom}"</Text>
                <Text style={styles.cuttingQty}>× {order.tracks}</Text>
              </View>
            </View>
          </View>

          {/* Glass Cutting */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Icon name="square" size={20} color="#ffb30eff" />
              <Text style={styles.cardTitle}>Glass Cutting List</Text>
            </View>

            <View style={styles.glassDetails}>
              <View style={styles.glassRow}>
                <Text style={styles.glassLabel}>Material:</Text>
                <Text style={styles.glassValue}>Zinga 3mm</Text>
              </View>
              <View style={styles.glassRow}>
                <Text style={styles.glassLabel}>Width:</Text>
                <Text style={styles.glassValue}>{order.glass.width}"</Text>
              </View>
              <View style={styles.glassRow}>
                <Text style={styles.glassLabel}>Height:</Text>
                <Text style={styles.glassValue}>{order.glass.height}"</Text>
              </View>
              <View style={styles.glassRow}>
                <Text style={styles.glassLabel}>Quantity:</Text>
                <Text style={styles.glassValue}>{order.glass.quantity} pieces</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={shareInvoice}>
              <Icon name="share-social" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Share Invoice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.navigate("Dashboard")}
            >
              <Icon name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 50,
    backgroundColor: "#ffb30eff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  invoiceHeader: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  invoiceHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    letterSpacing: 1,
  },
  invoiceId: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  invoiceDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginLeft: 8,
  },
  partyName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  windowType: {
    fontSize: 14,
    color: "#666",
    backgroundColor: "#fff3e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  billingLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  billingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  highlight: {
    backgroundColor: "#fff3cd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: 2,
    backgroundColor: "#ffb30eff",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff3e0",
    padding: 16,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#333",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffb30eff",
  },
  cuttingList: {
    gap: 12,
  },
  cuttingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  cuttingLabel: {
    flex: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  cuttingValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#ffb30eff",
    textAlign: "center",
  },
  cuttingQty: {
    flex: 0.5,
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "right",
  },
  glassDetails: {
    gap: 12,
  },
  glassRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  glassLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  glassValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});