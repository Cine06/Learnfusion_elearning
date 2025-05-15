import React, { useState } from "react";
import { Dimensions, TouchableOpacity, Image, View, Text } from "react-native";
import Animated, { useSharedValue,  useAnimatedStyle,  withSpring,  FadeIn,  FadeOut,} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Fusionbot from "./FusionBot";
import styles from "../styles/fchatbot";

const { width, height } = Dimensions.get("window");
const INITIAL_X = width - 80;
const INITIAL_Y = height - 180;

export default function FloatingChatbot() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const x = useSharedValue(INITIAL_X);
  const y = useSharedValue(INITIAL_Y);
  const offsetX = useSharedValue(INITIAL_X);
  const offsetY = useSharedValue(INITIAL_Y);

  const dragGesture = Gesture.Pan()
    .onStart(() => {
      offsetX.value = x.value;
      offsetY.value = y.value;
    })
    .onUpdate((event) => {
      x.value = offsetX.value + event.translationX;
      y.value = offsetY.value + event.translationY;
    })
    .onEnd(() => {
      const maxX = width - 70;
      const maxY = height - 100;
      x.value = withSpring(Math.max(10, Math.min(x.value, maxX)));
      y.value = withSpring(Math.max(10, Math.min(y.value, maxY)));
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {isChatOpen ? (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.chatPopup}
          >
            <View style={styles.chatHeader}>
              <View style={styles.headerLeft}>
                <Image source={require("../assets/chatbot-icon.png")} style={styles.headerIcon} />
                <Text style={styles.headerTitle}>FusionBot</Text>
              </View>
              <TouchableOpacity onPress={() => setIsChatOpen(false)}>
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <Fusionbot />
          </Animated.View>
        ) : (
          <TouchableOpacity onPress={() => setIsChatOpen(true)} style={styles.fab}>
            <Image source={require("../assets/chatbot-icon.png")} style={styles.fabImage} />
          </TouchableOpacity>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

