import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import FeedScreen from "../screens/FeedScreen";
import SavedScreen from "../screens/SavedScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import AdminScreen from "../screens/AdminScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import { useUser } from "../context/UserContext";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  const { user } = useUser();

  return (
    <NavigationContainer>
      {!user ? (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen name="Login" component={LoginScreen} />
          <Tab.Screen name="Signup" component={SignupScreen} />
        </Tab.Navigator>
      ) : (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              let icon: keyof typeof Ionicons.glyphMap = "home";
              if (route.name === "Home") icon = "home";
              else if (route.name === "Saved") icon = "bookmark";
              else if (route.name === "Calendar") icon = "calendar";
              else if (route.name === "Profile") icon = "person";
              else if (route.name === "Admin") icon = "settings";
              return <Ionicons name={icon} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Home" component={FeedScreen} />
          <Tab.Screen name="Saved" component={SavedScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
          {user.isAdmin && <Tab.Screen name="Admin" component={AdminScreen} />}
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}
