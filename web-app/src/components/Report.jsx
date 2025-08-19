import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import Sidebar from "./Sidebar";
import { supabase } from "../utils/supabaseClient"; 
import "../styles/report.css";

const Report = () => {
  const { sectionName, lessonName } = useParams(); // lessonName is used for the report title
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  useEffect(() => {
    if (sectionName) {
      fetchLessonReport();
    } else {
      setReportData([]);
      setLoading(false);
    }
  }, [sectionName]); // Re-fetch if sectionName changes

  const fetchLessonReport = async () => {
    setLoading(true);
    try {
      // 1. Get Section ID
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("id")
        .eq("section_name", sectionName)
        .single();

      if (sectionError || !sectionData) {
        console.error("Error fetching section:", sectionError?.message || "Section not found.");
        setReportData([]);
        setLoading(false);
        return;
      }
      const sectionId = sectionData.id;

      // 2. Get Students in Section
      const { data: students, error: studentsError } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .eq("section_id", sectionId)
        .eq("role", "Student");

      if (studentsError) {
        console.error("Error fetching students:", studentsError.message);
        setReportData([]);
        setLoading(false);
        return;
      }
      if (!students || students.length === 0) {
        setReportData([]);
        setLoading(false);
        return;
      }

      // 3. Get IDs of Assessments assigned to the Section
      const { data: assignedAssessments, error: assignedAssessmentsError } = await supabase
        .from("assigned_assessments")
        .select("assessment_id")
        .eq("section_id", sectionId);

      if (assignedAssessmentsError) {
        console.error("Error fetching assigned assessments:", assignedAssessmentsError.message);
      }
      
      const assessmentIds = assignedAssessments?.map(aa => aa.assessment_id) || [];
      let assessmentsDetails = [];

      if (assessmentIds.length > 0) {
          const { data: assessmentData, error: assessmentError } = await supabase
              .from("assessments")
              .select("id, title, type")
              .in("id", assessmentIds);
          if (assessmentError) {
              console.error("Error fetching assessment details:", assessmentError.message);
          } else {
              assessmentsDetails = assessmentData || [];
          }
      }

      // 4. Get all submissions for these students and "assessments"
      let studentSubmissions = [];
      if (assessmentIds.length > 0 && students.length > 0) {
          const { data: submissionsData, error: submissionsError } = await supabase
              .from("submissions")
              .select("student_id, assessment_id, grade, status") // Use assessment_id
              .eq("section_id", sectionId) 
              .in("assessment_id", assessmentIds) // Query by assessment_id
              .in("student_id", students.map(s => s.id));

          if (submissionsError) {
              console.error("Error fetching submissions:", submissionsError.message);
          } else {
              studentSubmissions = submissionsData || [];
          }
      }

      // 5. Get Leaderboard data for progress
      let leaderboardMap = new Map();
      if (students.length > 0) {
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from("leaderboard")
          .select("user_id, completion_percentage, score")
          .in("user_id", students.map(s => s.id))
          .eq("section_id", sectionId); 

        if (leaderboardError) {
          console.error("Error fetching leaderboard data:", leaderboardError.message);
        } else if (leaderboardData) {
            leaderboardData.forEach(entry => leaderboardMap.set(entry.user_id, entry));
        }
      }
      
      // 6. Construct Report Data
      const finalReportData = students.map(student => {
        const studentQuizScores = {};
        const studentAssignmentScores = {};

        assessmentsDetails.forEach(assessment => {
          const submission = studentSubmissions.find(
            sub => sub.student_id === student.id && sub.assessment_id === assessment.id // Match on assessment_id
          );
          const score = submission ? (submission.grade !== null ? Number(submission.grade) : "N/A") : "N/A";

          if (assessment.type.toLowerCase() === 'quiz') {
            studentQuizScores[assessment.title] = score;
          } else { 
            studentAssignmentScores[assessment.title] = score;
          }
        });

        const studentLeaderboardEntry = leaderboardMap.get(student.id);
        const progress = studentLeaderboardEntry ? `${studentLeaderboardEntry.completion_percentage || 0}%` : "0%";
        
        let totalObtainedScore = 0;
        let totalMaxScorePossible = 0; 
        const maxScorePerItem = 10; // Assuming max score for each item is 10 for status calculation

        Object.values(studentQuizScores).forEach(s => {
          if (s !== "N/A") { totalObtainedScore += Number(s); totalMaxScorePossible += maxScorePerItem;}
        });
        Object.values(studentAssignmentScores).forEach(s => {
          if (s !== "N/A") { totalObtainedScore += Number(s); totalMaxScorePossible += maxScorePerItem;}
        });
        
        const overallPercentage = totalMaxScorePossible > 0 ? (totalObtainedScore / totalMaxScorePossible) * 100 : 0;
        let status = "N/A";
        if (totalMaxScorePossible > 0) {
          status = overallPercentage >= 50 ? "Pass" : "Fail"; // Example: Pass if >= 50%
        }

        return {
          id: student.id,
          name: `${student.first_name} ${student.last_name}`,
          quizzes: studentQuizScores,
          assignments: studentAssignmentScores,
          progress: progress,
          status: status,
        };
      });

      setReportData(finalReportData);
    } catch (error) {
      console.error("Failed to fetch lesson report:", error.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reportData.slice(indexOfFirstItem, indexOfLastItem);

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text(`${lessonName} | ${sectionName} Report`, 14, 20);
  
    const tableColumn = ["#", "Name", "Quiz Scores", "Assignment Scores", "Progress", "Status"];
    const tableRows = [];
  
    reportData.forEach((student, idx) => {
      const quizzes = Object.keys(student.quizzes).length > 0 
        ? Object.entries(student.quizzes)
            .map(([quiz, score]) => `${quiz}: ${score}`)
            .join("\n")
        : "No quizzes";
  
      const assignments = Object.keys(student.assignments).length > 0
        ? Object.entries(student.assignments)
            .map(([ass, score]) => `${ass}: ${score}`)
            .join("\n")
        : "No assignments";
  
      const rowData = [
        idx + 1,
        student.name,
        quizzes,
        assignments,
        student.progress,
        student.status
      ];
  
      tableRows.push(rowData);
    });
  
    autoTable(doc, {
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 153, 0] },
      bodyStyles: {
        valign: 'top', 
        halign: 'left',
      },
      columnStyles: {
        2: { cellWidth: 60 },
        3: { cellWidth: 60 }, 
      },
    });
  
    doc.save(`${lessonName}-${sectionName}-Report.pdf`);
  };
  

  return (
    <div className="report-dashboard-container">
      <Sidebar />
      <main className="report-dashboard-content">
        <h2>{lessonName} | {sectionName} Report</h2>
        {loading ? (
          <p className="loading-message">Loading report data...</p>
        ) : (
        <>
        <div className="report-table-container">
          <table className="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Quiz Scores</th>
                <th>Assignment Scores</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map((student, idx) => (
                <tr key={student.id}>
                  <td>{indexOfFirstItem + idx + 1}</td>
                  <td>{student.name}</td>
                  <td>
                    {Object.keys(student.quizzes).length > 0 ? (
                      Object.entries(student.quizzes).map(([quiz, score]) => (
                        <div key={quiz}>{quiz}: {score}</div>
                      ))
                    ) : (
                      <div>No quizzes</div>
                    )}
                  </td>
                  <td>
                    {Object.keys(student.assignments).length > 0 ? (
                      Object.entries(student.assignments).map(([ass, score]) => (
                        <div key={ass}>{ass}: {score}</div>
                      ))
                    ) : (
                      <div>No assignments</div>
                    )}
                  </td>
                  <td>{student.progress}</td>
                  <td>
                    <span className={student.status === "Pass" ? "report-status-pass" : "report-status-fail"}>
                      {student.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6">No report data available.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="footer-controls">
            <button className="back" onClick={() => navigate(-1)}>Back</button>
            <div className="pagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
            <button className="download-pdf" onClick={generatePDF}>Download PDF</button>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
};

export default Report;
