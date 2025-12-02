import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import DashboardScreen from "../screens/Home/DashboardScreen";
import ProfileScreen from "../screens/Auth/ProfileScreen";
import PartyScreen from "../screens/Home/PartyScreen";
import AddPartyScreen from "../screens/Home/AddPartyScreen";
import EditPartyScreen from "../screens/Home/EditPartyScreen";
import PartyDetailsScreen from "../screens/Home/PartyDetailsScreen";
import ItemsScreen from "../screens/Home/ItemsScreen";
import WindowCalculatorScreen from "../screens/Home/WindowCalculatorScreen";
import InvoiceScreen from "../screens/Home/InvoiceScreen";
import OrderDetailsScreen from "../screens/Home/OrderDetailsScreen";
import VideosScreen from "../screens/Home/VideosScreen";
import SellerScreen from "../screens/Home/SellerScreen";
import SubscriptionScreen from "../screens/Home/SubscriptionScreen";

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  Profile: undefined;
  Party: undefined;
  AddParty: undefined;
  EditParty: undefined;
  PartyDetails: undefined;
  Items: undefined;
  OrderDetails: undefined;
  Seller: undefined;
  Videos: undefined;
  Calulator: undefined;
  Subscription: undefined;
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
      <Stack.Navigator
        id="RootStack"
        initialRouteName="Auth"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Party" component={PartyScreen} />
        <Stack.Screen name="AddParty" component={AddPartyScreen} />
        <Stack.Screen name="EditParty" component={EditPartyScreen} />
        <Stack.Screen name="PartyDetails" component={PartyDetailsScreen} />
        <Stack.Screen name="Items" component={ItemsScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="Calulator" component={WindowCalculatorScreen} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} />
        <Stack.Screen name="Videos" component={VideosScreen} />
        <Stack.Screen name="Seller" component={SellerScreen} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
