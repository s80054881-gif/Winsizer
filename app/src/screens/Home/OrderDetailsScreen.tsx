import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Linking,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import apiClient from "../../apiClient";
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

interface OrderDetails {
  id: number;
  partyName: string;
  windowType: string;
  height: number;
  width: number;
  quantity: number;
  tracks: number;
  rate: number;
  aluminumColor: string;
  glassMaterial: string;
  areaPerWindow: number;
  totalArea: number;
  totalCost: number;
  trackTopHeight: number;
  trackTopWidth: number;
  trackBottom: number;
  handlePatti: number;
  interlock: number;
  bearingBottom: number;
  glassWidth: number;
  glassHeight: number;
  glassQuantity: number;
  createdAt?: string;
}

export default function OrderDetailsScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [generatingCutting, setGeneratingCutting] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      setOrder(response.data);
      console.log("✅ Order details loaded:", response.data);
    } catch (error: any) {
      console.error("❌ Error fetching order:", error);
      Alert.alert("Error", "Failed to load order details", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString("en-IN");
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        if (Platform.Version >= 33) {
          console.log("Android 13+: No permission needed");
          return true;
        }
        
        const checkPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        
        if (checkPermission) {
          return true;
        }
        
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission",
            message: "CutSizer needs access to save PDF invoices to your device",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn("Permission error:", err);
        return false;
      }
    }
    return true;
  };

  const generateInvoiceHTML = () => {
    if (!order) return "";

    const heightFeet = order.height / 12;
    const widthFeet = order.width / 12;
    const heightRounded = Math.ceil(heightFeet * 2) / 2;
    const widthRounded = Math.ceil(widthFeet * 2) / 2;

    // Calculate GST breakdown - GST is ADDED to the order cost
    const subtotal = order.totalCost; // Base amount without GST
    const igst = subtotal * 0.09; // 9% IGST
    const cgst = subtotal * 0.09; // 9% CGST
    const totalGST = igst + cgst; // Total 18% GST
    const deliveryCharges = 100;
    const totalWithGST = subtotal + totalGST + deliveryCharges;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tax Invoice - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: Arial, sans-serif; 
            padding: 20px;
            font-size: 13px;
            line-height: 1.6;
            background: white;
          }
          .invoice-container {
            border: 3px solid #000;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
          }
          .header {
            display: grid;
            grid-template-columns: 2fr 1fr;
            border-bottom: 3px solid #000;
          }
          .header-left {
            padding: 20px;
            border-right: 3px solid #000;
          }
          .header-right {
            padding: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .company-info {
            font-size: 12px;
            line-height: 1.8;
          }
          .invoice-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 15px;
          }
          .invoice-meta {
            font-size: 13px;
            text-align: center;
            line-height: 1.8;
          }
          .party-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-bottom: 3px solid #000;
          }
          .party-box {
            padding: 20px;
          }
          .party-box:first-child {
            border-right: 3px solid #000;
          }
          .party-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
          }
          .party-name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .party-info {
            font-size: 12px;
            line-height: 1.8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 2px solid #000;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
            text-align: center;
            font-size: 13px;
          }
          .text-right { text-align: right !important; }
          .text-center { text-align: center !important; }
          .item-description {
            line-height: 1.6;
            font-size: 12px;
          }
          .subtotal-row td {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .bottom-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            border-top: 3px solid #000;
          }
          .notes-box {
            padding: 20px;
            border-right: 3px solid #000;
          }
          .amount-box {
            padding: 20px;
          }
          .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .notes-content {
            font-size: 12px;
            line-height: 1.8;
            margin-bottom: 20px;
          }
          .amount-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px solid #e0e0e0;
          }
          .amount-line.total {
            font-weight: bold;
            font-size: 15px;
            border-top: 3px solid #000;
            border-bottom: 3px solid #000;
            padding: 12px 0;
            margin: 10px 0;
          }
          .amount-line.received {
            font-weight: bold;
            font-size: 14px;
          }
          .amount-words-section {
            border-top: 3px solid #000;
            padding: 20px;
          }
          .amount-words {
            font-size: 13px;
            line-height: 1.8;
          }
          .amount-words strong {
            display: block;
            margin-bottom: 5px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="header-left">
              <div class="company-name">Winsizer Tech</div>
              <div class="company-info">
                MALHAR PARK, NARHE PUNE - Pune<br/>
                411041 CONTACT NO. 9146101005<br/>
                GSTN/UIN - 27CSSPR6836K1ZQ
              </div>
            </div>
            <div class="header-right">
              <div class="invoice-title">TAX<br/>INVOICE</div>
              <div class="invoice-meta">
                Invoice No. ${order.id}<br/>
                Invoice Date<br/>
                ${formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          <!-- Bill To / Ship To -->
          <div class="party-section">
            <div class="party-box">
              <div class="party-title">BILL TO</div>
              <div class="party-name">${order.partyName}</div>
              <div class="party-info">
                S.N.3/6, BUILDING-01,<br/>
                FLAT NO.403, MARIGOLD<br/>
                CHAKAN ROAD OPP.<br/>
                KEZHARNAG PUNE CITY,<br/>
                Khradi<br/>
                Pune, Pune, Maharashtra,<br/>
                411014<br/>
                GSTN/UIN -<br/>
                27AEXFS3177F1ZD
              </div>
            </div>
            <div class="party-box">
              <div class="party-title">SHIP TO</div>
              <div class="party-name">${order.partyName}</div>
              <div class="party-info">
                S.N.3/6, BUILDING-01,<br/>
                FLAT NO.403, MARIGOLD<br/>
                CHAKAN ROAD OPP.<br/>
                KEZHARNAG PUNE CITY,<br/>
                Khradi<br/>
                Pune, Pune, Maharashtra,<br/>
                411014<br/>
                GSTN/UIN -<br/>
                27AEXFS3177F1ZD
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 50px;">S.NO</th>
                <th style="width: 35%;">ITEMS</th>
                <th style="width: 80px;">SIZE</th>
                <th style="width: 60px;">HSN</th>
                <th style="width: 50px;">QTY</th>
                <th style="width: 80px;">RATE</th>
                <th style="width: 70px;">UNIT</th>
                <th style="width: 50px;">GST</th>
                <th style="width: 100px;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center">1</td>
                <td>
                  <div class="item-description">
                    WINDOW (${order.windowType})<br/>
                    ${order.tracks} TRACK, ${order.aluminumColor.toUpperCase()}<br/>
                    ${order.glassMaterial.toUpperCase()}<br/>
                    ${order.aluminumColor.toUpperCase()} POWDER COATING<br/>
                    PREMIUM HARDWARE<br/>
                    SECTION 18X50
                  </div>
                </td>
                <td class="text-center">${order.quantity} ×<br/>${heightRounded}'<br/>× ${widthRounded}'</td>
                <td class="text-center">1234</td>
                <td class="text-center">${order.quantity}</td>
                <td class="text-right">${order.rate.toFixed(2)}</td>
                <td class="text-center">sqfeet</td>
                <td class="text-center">18%</td>
                <td class="text-right">${formatCurrency(order.totalCost)}</td>
              </tr>
              <tr class="subtotal-row">
                <td colspan="8" class="text-right">SUBTOTAL</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Notes and Amount Section -->
          <div class="bottom-section">
            <div class="notes-box">
              <div class="section-title">Notes</div>
              <div class="notes-content">
                no return policy
              </div>
              
              <div class="section-title">Terms and Conditions</div>
              <div class="notes-content">
                1. Goods once sold cannot<br/>
                be taken or exchanged<br/>
                2. All disputes are subject to<br/>
                [ENTER YOUR CITY NAME]<br/>
                jurisdiction only
              </div>
            </div>
            
            <div class="amount-box">
              <div class="amount-line">
                <span>Delivery Charges</span>
                <span>${formatCurrency(deliveryCharges)}</span>
              </div>
              <div class="amount-line">
                <span>TOTAL AMOUNT</span>
                <span>${formatCurrency(subtotal + deliveryCharges)}</span>
              </div>
              <div class="amount-line">
                <span>IGST @ 9%</span>
                <span>${formatCurrency(igst)}</span>
              </div>
              <div class="amount-line">
                <span>CGST @9%</span>
                <span>${formatCurrency(cgst)}</span>
              </div>
              <div class="amount-line total">
                <span>TOTAL AMOUNT</span>
                <span>${formatCurrency(totalWithGST)}</span>
              </div>
              <div class="amount-line received">
                <span>Received Amount</span>
                <span>${formatCurrency(totalWithGST)}</span>
              </div>
              <div class="amount-line">
                <span>Balance</span>
                <span>₹ 0</span>
              </div>
            </div>
          </div>

          <!-- Amount in Words -->
          <div class="amount-words-section">
            <div class="amount-words">
              <strong>Total Amount (in words):</strong>
              ${numberToWords(Math.round(totalWithGST))} Rupees
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateCuttingListHTML = () => {
    if (!order) return "";

    // Calculate standard quantities
    const trackTopHeightQty = 2;
    const trackTopWidthQty = 1;
    const trackBottomQty = 1;
    const handlePattiQty = order.tracks;
    const interlockQty = order.tracks;
    const bearingBottomQty = order.tracks * 2;


    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cutting List - Order #${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #ffa200;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 32px;
            font-weight: bold;
            color: #ffa200;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 24px;
            color: #555;
            margin-top: 10px;
          }
          .order-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
          }
          .info-value {
            font-size: 16px;
            color: #333;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #ffa200;
            margin: 25px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #ffa200;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e0e0e0;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .text-center { text-align: center; }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #888;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">CUTSIZER</div>
          <div class="document-title">CUTTING LIST</div>
        </div>

        <div class="order-info">
          <div>
            <div class="info-item">
              <span class="info-label">Order ID:</span>
              <span class="info-value"> #${order.id}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Party Name:</span>
              <span class="info-value"> ${order.partyName}</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="info-item">
              <span class="info-label">Date:</span>
              <span class="info-value"> ${formatDate(order.createdAt)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Window Type:</span>
              <span class="info-value"> ${order.windowType}</span>
            </div>
          </div>
        </div>

        <div class="section-title">🔧 Aluminum Cutting List</div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th class="text-center">Size (inches)</th>
              <th class="text-center">Quantity</th>
              <th class="text-center">Color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Track Top Height</td>
              <td class="text-center">${order.trackTopHeight.toFixed(2)}"</td>
              <td class="text-center">${trackTopHeightQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
            <tr>
              <td>Track Top Width</td>
              <td class="text-center">${order.trackTopWidth.toFixed(2)}"</td>
              <td class="text-center">${trackTopWidthQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
            <tr>
              <td>Track Bottom</td>
              <td class="text-center">${order.trackBottom.toFixed(2)}"</td>
              <td class="text-center">${trackBottomQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
            <tr>
              <td>Handle Patti</td>
              <td class="text-center">${order.handlePatti.toFixed(2)}"</td>
              <td class="text-center">${handlePattiQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
            <tr>
              <td>Interlock</td>
              <td class="text-center">${order.interlock.toFixed(2)}"</td>
              <td class="text-center">${interlockQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
            <tr>
              <td>Bearing Bottom</td>
              <td class="text-center">${order.bearingBottom.toFixed(2)}"</td>
              <td class="text-center">${bearingBottomQty}</td>
              <td class="text-center">${order.aluminumColor}</td>
            </tr>
          </tbody>
        </table>

        <div class="section-title">🪟 Glass Cutting List</div>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th class="text-center">Width (inches)</th>
              <th class="text-center">Height (inches)</th>
              <th class="text-center">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.glassMaterial}</td>
              <td class="text-center">${order.glassWidth.toFixed(2)}"</td>
              <td class="text-center">${order.glassHeight.toFixed(2)}"</td>
              <td class="text-center">${order.glassQuantity}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Generated by CutSizer - Window Calculator App</p>
        </div>
      </body>
      </html>
    `;
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');

    return num.toString();
  };

  const generatePDF = async (type: 'invoice' | 'cutting') => {
    if (!order) return;

    try {
      if (type === 'invoice') {
        setGeneratingInvoice(true);
      } else {
        setGeneratingCutting(true);
      }

      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Storage permission is needed to save files",
          [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            {
              text: "Cancel",
              style: "cancel",
            },
          ]
        );
        return;
      }

      const fileName = type === 'invoice' 
        ? `Invoice_${order.id}_${order.partyName.replace(/\s+/g, '_')}.html`
        : `CuttingList_${order.id}_${order.partyName.replace(/\s+/g, '_')}.html`;

      const downloadPath = Platform.OS === 'android' 
        ? `${RNFS.DownloadDirectoryPath}/${fileName}`
        : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const htmlContent = type === 'invoice' 
        ? generateInvoiceHTML() 
        : generateCuttingListHTML();

      await RNFS.writeFile(downloadPath, htmlContent, 'utf8');

      console.log(`✅ ${type} saved to:`, downloadPath);

      Alert.alert(
        `${type === 'invoice' ? 'Invoice' : 'Cutting List'} Generated! 🎉`,
        Platform.OS === 'android'
          ? `Saved to Downloads folder as:\n${fileName}\n\nOpen in Chrome and use Print → Save as PDF`
          : `Saved to Documents folder as:\n${fileName}`,
        [
          {
            text: "Share/Open",
            onPress: async () => {
              try {
                await Share.open({
                  url: `file://${downloadPath}`,
                  type: 'text/html',
                  title: `${type === 'invoice' ? 'Invoice' : 'Cutting List'} - Order #${order.id}`,
                });
              } catch (error: any) {
                if (error.message !== 'User did not share') {
                  console.error("Share error:", error);
                }
              }
            },
          },
          {
            text: "OK",
            style: "default",
          },
        ]
      );

    } catch (error: any) {
      console.error(`❌ Error generating ${type}:`, error);
      Alert.alert(
        "Error",
        `Failed to generate ${type}: ${error.message || 'Unknown error'}`,
        [{ text: "OK" }]
      );
    } finally {
      if (type === 'invoice') {
        setGeneratingInvoice(false);
      } else {
        setGeneratingCutting(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffa200ff" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={64} color="#ff4444" />
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const heightFeet = order.height / 12;
  const widthFeet = order.width / 12;
  const heightRounded = Math.ceil(heightFeet * 2) / 2;
  const widthRounded = Math.ceil(widthFeet * 2) / 2;

  // Calculate standard quantities
  const trackTopHeightQty = 2;
  const trackTopWidthQty = 1;
  const trackBottomQty = 1;
  const handlePattiQty = order.tracks;
  const interlockQty = order.tracks;
  const bearingBottomQty = order.tracks * 2;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Order Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>📋 Order Information</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID:</Text>
              <Text style={styles.infoValue}>#{order.id}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Party Name:</Text>
              <Text style={styles.infoValue}>{order.partyName}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Window Type:</Text>
              <Text style={styles.infoValue}>{order.windowType}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quantity:</Text>
              <Text style={styles.infoValue}>{order.quantity} window(s)</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tracks:</Text>
              <Text style={styles.infoValue}>{order.tracks} track</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Aluminum Color:</Text>
              <Text style={styles.infoValue}>{order.aluminumColor}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Glass Material:</Text>
              <Text style={styles.infoValue}>{order.glassMaterial}</Text>
            </View>
            
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
            </View>
          </View>

          {/* Billing Calculation Card */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>💰 Billing Calculation</Text>
            
            {/* Step 1: Actual Measurements */}
            <View style={styles.calculationSection}>
              <Text style={styles.calculationStep}>Step 1: Actual Measurements</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Height:</Text>
                <Text style={styles.resultValue}>{order.height}" ({heightFeet.toFixed(2)} ft)</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Width:</Text>
                <Text style={styles.resultValue}>{order.width}" ({widthFeet.toFixed(2)} ft)</Text>
              </View>
            </View>

            {/* Step 2: Rounded for Billing */}
            <View style={styles.calculationSection}>
              <Text style={styles.calculationStep}>Step 2: Rounded for Billing (to nearest 0.5 ft)</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rounded Height:</Text>
                <Text style={[styles.resultValue, styles.highlight]}>{heightRounded} ft</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rounded Width:</Text>
                <Text style={[styles.resultValue, styles.highlight]}>{widthRounded} ft</Text>
              </View>
            </View>

            {/* Step 3: Area Calculation */}
            <View style={styles.calculationSection}>
              <Text style={styles.calculationStep}>Step 3: Area Calculation</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Per Window:</Text>
                <Text style={styles.resultValue}>
                  {heightRounded} × {widthRounded} = {order.areaPerWindow.toFixed(2)} sq. ft
                </Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Area:</Text>
                <Text style={[styles.resultValue, styles.highlight]}>
                  {order.areaPerWindow.toFixed(2)} × {order.quantity} = {order.totalArea.toFixed(2)} sq. ft
                </Text>
              </View>
            </View>

            {/* Step 4: Cost Calculation */}
            <View style={styles.calculationSection}>
              <Text style={styles.calculationStep}>Step 4: Cost Calculation</Text>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rate per sq. ft:</Text>
                <Text style={styles.resultValue}>{formatCurrency(order.rate)}</Text>
              </View>
              <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.resultLabel}>Calculation:</Text>
                <Text style={styles.resultValue}>
                  {order.totalArea.toFixed(2)} sq. ft × {formatCurrency(order.rate)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Cost:</Text>
              <Text style={styles.totalValue}>{formatCurrency(order.totalCost)}</Text>
            </View>
          </View>

          {/* Aluminum Cutting List */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>🔧 Aluminum Cutting List</Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Material</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Size (in)</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Qty</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Color</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Track Top Height</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.trackTopHeight.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{trackTopHeightQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Track Top Width</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.trackTopWidth.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{trackTopWidthQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Track Bottom</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.trackBottom.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{trackBottomQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Handle Patti</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.handlePatti.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{handlePattiQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Interlock</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.interlock.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{interlockQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>

              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Bearing Bottom</Text>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>
                  {order.bearingBottom.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{bearingBottomQty}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.aluminumColor}</Text>
              </View>
            </View>
          </View>

          {/* Glass Cutting List */}
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>🪟 Glass Cutting List</Text>

            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Material</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Width (in)</Text>
                <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Height (in)</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Quantity</Text>
              </View>

              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.glassMaterial}</Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                  {order.glassWidth.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>
                  {order.glassHeight.toFixed(2)}"
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{order.glassQuantity}</Text>
              </View>
            </View>
          </View>

          {/* Two Separate PDF Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.pdfButton, styles.invoiceButton, generatingInvoice && styles.pdfButtonDisabled]}
              onPress={() => generatePDF('invoice')}
              disabled={generatingInvoice}
            >
              {generatingInvoice ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.pdfButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Icon name="receipt" size={20} color="#fff" />
                  <Text style={styles.pdfButtonText}>Generate Invoice</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pdfButton, styles.cuttingButton, generatingCutting && styles.pdfButtonDisabled]}
              onPress={() => generatePDF('cutting')}
              disabled={generatingCutting}
            >
              {generatingCutting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.pdfButtonText}>Generating...</Text>
                </>
              ) : (
                <>
                  <Icon name="cut" size={20} color="#fff" />
                  <Text style={styles.pdfButtonText}>Generate Cutting List</Text>
                </>
              )}
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
    backgroundColor: "#ffa200ff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#ffa200ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffa200ff",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e9ecef",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  resultCard: {
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
  resultCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffa200ff",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e9ecef",
  },
  calculationSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  calculationStep: {
    fontSize: 14,
    fontWeight: "700",
    color: "#495057",
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
  },
  resultValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#212529",
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  highlight: {
    backgroundColor: "#fff3cd",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffa200ff",
  },
  table: {
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#495057",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
    alignItems: "center",
  },
  tableCell: {
    fontSize: 13,
    color: "#343a40",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
    gap: 12,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    gap: 8,
  },
  invoiceButton: {
    backgroundColor: "#2563eb",
  },
  cuttingButton: {
    backgroundColor: "#16a34a",
  },
  pdfButtonDisabled: {
    backgroundColor: "#ccc",
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});