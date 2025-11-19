import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../../apiClient";

interface PartyFormData {
  partyName: string;
  contactNumber: string;
  partyType: string;
  gstNumber: string;
  panNumber: string;
  billingAddress: string;
  city: string;
  state: string;
}

export default function EditPartyScreen({ route, navigation }: any) {
  const { partyId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PartyFormData>({
    partyName: "",
    contactNumber: "",
    partyType: "Customer",
    gstNumber: "",
    panNumber: "",
    billingAddress: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    fetchPartyDetails();
  }, []);

  const fetchPartyDetails = async () => {
    try {
      const response = await apiClient.get(`/parties/${partyId}`);
      const party = response.data;
      
      setFormData({
        partyName: party.partyName || "",
        contactNumber: party.contactNumber || "",
        partyType: party.partyType || "Customer",
        gstNumber: party.gstNumber || "",
        panNumber: party.panNumber || "",
        billingAddress: party.billingAddress || "",
        city: party.city || "",
        state: party.state || "",
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching party details:", error);
      Alert.alert("Error", "Failed to load party details");
      navigation.goBack();
    }
  };

  const handleInputChange = (field: keyof PartyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.partyName.trim()) {
      Alert.alert("Validation Error", "Party name is required");
      return false;
    }
    if (!formData.contactNumber.trim()) {
      Alert.alert("Validation Error", "Contact number is required");
      return false;
    }
    if (formData.contactNumber.length < 10) {
      Alert.alert("Validation Error", "Contact number must be at least 10 digits");
      return false;
    }
    return true;
  };

  const handleUpdateParty = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await apiClient.put(`/parties/${partyId}`, formData);
      
      Alert.alert("Success", "Party updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.error("Error updating party:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update party"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffa200ff" />
        <Text style={styles.loadingText}>Loading party details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Party</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView 
            style={styles.content} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Party Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Party Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter party name"
                placeholderTextColor="#999"
                value={formData.partyName}
                onChangeText={(text) => handleInputChange("partyName", text)}
                returnKeyType="next"
              />
            </View>

            {/* Contact Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Contact Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter contact number"
                placeholderTextColor="#999"
                value={formData.contactNumber}
                onChangeText={(text) => handleInputChange("contactNumber", text)}
                keyboardType="phone-pad"
                maxLength={15}
                returnKeyType="next"
              />
            </View>

            {/* Party Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Party Type</Text>
              <View style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.partyType === "Customer" && styles.typeButtonActive,
                  ]}
                  onPress={() => handleInputChange("partyType", "Customer")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.partyType === "Customer" && styles.typeButtonTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    formData.partyType === "Supplier" && styles.typeButtonActive,
                  ]}
                  onPress={() => handleInputChange("partyType", "Supplier")}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.partyType === "Supplier" && styles.typeButtonTextActive,
                    ]}
                  >
                    Supplier
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* GST Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>GST Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter GST number (optional)"
                placeholderTextColor="#999"
                value={formData.gstNumber}
                onChangeText={(text) => handleInputChange("gstNumber", text.toUpperCase())}
                maxLength={15}
                returnKeyType="next"
              />
            </View>

            {/* PAN Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PAN Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter PAN number (optional)"
                placeholderTextColor="#999"
                value={formData.panNumber}
                onChangeText={(text) => handleInputChange("panNumber", text.toUpperCase())}
                maxLength={10}
                returnKeyType="next"
              />
            </View>

            {/* Billing Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Billing Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter billing address"
                placeholderTextColor="#999"
                value={formData.billingAddress}
                onChangeText={(text) => handleInputChange("billingAddress", text)}
                multiline
                numberOfLines={3}
                returnKeyType="next"
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter city"
                placeholderTextColor="#999"
                value={formData.city}
                onChangeText={(text) => handleInputChange("city", text)}
                returnKeyType="next"
              />
            </View>

            {/* State */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter state"
                placeholderTextColor="#999"
                value={formData.state}
                onChangeText={(text) => handleInputChange("state", text)}
                returnKeyType="done"
                onSubmitEditing={handleUpdateParty}
              />
            </View>

            {/* Update Button */}
            <TouchableOpacity
              style={[styles.updateButton, saving && styles.updateButtonDisabled]}
              onPress={handleUpdateParty}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Update Party</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  required: {
    color: "#ff4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: "#ffa200ff",
    borderColor: "#ffa200ff",
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  typeButtonTextActive: {
    color: "#fff",
  },
  updateButton: {
    flexDirection: "row",
    backgroundColor: "#ffa200ff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  updateButtonDisabled: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});