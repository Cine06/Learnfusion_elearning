import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useRouter, Stack } from "expo-router";
import { useState } from "react";
import BottomNav from "../components/BottomNav";
import styles from "../styles/messaged";

export default function MessageDetails() {
  const router = useRouter();
  const { name, avatar } = useLocalSearchParams();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, text: "Yung basura patapon sabi ni mama", time: "7:12 Min", sender: "other" },
    { id: 2, text: "okay na be", time: "7:12 Min", sender: "me" },
  ]);

  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { id: messages.length + 1, text: newMessage, time: "Just now", sender: "me" }]);
    setNewMessage("");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
       behavior={Platform.OS === "ios" ? "padding" : "height"} 
       style={styles.container}
      >
  <View style={{ flex: 1 }}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <View style={styles.headerTitle}>
        <Image source={avatar} style={styles.avatar} />
        <Text style={styles.headerText}>{name}</Text>
      </View>
      <FontAwesome5 name="envelope" size={20} color="white" style={styles.icon} />
    </View>

    <ScrollView style={styles.chatContainer}>
      {messages.map((msg) => (
        <View key={msg.id} style={msg.sender === "me" ? styles.receiverBubble : styles.senderBubble}>
          <Text style={msg.sender === "me" ? styles.receiverText : styles.senderText}>{msg.text}</Text>
          <Text style={styles.time}>{msg.time}</Text>
        </View>
      ))}
    </ScrollView>

    <View style={{ paddingBottom: 60 }}>
      <View style={styles.inputContainer}>
                  <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}
                  >
                     <FontAwesome5 name="plus" size={20} color="green" left={10} />
                  </TouchableOpacity>
                  
                  {dropdownVisible && (
                    <View style={styles.dropdownMenu}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => { router.push("/profile"); setDropdownVisible(false); }}
                      >
                        <FontAwesome5 name="file" size={18} color="#046a38" />
                        <Text style={styles.menuText}>Upload</Text>
                      </TouchableOpacity>
                    </View>
                  )}
        <TextInput 
          style={styles.input} 
          placeholder="Aa" 
          placeholderTextColor="gray" 
          value={newMessage} 
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </View>

  <BottomNav />
</KeyboardAvoidingView>

    </>
  );
}
