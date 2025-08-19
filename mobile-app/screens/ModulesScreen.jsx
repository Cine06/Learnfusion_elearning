import { View, Text, TouchableOpacity, ScrollView,Image } from "react-native";
import { useState,useEffect } from "react";
import { useRouter, Stack } from "expo-router";
import BottomNav from "../components/BottomNav";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { supabase } from "../utils/supabaseClient";
import styles from "../styles/modules";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ELearningModules() {
  const router = useRouter();
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons"); 
  const [downloadedLessons, setDownloadedLessons] = useState({}); 
  const [unlockedLessons, setUnlockedLessons] = useState([0]); 
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [userSection, setUserSection] = useState(null);


  const assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];

  const handleDownload = (lessonTitle) => {
    setDownloadedLessons((prev) => ({ ...prev, [lessonTitle]: true }));
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
       try {
        const user = JSON.parse(await AsyncStorage.getItem("user"));

        if (user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("section_id")
            .eq("id", user.id)
            .single();

          if (userError) {
            console.error("Error fetching user section:", userError);
            return;
          }

          setUserSection(userData.section_id);
          const { data, error } = await supabase
           .from("assigned_assessments")
            .select("*, assessments(*)")
            .eq("section_id", userData.section_id); 

          if (error) {
            console.error("Error fetching assigned quizzes:", error);
          } else {
            setQuizzes(data);
          }
        }
      } catch (error) {
        console.error("Error fetching assigned quizzes, falling back to all quizzes:", error);

        const { data, error: fallbackError } = await supabase.from("assessments").select("*").eq("type", "Quiz");

        if (fallbackError) {
          console.error("Error fetching fallback quizzes:", fallbackError);
        } else {
          setQuizzes(data);
        }
      }
    };

    const fetchLessons = async () => {
        try{
          const {data, error} = await supabase.from("lessons").select("*");
          setLessons(data);
        }catch(error){
          console.error("there was an error", error);
        }
    }
    fetchLessons();
    fetchQuizzes();
  }, []);

  const handleLessonCompletion = (index) => {
    setUnlockedLessons((prev) => {
      return prev.includes(index + 1) ? prev : [...prev, index + 1];
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

                   <TouchableOpacity
                   key={index}
                   style={styles.quizItem}
                   onPress={() => {
                     router.push({
                       pathname: "/quizDetails",
                       params: {
                         ...quiz.assessment,
                         questions: quiz.questions ? quiz.questions.length : 0,
                         deadline: quiz.deadline
                       }
                      })}
                   }><Text style={styles.quizText}>{quiz.title} - {quiz.questions ? quiz.questions.length : 0} questions</Text>

                  </TouchableOpacity>

                ))}
              </>
            )}


          </ScrollView>
        </View>
      </View>

      <BottomNav />
    </>
  );
}
