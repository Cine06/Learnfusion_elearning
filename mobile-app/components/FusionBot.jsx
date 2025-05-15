import React, { useState, useRef, useEffect } from "react";
import {  View,  Text,  TextInput,  TouchableOpacity,  ScrollView,  StyleSheet,  Image,  KeyboardAvoidingView,  Platform,  ActivityIndicator,  Keyboard,  TouchableWithoutFeedback} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COHERE_API_KEY } from "@env";
import styles from "../styles/fusionbot";

const FusionBot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      role: "SYSTEM",
      message:
        "You are FusionBot, a helpful assistant that only answers Java programming-related questions.",
    },
  ]);
  const scrollRef = useRef();

  const scrollToBottom = () => {
    setTimeout(() => scrollRef?.current?.scrollToEnd({ animated: true }), 100);
  };

  useEffect(() => {
    const initializeMessages = async () => {
      const savedMessages = await loadMessages();
      setMessages(
        savedMessages.length > 0
          ? savedMessages
          : [
              {
                sender: "bot",
                text: "Hi, I’m FusionBot! You can ask me questions related to Java programming.",
              },
            ]
      );
    };

    initializeMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = inputText.trim();

    const javaKeywords = [
      "java", "jvm", "oop", "object-oriented", "class", "method",
      "constructor", "interface", "inheritance", "polymorphism",
      "encapsulation", "thread", "exception", "debugging", "hi", "hello"
    ];
    const restrictedWords = ["javarice", "java rice", "rice"];

    const isJavaRelated = javaKeywords.some(keyword =>
      userMessage.toLowerCase().includes(keyword)
    );
    const isRestricted = restrictedWords.some(restricted =>
      userMessage.toLowerCase().includes(restricted)
    );

    const updatedMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(updatedMessages);
    setInputText("");
    setLoading(true);

    if (!isJavaRelated || isRestricted) {
      const botMessage = {
        sender: "bot",
        text: "Sorry, I can only answer questions related to Java programming.",
      };
      setMessages([...updatedMessages, botMessage]);
      setLoading(false);
      return;
    }

    const validChatHistory = chatHistory
      .filter((msg) => msg.role === "USER" || msg.role === "CHATBOT")
      .map((msg) => ({ role: msg.role, message: msg.message }));

    validChatHistory.push({ role: "USER", message: userMessage });

    try {
      const response = await axios.post(
        "https://api.cohere.ai/v1/chat",
        {
          model: "command-r",
          message: userMessage,
          chat_history: validChatHistory,
        },
        {
          headers: {
            Authorization: `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const reply = response.data?.text?.trim();
      const updatedBotMessage = {
        sender: "bot",
        text: reply || "Sorry, I couldn’t find an answer for that.",
      };

      setMessages([...updatedMessages, updatedBotMessage]);
      setChatHistory([
        ...validChatHistory,
        {
          role: "CHATBOT",
          message: reply || "Sorry, I couldn’t find an answer for that.",
        },
      ]);

      storeMessages([...updatedMessages, updatedBotMessage]);
    } catch (err) {
      console.error("Cohere Error:", err.response?.data || err.message);
      setMessages([
        ...updatedMessages,
        {
          sender: "bot",
          text: "Oops! Something went wrong. Please check your connection or try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const storeMessages = async (newMessages) => {
    try {
      await AsyncStorage.setItem("@fusionBotMessages", JSON.stringify(newMessages));
    } catch (e) {
      console.error("Error storing messages:", e);
    }
  };

  const loadMessages = async () => {
    try {
      const storedMessages = await AsyncStorage.getItem("@fusionBotMessages");
      return storedMessages ? JSON.parse(storedMessages) : [];
    } catch (e) {
      console.error("Error loading messages:", e);
      return [];
    }
  };

  const handleRefresh = async () => {
    await storeMessages([]);
    setMessages([
      {
        sender: "bot",
        text: "Hi, I’m FusionBot! You can ask me questions related to Java programming.",
      },
    ]);
    setInputText("");
    setChatHistory([
      {
        role: "SYSTEM",
        message:
          "You are FusionBot, a helpful assistant that only answers Java programming-related questions.",
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.body}>
            <ScrollView
              style={styles.chatArea}
              contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
              ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
            >
              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    msg.sender === "bot" ? styles.botContainer : styles.userContainer,
                  ]}
                >
                  {msg.sender === "bot" && (
                    <Image
                      source={require("../assets/chatbot-icon.png")}
                      style={styles.botIcon}
                    />
                  )}
                  <View
                    style={[
                      styles.message,
                      msg.sender === "bot" ? styles.botMsg : styles.userMsg,
                    ]}
                  >
                    <Text style={msg.sender === "bot" ? styles.botText : styles.userText}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}

              {loading && (
                <View style={[styles.messageContainer, styles.botContainer]}>
                  <Image
                    source={require("../assets/chatbot-icon.png")}
                    style={styles.botIcon}
                  />
                  <View style={[styles.message, styles.botMsg]}>
                    <ActivityIndicator color="white" />
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask about Java..."
                value={inputText}
                onChangeText={setInputText}
                editable={!loading}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                onPress={handleSend}
                style={styles.sendButton}
                disabled={loading}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRefresh}
                style={[styles.sendButton, { marginLeft: 6, backgroundColor: "#888" }]}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default FusionBot;

