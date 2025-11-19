import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";

// Screens
import DashboardScreen from "../screens/Home/DashboardScreen";


export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  AddOrder: undefined;
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
      <Stack.Navigator initialRouteName="Auth" screenOptions={{ headerShown: false }}>
        {/* Auth Flow */}
        <Stack.Screen name="Auth" component={AuthNavigator} />

        {/* Main App Flow */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
       
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
