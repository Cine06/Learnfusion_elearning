import { View, Text, TextInput, TouchableOpacity} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "react-native-bcrypt";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from "../styles/cpass";

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{7,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("Password must be at least 7 characters long and contain both letters and numbers.");
      return;
    }

    try {
      setIsLoading(true);

      const user = JSON.parse(await AsyncStorage.getItem("user"));

      if (!user) {
        alert("No user data found.");
        setIsLoading(false);
        return;
      }

      const { data: currentUser, error: fetchError } = await supabase
        .from("users")
        .select("password")
        .eq("id", user.id)
        .single();

      if (fetchError || !currentUser) {
        alert("Error fetching user data.");
        setIsLoading(false);
        return;
      }

      const passwordMatch = bcrypt.compareSync(currentPassword, currentUser.password);
      
      if (!passwordMatch) {
        alert("Current password is incorrect.");
        setIsLoading(false);
        return;
      }

      const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

      const { error: updateError } = await supabase
        .from("users")
        .update({ password: hashedNewPassword })
        .eq("id", user.id);

      if (updateError) {
        alert("Error updating password.");
        setIsLoading(false);
        return;
      }

      alert("Password changed successfully!");
      router.push("/profile");
    } catch (err) {
      console.error("Error changing password:", err);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Change Password</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleChangePassword}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChangePasswordScreen;
