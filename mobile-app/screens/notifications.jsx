import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import styles from "../styles/notif";

export default function Notifications() {
  const router = useRouter();

  const notifications = [
    { id: "1", message: "New lesson unlocked", time: "2 hours ago", route: "/lessons" },
    { id: "2", message: "You have a new message from Friselec", time: "5 hours ago", route: "/messages" },
    { id: "3", message: "Quiz has been given", time: "1 day ago", route: "/quiz" },
  ];

  return (
    <>
    <Stack.Screen options={{ headerShown: false }} />
      <Stack.Screen options={{ title: "Notifications" }} />
      <View style={styles.container}>
        <Text style={styles.header}>Notifications</Text>

        {notifications.length === 0 ? (
          <Text style={styles.noNotifications}>No new notifications</Text>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.notificationItem}
                onPress={() => router.push(item.route)}
              >
                <FontAwesome5 name="bell" size={20} color="#046a38" style={styles.icon} />
                <View>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        
      </View>
      <BottomNav />
    </>
  );
}


