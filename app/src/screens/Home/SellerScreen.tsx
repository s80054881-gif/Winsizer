import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function SellerScreen({ navigation }: any) {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Items</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.comingSoonContainer,
            { transform: [{ scale: scaleAnim }], opacity: fadeAnim },
          ]}
        >
          <View style={styles.iconContainer}>
            <Icon name="business" size={80} color="#ffa200ff" />
            <View style={styles.sparkleContainer}>
              <Icon name="sparkles" size={24} color="#dfc904ff" style={styles.sparkle1} />
              <Icon name="sparkles" size={20} color="#dfc904ff" style={styles.sparkle2} />
            </View>
          </View>

          <Text style={styles.title}>Coming Soon!</Text>
          <Text style={styles.subtitle}>
            Your seller marketplace is under construction
          </Text>

          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Icon name="storefront" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Browse Sellers</Text>
                <Text style={styles.featureDesc}>Find trusted suppliers</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Icon name="cart" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Order Direct</Text>
                <Text style={styles.featureDesc}>Purchase from sellers</Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrapper}>
                <Icon name="star" size={24} color="#ffa200ff" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Ratings & Reviews</Text>
                <Text style={styles.featureDesc}>Quality assurance</Text>
              </View>
            </View>
          </View>

          <View style={styles.comingSoonBadge}>
            <Icon name="rocket" size={20} color="#fff" />
            <Text style={styles.comingSoonText}>Launching Soon</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Icon name="home-outline" size={24} color="#888" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

       <TouchableOpacity style={styles.navItem}
                onPress={() => navigation.navigate("Party")}
                >
                 <Icon name="people-outline" size={24} color="#888" />
                 <Text style={styles.navText}>Party</Text>
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

        <TouchableOpacity style={styles.navItem}>
          <Icon name="business" size={24} color="#ffa200ff" />
          <Text style={[styles.navText, styles.navTextActive]}>Seller</Text>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  comingSoonContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#ffa2001a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  sparkleContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  sparkle1: {
    position: "absolute",
    top: 10,
    right: 15,
  },
  sparkle2: {
    position: "absolute",
    bottom: 20,
    left: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  featuresContainer: {
    width: "100%",
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: "#888",
  },
  comingSoonBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffa200ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
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