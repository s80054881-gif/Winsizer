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
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../../apiClient";
import SubscriptionBanner from "../../components/SubscriptionBanner"; // ⭐ NEW IMPORT

export default function WindowCalculatorScreen({ navigation, route }: any) {
  const prefilledPartyName = route?.params?.prefilledPartyName || "";
  const prefilledPartyId = route?.params?.partyId || null;
  
  const [partyName, setPartyName] = useState(prefilledPartyName);
  const [partyId, setPartyId] = useState(prefilledPartyId);
  const [parties, setParties] = useState<any[]>([]);
  const [windowType, setWindowType] = useState("regular");
  const [height, setHeight] = useState("");
  const [width, setWidth] = useState("");
  const [tracks, setTracks] = useState("2");
  const [rate, setRate] = useState("");
  
  const [aluminumColor, setAluminumColor] = useState("Black");
  const [glassMaterial, setGlassMaterial] = useState("Zinga 3mm");
  
  const [handlePattiInterlockReduction, setHandlePattiInterlockReduction] = useState("1.5");
  const [bearingReduction, setBearingReduction] = useState("6.5");
  const [glassHeightReduction, setGlassHeightReduction] = useState("4");
  const [glassWidthReduction, setGlassWidthReduction] = useState("0.05");
  
  const [results, setResults] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const response = await apiClient.get("/parties");
        setParties(response.data || []);
      } catch (error) {
        console.error("Error fetching parties:", error);
      }
    };
    fetchParties();
  }, []);

  const roundToHalf = (value: number) => {
    return Math.ceil(value * 2) / 2;
  };

  const calculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(width);
    const t = parseInt(tracks);
    const r = parseFloat(rate);

    if (!h || !w || !r) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const hpIlReduction = parseFloat(handlePattiInterlockReduction) || 1.5;
    const brReduction = parseFloat(bearingReduction) || 6.5;
    const ghReduction = parseFloat(glassHeightReduction) || 4;
    const gwReduction = parseFloat(glassWidthReduction) || 0.05;

    const heightFeet = h / 12;
    const widthFeet = w / 12;
    const heightRounded = roundToHalf(heightFeet);
    const widthRounded = roundToHalf(widthFeet);

    const areaPerWindow = heightRounded * widthRounded;
    const totalArea = areaPerWindow;
    const totalCost = totalArea * r;

    const trackTopHeight = h;
    const trackTopHeightQty = 2;
    
    const trackTopWidth = w;
    const trackTopWidthQty = 1;
    
    const trackBottom = w;
    const trackBottomQty = 1;
    
    const handlePatti = h - hpIlReduction;
    const handlePattiQty = t;
    
    const interlock = h - hpIlReduction;
    const interlockQty = t;
    
    const bearingBottom = (w - brReduction) / t;
    const bearingBottomQty = t * 2;

    const glassHeight = h - ghReduction;
    const glassWidth = bearingBottom + gwReduction;
    const glassQuantity = t * 1;

    setResults({
      billing: {
        actualSize: `${h}" × ${w}"`,
        billingSize: `${heightRounded} ft × ${widthRounded} ft`,
        areaPerWindow: areaPerWindow.toFixed(2),
        totalArea: totalArea.toFixed(2),
        totalCost: totalCost.toFixed(2),
        quantity: 1,
        rate: r,
      },
      aluminum: {
        trackTopHeight: trackTopHeight.toFixed(2),
        trackTopHeightQty: trackTopHeightQty,
        trackTopWidth: trackTopWidth.toFixed(2),
        trackTopWidthQty: trackTopWidthQty,
        trackBottom: trackBottom.toFixed(2),
        trackBottomQty: trackBottomQty,
        handlePatti: handlePatti.toFixed(2),
        handlePattiQty: handlePattiQty,
        interlock: interlock.toFixed(2),
        interlockQty: interlockQty,
        bearingBottom: bearingBottom.toFixed(2),
        bearingBottomQty: bearingBottomQty,
        color: aluminumColor,
      },
      glass: {
        width: glassWidth.toFixed(2),
        height: glassHeight.toFixed(2),
        quantity: glassQuantity,
        material: glassMaterial,
      },
      tracks: t,
      inputData: {
        height: h,
        width: w,
        quantity: 1,
        windowType,
        aluminumColor,
        glassMaterial,
      }
    });
  };

  const saveOrder = async () => {
    if (!results) {
      Alert.alert("Error", "Please calculate first before saving");
      return;
    }

    if (!partyName.trim()) {
      Alert.alert("Error", "Please enter or select a party name");
      return;
    }

    if (!partyId) {
      Alert.alert(
        "Error", 
        "Please select a valid party from the dropdown. Orders must be linked to an existing party."
      );
      return;
    }

    setIsSaving(true);

    try {
      const orderData = {
        partyName: partyName.trim(),
        partyId: partyId,
        windowType,
        height: parseFloat(height),
        width: parseFloat(width),
        quantity: 1,
        tracks: parseInt(tracks),
        rate: parseFloat(rate),
        aluminumColor,
        glassMaterial,
        handlePattiInterlockReduction: parseFloat(handlePattiInterlockReduction),
        bearingReduction: parseFloat(bearingReduction),
        glassHeightReduction: parseFloat(glassHeightReduction),
        glassWidthReduction: parseFloat(glassWidthReduction),
      };

      console.log("📤 Sending order data:", orderData);

      const response = await apiClient.post("/orders", orderData);
      const savedOrder = response.data;

      console.log("✅ Order saved:", savedOrder);

      Alert.alert(
        "Success",
        "Order saved successfully!",
        [
          {
            text: "View Dashboard",
            onPress: () => navigation.navigate("Dashboard"),
          },
          {
            text: "Create New",
            onPress: () => {
              setHeight("");
              setWidth("");
              setRate("");
              setResults(null);
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("❌ Error saving order:", error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || "Failed to save order. Please try again.";
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>🪟 Sliding Window Calculator</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
              <Icon name="home" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <SubscriptionBanner navigation={navigation} />

          <ScrollView 
            style={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.inputSection}>
                <Text style={styles.sectionTitle}>Window Measurements</Text>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Party Name *</Text>
                    {prefilledPartyName ? (
                      <>
                        <TextInput
                          style={[styles.input, styles.inputPrefilled]}
                          value={partyName}
                          editable={false}
                        />
                        <Text style={styles.prefilledHint}>
                          Auto-filled from party selection
                        </Text>
                      </>
                    ) : (
                      <View style={styles.pickerContainer}>
                        <Picker
                          selectedValue={partyId}
                          onValueChange={(value) => {
                            setPartyId(value);
                            const selectedParty = parties.find(p => p.id === value);
                            if (selectedParty) {
                              setPartyName(selectedParty.partyName);
                            }
                          }}
                          style={styles.picker}
                          enabled={!isSaving}
                        >
                          <Picker.Item label="Select Party" value={null} />
                          {parties.map((party) => (
                            <Picker.Item 
                              key={party.id} 
                              label={party.partyName} 
                              value={party.id} 
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Window Type</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={windowType}
                        onValueChange={(value) => setWindowType(value)}
                        style={styles.picker}
                        enabled={!isSaving}
                      >
                        <Picker.Item label="Regular Window" value="regular" />
                        <Picker.Item label="18 x 50 Window" value="18x50" />
                      </Picker>
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Height (inches) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 38"
                      placeholderTextColor="#999"
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="decimal-pad"
                      editable={!isSaving}
                    />
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Width (inches) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 47"
                      placeholderTextColor="#999"
                      value={width}
                      onChangeText={setWidth}
                      keyboardType="decimal-pad"
                      editable={!isSaving}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Number of Tracks *</Text>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={tracks}
                        onValueChange={(value) => setTracks(value)}
                        style={styles.picker}
                        enabled={!isSaving}
                      >
                        <Picker.Item label="2 Track" value="2" />
                        <Picker.Item label="3 Track" value="3" />
                        <Picker.Item label="4 Track" value="4" />
                      </Picker>
                    </View>
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Rate per Sq. Ft (₹) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., 350"
                      placeholderTextColor="#999"
                      value={rate}
                      onChangeText={setRate}
                      keyboardType="decimal-pad"
                      editable={!isSaving}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Aluminum Color *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Black"
                      placeholderTextColor="#999"
                      value={aluminumColor}
                      onChangeText={setAluminumColor}
                      editable={!isSaving}
                    />
                  </View>

                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Glass Material *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., Zinga 3mm"
                      placeholderTextColor="#999"
                      value={glassMaterial}
                      onChangeText={setGlassMaterial}
                      editable={!isSaving}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.advancedToggle}
                  onPress={() => setShowAdvanced(!showAdvanced)}
                >
                  <Icon
                    name={showAdvanced ? "settings" : "settings-outline"}
                    size={20}
                    color="#ffb30eff"
                  />
                  <Text style={styles.advancedToggleText}>
                    {showAdvanced ? "Hide" : "Show"} Advanced Settings
                  </Text>
                  <Icon
                    name={showAdvanced ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#ffb30eff"
                  />
                </TouchableOpacity>

                {showAdvanced && (
                  <View style={styles.advancedSection}>
                    <Text style={styles.advancedTitle}>Reduction Values</Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Handle Patti/Interlock Reduction</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="1.5"
                        placeholderTextColor="#999"
                        value={handlePattiInterlockReduction}
                        onChangeText={setHandlePattiInterlockReduction}
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Bearing Reduction</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="6.5"
                          placeholderTextColor="#999"
                          value={bearingReduction}
                          onChangeText={setBearingReduction}
                          keyboardType="decimal-pad"
                        />
                      </View>

                      <View style={[styles.inputContainer, styles.halfWidth]}>
                        <Text style={styles.label}>Glass Height Reduction</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="4"
                          placeholderTextColor="#999"
                          value={glassHeightReduction}
                          onChangeText={setGlassHeightReduction}
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Glass Width Addition</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="0.05"
                        placeholderTextColor="#999"
                        value={glassWidthReduction}
                        onChangeText={setGlassWidthReduction}
                        keyboardType="decimal-pad"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={() => {
                        setHandlePattiInterlockReduction("1.5");
                        setBearingReduction("6.5");
                        setGlassHeightReduction("4");
                        setGlassWidthReduction("0.05");
                      }}
                    >
                      <Icon name="refresh" size={16} color="#ffb30eff" />
                      <Text style={styles.resetButtonText}>Reset to Defaults</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
                  <Icon name="calculator" size={20} color="#fff" />
                  <Text style={styles.calculateButtonText}>Calculate</Text>
                </TouchableOpacity>
              </View>

              {results && (
                <View style={styles.resultsSection}>
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={saveOrder}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <ActivityIndicator size="small" color="#fff" />
                        <Text style={styles.saveButtonText}>Saving...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="save" size={20} color="#fff" />
                        <Text style={styles.saveButtonText}>Save Order</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
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
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#fff" },
  scrollContent: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  inputSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#333", marginBottom: 20 },
  row: { flexDirection: "row", gap: 12 },
  inputContainer: { marginBottom: 16 },
  halfWidth: { flex: 1 },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#333",
  },
  inputPrefilled: { backgroundColor: "#e8f5e9", borderColor: "#4caf50" },
  prefilledHint: { fontSize: 11, color: "#4caf50", marginTop: 4, fontStyle: "italic" },
  pickerContainer: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: { height: 50 },
  advancedToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#fff3e0",
    borderRadius: 10,
    marginVertical: 10,
  },
  advancedToggleText: { fontSize: 14, fontWeight: "600", color: "#ffb30eff" },
  advancedSection: {
    backgroundColor: "#fff3e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ffb30eff",
  },
  advancedTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffb30eff",
    marginTop: 8,
  },
  resetButtonText: { fontSize: 13, fontWeight: "600", color: "#ffb30eff" },
  calculateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffb30eff",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    shadowColor: "#ffb30eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calculateButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  resultsSection: { gap: 16 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: { backgroundColor: "#9ca3af" },
  saveButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});