import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../../apiClient";

interface Party {
  id: number;
  partyName: string;
  contactNumber: string;
  partyType: string;
  gstNumber?: string;
  panNumber?: string;
  billingAddress?: string;
  city?: string;
  state?: string;
}

export default function PartyScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState("");
  const [parties, setParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get card color based on index
  const getCardColor = (index: number) => {
    const colors = ['#ff6b35', '#00d4aa', '#9e9e9e', '#ffa200ff', '#6366f1'];
    return colors[index % colors.length];
  };

  // Fetch parties from API
  const fetchParties = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    
    try {
      const response = await apiClient.get("/parties");
      const partiesData = response.data;
      
      setParties(partiesData);
      setFilteredParties(partiesData);
      console.log("✅ Parties fetched:", partiesData.length);
    } catch (error: any) {
      console.error("❌ Error fetching parties:", error);
      
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load parties"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load parties on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchParties();
    }, [])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchParties(false);
  };

  // Handle search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter(
        (party) =>
          party.partyName.toLowerCase().includes(text.toLowerCase()) ||
          party.contactNumber.includes(text) ||
          party.billingAddress?.toLowerCase().includes(text.toLowerCase()) ||
          party.city?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredParties(filtered);
    }
  };

  // Handle delete party
  const handleDeleteParty = (id: number, name: string) => {
    Alert.alert(
      "Delete Party",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/parties/${id}`);
              
              // Remove from local state
              setParties(prev => prev.filter(p => p.id !== id));
              setFilteredParties(prev => prev.filter(p => p.id !== id));
              
              Alert.alert("Success", "Party deleted successfully");
            } catch (error: any) {
              console.error("❌ Error deleting party:", error);
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete party"
              );
            }
          },
        },
      ]
    );
  };

  // Render party card
  const renderPartyCard = ({ item, index }: { item: Party; index: number }) => {
    const address = [item.billingAddress, item.city, item.state]
      .filter(Boolean)
      .join(", ") || "No address available";
    
    const borderColor = getCardColor(index);

    return (
      <TouchableOpacity 
        style={[styles.partyCard, { borderLeftColor: borderColor }]} 
        activeOpacity={0.7}
        onPress={() => navigation.navigate("PartyDetails", { partyId: item.id })}
      >
        <View style={styles.partyHeader}>
          <View style={[styles.partyIcon, { backgroundColor: borderColor + '1a' }]}>
            <Icon name="business" size={24} color={borderColor} />
          </View>
          <View style={styles.partyInfo}>
            <Text style={styles.partyName}>{item.partyName}</Text>
            <Text style={styles.partyType}>{item.partyType}</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#999" />
        </View>

        <View style={styles.partyDetails}>
          <View style={styles.detailRow}>
            <Icon name="location" size={16} color="#666" />
            <Text style={styles.detailText}>{address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="call" size={16} color="#666" />
            <Text style={styles.detailText}>{item.contactNumber}</Text>
          </View>
          {item.gstNumber && (
            <View style={styles.detailRow}>
              <Icon name="document-text" size={16} color="#666" />
              <Text style={styles.detailText}>GST: {item.gstNumber}</Text>
            </View>
          )}
        </View>

        <View style={styles.partyActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: borderColor, backgroundColor: borderColor + '10' }]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("Calulator", { 
                prefilledPartyName: item.partyName,
                partyId: item.id
              });
            }}
          >
            <Icon name="add-circle-outline" size={20} color={borderColor} />
            <Text style={[styles.actionButtonText, { color: borderColor }]}>Add Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: borderColor }]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate("EditParty", { partyId: item.id });
            }}
          >
            <Icon name="create-outline" size={18} color={borderColor} />
            <Text style={[styles.actionButtonText, { color: borderColor }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { borderColor: '#ff4444' }]}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteParty(item.id, item.partyName);
            }}
          >
            <Icon name="trash-outline" size={18} color="#ff4444" />
            <Text style={[styles.actionButtonText, { color: "#ff4444" }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Party</Text>
        <TouchableOpacity onPress={() => navigation.navigate("AddParty")}>
          <Icon name="add-circle" size={24} color="#ffa200ff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, or address..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Icon name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffa200ff" />
          <Text style={styles.loadingText}>Loading parties...</Text>
        </View>
      ) : (
        /* Party List */
        <FlatList
          data={filteredParties}
          renderItem={renderPartyCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#ffa200ff"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchQuery ? "No parties found" : "No parties yet"}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate("AddParty")}
                >
                  <Text style={styles.addButtonText}>Add Your First Party</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Icon name="home-outline" size={24} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="people" size={24} color="#ffa200ff" />
          <Text style={[styles.navText, styles.navTextActive]}>Party</Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  partyCard: {
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
  partyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  partyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  partyType: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
  },
  partyDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  partyActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffa200ff",
    gap: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#ffa200ff",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
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