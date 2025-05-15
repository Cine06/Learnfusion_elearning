import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView,Image, TextInput } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import { useRouter, Stack } from "expo-router";
import styles from "../styles/message";

export default function Messages() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("inbox");
  const [newContact, setNewContact] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  const inboxMessages = [
    { id: 1, name: "Christian Atanque", text: "Yung basura patapon...", time: "5 Hours Ago", avatar: require("../assets/user2.jpg") },
    { id: 2, name: "Hazel Lachica", text: "Pautang 50 gcash...", time: "3 Weeks Ago", avatar: require("../assets/user3.jpg") },
    { id: 3, name: "Francine Puzon", text: "Be, ayuko na!...", time: "15 Minutes Ago", avatar: require("../assets/user1.jpg") },
  ];

  const sentMessages = [
    { id: 4, name: "Razec Hernandes", text: "Pre, kita tayo bukas?", time: "1 Day Ago", avatar: require("../assets/user4.png") },
    { id: 5, name: "Hazel Lachica", text: "Okay na", time: "3 Weeks Ago", avatar: require("../assets/user3.jpg") },
  ];

  const [messages, setMessages] = useState(inboxMessages);

  const deleteMessage = (id) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const switchTab = (tab) => {
    setSelectedTab(tab);
    setMessages(tab === "inbox" ? inboxMessages : sentMessages);
  };

  const openChat = (message) => {
    router.push({ pathname: "/messagedetails", params: message });
  };

  const addNewContact = () => {
    if (newContact.trim() === "") return;
    const newMessage = {
      id: messages.length + 1,
      name: newContact,
      text: "Start a conversation...",
      time: "Just now",
      avatar: require("../assets/default-avatar.png"),
    };
    setMessages([newMessage, ...messages]);
    setNewContact("");
    setAddingContact(false);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Messages</Text>
          <TouchableOpacity onPress={() => setAddingContact(true)}>
            <FontAwesome5 name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {addingContact && (
          <View style={styles.newContactContainer}>
            <TextInput
              style={styles.newContactInput}
              placeholder="Enter name..."
              value={newContact}
              onChangeText={setNewContact}
            />
            <TouchableOpacity style={styles.addButton} onPress={addNewContact}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, selectedTab === "inbox" && styles.activeTab]} onPress={() => switchTab("inbox")}>
            <Text style={styles.tabText}>Inbox</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, selectedTab === "sent" && styles.activeTab]} onPress={() => switchTab("sent")}>
            <Text style={styles.tabText}>Sent</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.messageList}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <TouchableOpacity key={message.id} style={styles.messageItem} onPress={() => openChat(message)}>
                <Image source={message.avatar} style={styles.avatar} />
                <View style={styles.messageTextContainer}>
                  <Text style={styles.messageName}>{message.name}</Text>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
                <Text style={styles.messageTime}>{message.time}</Text>
                <TouchableOpacity onPress={() => deleteMessage(message.id)}>
                  <Ionicons name="trash" size={20} color="red" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noMessages}>No messages available.</Text>
          )}
        </ScrollView>

        <BottomNav />
      </View>
    </>
  );
}


