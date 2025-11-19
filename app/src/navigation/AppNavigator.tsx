import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";
import DashboardScreen from "../screens/Home/DashboardScreen";
import ProfileScreen from "../screens/Auth/ProfileScreen";
import VideosScreen from "../screens/Home/VideosScreen";
import SellerScreen from "../screens/Home/SellerScreen";
import PartyScreen from "../screens/Home/PartyScreen";
import ItemsScreen from "../screens/Home/ItemsScreen";
import WindowCalculatorScreen from "../screens/Home/WindowCalculatorScreen";
import InvoiceScreen from "../screens/Home/InvoiceScreen";
import AddPartyScreen from "../screens/Home/AddPartyScreen";
import OrderDetailsScreen from "../screens/Home/OrderDetailsScreen";
import EditPartyScreen from "../screens/Home/EditPartyScreen";
import PartyDetailsScreen from "../screens/Home/PartyDetailsScreen";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Dashboard: undefined;
  Calulator: undefined;
  Profile: undefined;
  Videos: undefined;
  Seller: undefined;
  Party: undefined;
  AddParty: undefined;
  EditParty: undefined;
  PartyDetails:undefined;
  OrderDetails: undefined;
  Items: undefined;
  Invoice: {
    height: number;
    width: number;
    results: any;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Main Screens */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Calulator" component={WindowCalculatorScreen} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Party" component={PartyScreen} />
        <Stack.Screen name="AddParty" component={AddPartyScreen} />
        <Stack.Screen name="EditParty" component={EditPartyScreen} />
        <Stack.Screen name="PartyDetails" component={PartyDetailsScreen} />
        <Stack.Screen name="Items" component={ItemsScreen} />
        <Stack.Screen name="Videos" component={VideosScreen} />
        <Stack.Screen name="Seller" component={SellerScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;