import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity,ScrollView } from "react-native";
import { useRouter, Stack } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import FloatingChatbot from "../components/FloatingChatbot";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "../styles/dashboard"; 


export default function Dashboard() {
  const router = useRouter();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    fetchUser();
  }, []);


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

<View style={styles.container}>
  <ScrollView 
    contentContainerStyle={styles.scrollContent} 
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    <TouchableOpacity 
      style={styles.menuButton} 
      onPress={() => setDropdownVisible(!dropdownVisible)}
    >
      <FontAwesome5 name="bars" size={24} color="white" />
    </TouchableOpacity>

    <View style={styles.header}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
    </View>

    {dropdownVisible && (
      <View style={styles.dropdownMenu}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => { router.push("/profile"); setDropdownVisible(false); }}
        >
          <FontAwesome5 name="user" size={18} color="#046a38" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { router.push("/about"); setDropdownVisible(false); }}
              >
                <FontAwesome5 name="info-circle" size={18} color="#046a38" />
                <Text style={styles.menuText}>About Us</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => {router.push("/login"); setDropdownVisible(false); }}
              >
                <FontAwesome5 name="sign-out-alt" size={18} color="red" />
                <Text style={[styles.menuText, { color: "red" }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.welcomeText}>
            Welcome to <Text style={styles.boldText}>LearnFusion</Text>
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About ICC</Text>
              <TouchableOpacity onPress={() => router.push("/about")}>
                <Image source={require("../assets/about.png")} style={styles.aboutImage} />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminders</Text>
              <TouchableOpacity style={styles.reminders} onPress={() => console.log("View reminders")}>
                <FontAwesome5 name="bell" size={20} color="#046a38" />
                <Text style={styles.reminderText}>Upcoming Deadlines & Activities</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Awards</Text>
              <View style={styles.awards}>
                <FontAwesome5 name="award" size={24} color="gold" />
                <Text style={styles.awardText}> Your Achievements</Text>
              </View>
            </View>

            
            <Text style={styles.sectionTitle}>Progress Overview</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Completed: 75%</Text>
            </View>

            <Text style={styles.sectionTitle}>Leaderboard</Text>
            <View style={styles.leaderboardContainer}>
              <View style={styles.leaderboardRow}>
                <FontAwesome5 name="medal" size={16} color="gold" />
                <Text style={styles.leaderboardText}>1.Razec Hernandez  - 1500 points</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <FontAwesome5 name="medal" size={16} color="silver" />
                <Text style={styles.leaderboardText}>2. Hazel Lachica - 1400 points</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <FontAwesome5 name="medal" size={16} color="#cd7f32" />
                <Text style={styles.leaderboardText}>3. Francine Puzon - 1300 points</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <FontAwesome5 name="medal" size={16} color="black" />
                <Text style={styles.leaderboardText}>4. Christian Atanque - 1250 points</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <FontAwesome5 name="medal" size={16} color="black" />
                <Text style={styles.leaderboardText}>5. Kenneth Daaco - 1200 points</Text>
              </View>
              <Text style={styles.rankText}>Your rank: #1</Text>
              <Text style={styles.rankText}>Points: 1500</Text>
            </View>
          </View>
          
        </ScrollView>

        <BottomNav />
        
        <FloatingChatbot />
      
      </View>
    </>
  );
}