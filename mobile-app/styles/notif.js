import {StyleSheet} from "react-native";

export default StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFF",
      padding: 15,
    },
    header: {
      marginTop: 40,
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      
    },
    noNotifications: {
      textAlign: "center",
      fontSize: 16,
      marginTop: 20,
      color: "gray",
    },
    notificationItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F9F9F9",
      padding: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#046a38",
      marginBottom: 10,
    },
    icon: {
      marginRight: 10,
    },
    message: {
      fontSize: 16,
      fontWeight: "500",
    },
    time: {
      fontSize: 12,
      color: "gray",
    },
  });
  