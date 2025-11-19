import React, { useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import apiClient from "../../apiClient";

export default function AddPartyScreen({ navigation }: any) {
  const [partyName, setPartyName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [partyType, setPartyType] = useState("Customer");
  const [gstNo, setGstNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!partyName.trim() || !contactNo.trim()) {
      Alert.alert("Missing Fields", "Party name and contact number are required.");
      return;
    }

    // Validate contact number (10 digits)
    if (contactNo.length !== 10) {
      Alert.alert("Invalid Contact", "Contact number must be 10 digits.");
      return;
    }

    const partyData = {
      partyName: partyName.trim(),
      contactNumber: contactNo.trim(),
      partyType,
      gstNumber: gstNo.trim(),
      panNumber: panNo.trim(),
      billingAddress: billingAddress.trim(),
      city: city.trim(),
      state: state.trim(),
    };

    setLoading(true);

    try {
      const response = await apiClient.post("/parties", partyData);
      
      console.log("✅ Party Created:", response.data);
      
      Alert.alert(
        "Success",
        "Party added successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Error creating party:", error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Failed to add party. Please try again.";
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                <Icon name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Add Party</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Form */}
            <ScrollView
              contentContainerStyle={styles.formContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Party Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Party Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter party name"
                  value={partyName}
                  onChangeText={setPartyName}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* Contact Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter contact number"
                  keyboardType="phone-pad"
                  value={contactNo}
                  onChangeText={setContactNo}
                  maxLength={10}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* Party Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Party Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={partyType}
                    onValueChange={(value) => setPartyType(value)}
                    enabled={!loading}
                  >
                    <Picker.Item label="Customer" value="Customer" />
                    <Picker.Item label="Supplier" value="Supplier" />
                  </Picker>
                </View>
              </View>

              {/* GST No */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>GST No</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter GST number"
                  value={gstNo}
                  onChangeText={setGstNo}
                  autoCapitalize="characters"
                  maxLength={15}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* PAN No */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PAN No</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter PAN number"
                  value={panNo}
                  onChangeText={setPanNo}
                  autoCapitalize="characters"
                  maxLength={10}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* Billing Address */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Billing Address</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: "top" }]}
                  placeholder="Enter full billing address"
                  value={billingAddress}
                  onChangeText={setBillingAddress}
                  multiline
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* City */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>City</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter city name"
                  value={city}
                  onChangeText={setCity}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              {/* State */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter state name"
                  value={state}
                  onChangeText={setState}
                  editable={!loading}
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                />
              </View>

              {/* Save Button */}
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="save-outline" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Party</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#fbfaf9ff",
    paddingTop: 25,
  },
  container: {
    flex: 1,
    backgroundColor: "#fbfaf9ff",
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
    color: "#e97807ff",
  },
  formContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#4d4949ff",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffa200ff",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});