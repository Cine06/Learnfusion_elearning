import { View, Text, TouchableOpacity, ScrollView,Image } from "react-native";
import { useState } from "react";
import { useRouter, Stack } from "expo-router";
import BottomNav from "../components/BottomNav";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import styles from "../styles/modules";

export default function ELearningModules() {
  const router = useRouter();
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons"); 
  const [downloadedLessons, setDownloadedLessons] = useState({});
  const [unlockedLessons, setUnlockedLessons] = useState([0]); 

  const lessons = [
    { title: "Programming Paradigms", content: ["Topic_1.pdf", "Topic_1_videos", "Exercise"] },
    { title: "Java", content: [""] },
    { title: "Fundamental Data Types", content: [""] },
    { title: "Operators", content: [""] },
    { title: "Expression", content: [""] },
    { title: "Input & Output", content: [""] },
  ];

  const quizzes = [
    { title: "Quiz 1: Programming Paradigms", questions: 10, type: "multiple-choice" },
    { title: "Quiz 2: Java Basics", questions: 12, type: "coding" },
    { title: "Quiz 3: Data Types and Operators", questions: 8, type: "short-answer" },
  ];

  const assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];

  const handleDownload = (lessonTitle) => {
    setDownloadedLessons((prev) => ({ ...prev, [lessonTitle]: true }));
  };

  const handleLessonCompletion = (index) => {
    setUnlockedLessons((prev) => {
      if (!prev.includes(index + 1)) {
        return [...prev, index + 1]; 
      }
      return prev;
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require("../assets/icclogo.png")} style={styles.logo} />
          <Text style={styles.headerText}>INTERFACE COMPUTER COLLEGE</Text>
        </View>

        <View style={styles.contentWrapper}>
          <View style={styles.sideTab}>
            <TouchableOpacity style={[styles.sideTabItem, activeTab === "lessons" && styles.activeTab]}
              onPress={() => setActiveTab("lessons")}>
              <Icon name="book-open-variant" size={30} color={activeTab === "lessons" ? "#046a38" : "white"} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sideTabItem, activeTab === "assignments" && styles.activeTab]}
              onPress={() => setActiveTab("assignments")}>
              <Icon name="clipboard-text" size={30} color={activeTab === "assignments" ? "#046a38" : "white"} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sideTabItem, activeTab === "quizzes" && styles.activeTab]}
              onPress={() => setActiveTab("quizzes")}>
              <Icon name="trophy" size={30} color={activeTab === "quizzes" ? "#046a38" : "white"} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sideTabItem, activeTab === "analytics" && styles.activeTab]}
              onPress={() => setActiveTab("analytics")}>
              <Icon name="chart-line" size={30} color={activeTab === "analytics" ? "#046a38" : "white"} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.mainContent}>

            {activeTab === "lessons" && (
              <>
                <Text style={styles.title}> HANDOUTS</Text>
                {lessons.map((lesson, index) => (
                  <View key={index}>
                    <TouchableOpacity
                      style={[
                        styles.lessonButton,
                        unlockedLessons.includes(index) ? {} : styles.lockedLesson,
                      ]}
                      onPress={() => {
                        if (unlockedLessons.includes(index)) {
                          setExpandedLesson(expandedLesson === index ? null : index);
                        } else {
                          alert("This lesson is locked. Wait for your instructor to unlock it.");
                        }
                      }}
                    >
                      <Text style={styles.lessonText}>{lesson.title}</Text>
                      {!unlockedLessons.includes(index) && (
                        <Icon name="lock" size={20} color="#046a38" style={styles.lockIcon} />
                      )}
                    </TouchableOpacity>
                    {expandedLesson === index && (
                      <View style={styles.dropdown}>
                        {lesson.content.map((item, i) => (
                          <TouchableOpacity key={i} onPress={() => router.push("/lessonDetails")}>
                            <Text style={styles.dropdownItem}>{item}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity 
                          style={styles.downloadButton} 
                          onPress={() => {
                            handleDownload(lesson.title);
                            
                            if (index === unlockedLessons.length - 1) {
                              handleLessonCompletion(index);
                            }
                          }}
                        >
                          <Text style={styles.downloadText}>
                            {downloadedLessons[lesson.title] ? "Downloaded" : "Download"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </>
            )}

            {activeTab === "assignments" && (
              <>
                <Text style={styles.title}>ASSIGNMENTS</Text>
                {assignments.map((assignment, index) => (
                  <TouchableOpacity key={index} style={styles.assignmentItem} onPress={() => router.push("/assignmentDetails")}>
                    <Text style={styles.assignmentText}>{assignment}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {activeTab === "quizzes" && (
              <>
                <Text style={styles.title}>ASSESSMENTS</Text>
                {quizzes.map((quiz, index) => (
                  <TouchableOpacity key={index} style={styles.quizItem} onPress={() => router.push("/quizDetails")}>
                    <Text style={styles.quizText}>{quiz.title} - {quiz.questions} questions</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {activeTab === "analytics" && (
              <>
                <Text style={styles.title}>Analytics</Text>
                <View style={styles.analyticsContainer}>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsTitle}>AI Feedback</Text>
                    <Text style={styles.analyticsText}>Mahina ka sa ganto be mag focus ka sa topic na ganere</Text>
                  </View>
                  <View style={styles.analyticsCard}>
                    <Text style={styles.analyticsTitle}>Performance Analysis</Text>
                    <Text style={styles.analyticsText}>Almost Perfect pwede na grumaduate</Text>
                    <View style={styles.performanceBar} />
                  </View>
                </View>
              </>
            )}

          </ScrollView>
        </View>

        <BottomNav />
      </View>
    </>
  );
}

