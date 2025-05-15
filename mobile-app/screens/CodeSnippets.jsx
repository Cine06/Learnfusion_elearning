import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import BottomNav from "../components/BottomNav";
import { useRouter, Stack } from "expo-router";
import FloatingChatbot from "../components/FloatingChatbot";
import styles from "../styles/code";

export default function CodeSnippets() {
  const [selectedTab, setSelectedTab] = useState("code");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Output will be displayed here");

  const runCode = async () => {
    setOutput("Running code...");
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "java", version: "latest", files: [{ content: code }] })
      });
      const data = await response.json();
      setOutput(data.run.output || "Error: No output received");
    } catch (error) {
      setOutput("Error executing code");
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <FontAwesome5 style={styles.icon} name="code" size={24} color="white" />
          <Text style={styles.headerText}>TEST YOUR CODE</Text>
        </View>
        
        <View style={styles.fileNameContainer}>
          <TouchableOpacity style={styles.addButton}>
            <FontAwesome5 name="plus" size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.fileName}>processData.java</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, selectedTab === "code" && styles.activeTab]} onPress={() => setSelectedTab("code")}>
            <Text style={styles.tabText}>CODE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, selectedTab === "output" && styles.activeTab]} onPress={() => setSelectedTab("output")}>
            <Text style={styles.tabText}>OUTPUT</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.contentContainer}>
          {selectedTab === "code" ? (
            <TextInput
              style={styles.codeInput}
              multiline
              value={code}
              onChangeText={setCode}
              placeholder="Type your Java code here..."
              placeholderTextColor="#888"
            />
          ) : (
            <Text style={styles.outputText}>{output}</Text>
          )}
        </ScrollView>
        
        <TouchableOpacity style={styles.runButton} onPress={runCode}>
          <Text style={styles.runButtonText}>RUN</Text>
        </TouchableOpacity>
      </View>

      <FloatingChatbot />

      <BottomNav />
    </>
  );
}


