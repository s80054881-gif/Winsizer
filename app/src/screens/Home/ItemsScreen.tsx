import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ITEMS_DATA = [
  {
    id: "1",
    name: "Aluminium",
    icon: "albums",
    color: "#94a3b8",
    bgColor: "#f1f5f9",
    description: "Premium quality aluminium products",
    count: 45,
  },
  {
    id: "2",
    name: "PVC",
    icon: "square",
    color: "#06b6d4",
    bgColor: "#ecfeff",
    description: "Durable PVC materials",
    count: 32,
  },
  {
    id: "3",
    name: "Glass",
    icon: "diamond",
    color: "#8b5cf6",
    bgColor: "#f5f3ff",
    description: "High quality glass products",
    count: 28,
  },
  {
    id: "4",
    name: "UPVC",
    icon: "grid",
    color: "#10b981",
    bgColor: "#d1fae5",
    description: "Weather resistant UPVC",
    count: 38,
  },
];

export default function ItemsScreen({ navigation }: any) {
  const renderItemCard = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.7}>
      <View style={[styles.itemIconContainer, { backgroundColor: item.bgColor }]}>
        <Icon name={item.icon} size={48} color={item.color} />
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <View style={styles.itemFooter}>
          <View style={styles.countBadge}>
            <Icon name="cube-outline" size={14} color="#666" />
            <Text style={styles.countText}>{item.count} products</Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#888" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Items</Text>
        <TouchableOpacity>
          <Icon name="add-circle" size={24} color="#ffa200ff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Material Categories</Text>
          <Text style={styles.sectionSubtitle}>
            Browse our collection of materials
          </Text>

          <View style={styles.itemsGrid}>
            {ITEMS_DATA.map((item) => renderItemCard(item))}
          </View>

          {/* Statistics Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Quick Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Icon name="cube" size={24} color="#ffa200ff" />
                <Text style={styles.statValue}>143</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="pricetag" size={24} color="#10b981" />
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Icon name="trending-up" size={24} color="#3b82f6" />
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>New This Week</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Icon name="home-outline" size={24} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Party")}
        >
          <Icon name="people-outline" size={24} color="#888" />
          <Text style={styles.navText}>Party</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="cube" size={24} color="#ffa200ff" />
          <Text style={[styles.navText, styles.navTextActive]}>Item</Text>
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
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  itemsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  statsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#e0e0e0",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
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