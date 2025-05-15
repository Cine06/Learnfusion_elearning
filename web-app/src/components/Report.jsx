import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import Sidebar from "./Sidebar";
import "../styles/report.css";

const Report = () => {
  const { sectionName, lessonName } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  useEffect(() => {
    fetchLessonReport();
  }, []);

  const fetchLessonReport = async () => {
    const mockData = [
      {
        id: 1,
        name: "Francine Puzon",
        quizzes: { "Quiz 1": 8, "Quiz 2": 10 },
        assignments: { "Assignment 1": 9, "Assignment 2": 9 },
        progress: "90%",
        status: "Pass"
      },
      {
        id: 2,
        name: "Hazel Lachica",
        quizzes: { "Quiz 1": 5, "Quiz 2": 6 },
        assignments: { "Assignment 1": 5, "Assignment 2": 3 },
        progress: "60%",
        status: "Fail"
      },
      {
        id: 3,
        name: "Christian Atanque",
        quizzes: { "Quiz 1": 10, "Quiz 2": 10 },
        assignments: { "Assignment 1": 10, "Assignment 2": 10 },
        progress: "100%",
        status: "Pass"
      },
      {
        id: 4,
        name: "Razec Hernandez",
        quizzes: { "Quiz 1": 2, "Quiz 2": 2 },
        assignments: { "Assignment 1": 5, "Assignment 2": 0 },
        progress: "50%",
        status: "Fail"
      }
    ];
    setReportData(mockData);
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
      const quizzes = Object.entries(student.quizzes)
        .map(([quiz, score]) => `${quiz}: ${score}`)
        .join("\n"); 
  
      const assignments = Object.entries(student.assignments)
        .map(([ass, score]) => `${ass}: ${score}`)
        .join("\n");
  
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
                    {Object.entries(student.quizzes).map(([quiz, score]) => (
                      <div key={quiz}>{quiz}: {score}</div>
                    ))}
                  </td>
                  <td>
                    {Object.entries(student.assignments).map(([ass, score]) => (
                      <div key={ass}>{ass}: {score}</div>
                    ))}
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
      </main>
    </div>
  );
};

export default Report;
