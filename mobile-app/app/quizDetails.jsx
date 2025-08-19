import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BottomNav from '../components/BottomNav';


const QuizDetails = () => {
  const router = useRouter();
  const { title, questions,deadline } = useLocalSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  
  const submitQuiz = () => {
    console.log('Quiz submitted with answers:', answers);


    const calculateGrade = () => {

      return 85;
    };

    const grade = calculateGrade();

    const submit = async () => {
        try{
        const { data, error } = await supabase
            .from("assigned_assessments")
            .update({ status: "Submitted", grade: grade })
            .eq("assessment_id", title); 
          if (error) {
                console.error("Error updating submission:", error);
                alert("Failed to submit quiz. Please try again.");
          }else{
              console.log("Successfully updated submission:", data);
              alert('Quiz submitted!');
              router.push('/lessons');
          }
        }catch(error){
            console.error("Error submitting", error);
        }
    }
    submit();
  };

  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestionIndex]: answer });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
      if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const isDeadlinePassed = () => {
    if (!deadline) return false; 
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return now > deadlineDate;
  };

  const deadlinePassed = isDeadlinePassed();


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text> 
      <Text style={styles.question}>Question {currentQuestionIndex + 1}: What is the capital of France?</Text>
      <View style={styles.optionsContainer}>
        {['A. London', 'B. Paris', 'C. Rome', 'D. Berlin'].map((option, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={() => handleAnswer(option)}>
            <Text>{option}</Text>
          </TouchableOpacity>
        ))}
      </View> 
      <View style={styles.navigation}>
          <TouchableOpacity onPress={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
          <Text>Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={goToNextQuestion}
          disabled={currentQuestionIndex === questions - 1}
        >
          <Text>Next</Text>
        </TouchableOpacity>
      </View>


        {deadlinePassed ? (
          <Text style={styles.deadlineText}>Deadline Passed</Text>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={submitQuiz}>
        <Text style={styles.submitButtonText}>Submit Quiz</Text>
      </TouchableOpacity>
          )}

      <BottomNav/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#046a38" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: 'white' },
  question: { fontSize: 18, marginBottom: 20, color: 'white' },
  optionsContainer: { marginBottom: 20 },
  option: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: "gold",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#046a38",
  },
  
  tabContainer: { 
    flexDirection: "row", 
    borderBottomWidth: 1, 
    borderColor: "#ccc" 
  },
  tab: { 
    flex: 1, 
    padding: 10, 
    alignItems: "center" 
  },
    deadlineText: {
    color: "red",
    fontSize: 16,
  },

});