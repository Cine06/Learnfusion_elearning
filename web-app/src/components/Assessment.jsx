import React, { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import '../styles/Assessment.css';
import Sidebar from './Sidebar';

const Assessment = () => {
  const [selectedTab, setSelectedTab] = useState('Quiz');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [givenTasks, setGivenTasks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState('Multiple Choice');

  const quizzes = ['01 Quiz 1', '02 Quiz 2', '03 Quiz 3'];
  const assignments = ['01 Assignment 1', '02 Assignment 2', '03 Assignment 3'];
  const sections = ['Section 1', 'Section 2', 'Section 3'];

  const currentTasks = selectedTab === 'Quiz' ? quizzes : assignments;

  const handleGive = () => {
    if (!selectedTask || !selectedSection || !deadline || !time) {
      alert('Please complete all fields.');
      return;
    }

    const taskKey = `${selectedTab}-${selectedTask}-${selectedSection}`;
    if (givenTasks.includes(taskKey)) {
      alert('This task has already been given.');
      return;
    }

    setGivenTasks([...givenTasks, taskKey]);
    alert(`Assigned "${selectedTask}" (${selectedTab}) to ${selectedSection} until ${deadline} ${time}`);
  };

  const handleUngive = () => {
    const taskKey = `${selectedTab}-${selectedTask}-${selectedSection}`;
    if (!givenTasks.includes(taskKey)) {
      alert('This task hasn’t been given yet.');
      return;
    }

    setGivenTasks(givenTasks.filter((key) => key !== taskKey));
    alert(`Ungave "${selectedTask}" (${selectedTab}) from ${selectedSection}`);
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      activityType: questionType,
      question: '',
      choices: questionType === 'Multiple Choice' ? ['', '', '', ''] : [],
      correctAnswer: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateChoice = (qIndex, cIndex, value) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex] = value;
    setQuestions(updated);
  };

  return (
    <div className="assessment-container">
      <Sidebar />
      <div className="assessment-header">Activities</div>

      <div className="tab-toggle">
        <button className={`tab-btn ${selectedTab === 'Quiz' ? 'active' : ''}`} onClick={() => {
          setSelectedTab('Quiz');
          setSelectedTask(null);
        }}>Quizzes</button>
        <button className={`tab-btn ${selectedTab === 'Assignment' ? 'active' : ''}`} onClick={() => {
          setSelectedTab('Assignment');
          setSelectedTask(null);
        }}>Assignments</button>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          + Add {selectedTab}
        </button>
      </div>

      <div className="assessment-content">
        <div className="task-list">
          {currentTasks.map((task, index) => (
            <div
              key={index}
              className={`task-item ${selectedTask === task ? 'selected' : ''}`}
              onClick={() => setSelectedTask(task)}
            >
              {task}
            </div>
          ))}
        </div>

        <div className="section-container">
          <div className="section-header">Section</div>
          <select className="section-select" value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
            <option value="">Select Section</option>
            {sections.map((section, index) => (
              <option key={index} value={section}>{section}</option>
            ))}
          </select>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">Set Deadline</div>
          <input type="date" className="date-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          <input type="time" className="time-input" value={time} onChange={(e) => setTime(e.target.value)} />
          <button type="button" className="give-button" onClick={handleGive} disabled={!selectedTask || !selectedSection || !deadline || !time}>
            Give
          </button>
          <button type="button" className="give-button" style={{ backgroundColor: '#ef4444', marginTop: '10px' }} onClick={handleUngive} disabled={!selectedTask || !selectedSection}>
            Ungive
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create {selectedTab}</h2>

            <div className="question-type-selector">
              <label>Select Question Type</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                <option>Multiple Choice</option>
                <option>Short Answer</option>
                <option>True or False</option>
                <option>Fill in the Blanks</option>
              </select>
            </div>

            {questions.map((q, index) => (
              <div key={index} className="question-block">
                <div className="question-header">
                  <label>Question {index + 1} ({q.activityType})</label>
                  <FiTrash2 className="icon-trash" onClick={() => handleRemoveQuestion(index)} />
                </div>

                <input
                  type="text"
                  placeholder="Enter question"
                  value={q.question}
                  onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                />

                {q.activityType === 'Multiple Choice' && (
                  <>
                    {q.choices.map((choice, cIndex) => (
                      <input
                        key={`choice-${index}-${cIndex}`}
                        type="text"
                        placeholder={`Choice ${cIndex + 1}`}
                        value={choice}
                        onChange={(e) => updateChoice(index, cIndex, e.target.value)}
                      />
                    ))}
                    <input
                      type="text"
                      placeholder="Correct answer"
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                    />
                  </>
                )}

                {q.activityType === 'True or False' && (
                  <div className="true-false-buttons">
                    <div
                      className={`true-false-button ${q.correctAnswer === 'True' ? 'active' : ''}`}
                      onClick={() => updateQuestion(index, 'correctAnswer', 'True')}
                    >
                      True
                    </div>
                    <div
                      className={`true-false-button ${q.correctAnswer === 'False' ? 'active' : ''}`}
                      onClick={() => updateQuestion(index, 'correctAnswer', 'False')}
                    >
                      False
                    </div>
                  </div>
                )}


                {q.activityType === 'Short Answer' && (
                  <input
                    type="text"
                    placeholder="Correct answer"
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  />
                )}

                {q.activityType === 'Fill in the Blanks' && (
                  <input
                    type="text"
                    placeholder="Correct word/phrase to fill in"
                    value={q.correctAnswer}
                    onChange={(e) => updateQuestion(index, 'correctAnswer', e.target.value)}
                  />
                )}
              </div>
            ))}

            <button className="add-question-btn" onClick={handleAddQuestion}>
              <FiPlus style={{ marginRight: '6px' }} />
              Add Question
            </button>

            <div className="modal-buttons">
              <button onClick={() => {
                setQuestions([]);
                setShowModal(false);
              }}>Cancel</button>
              <button onClick={() => {
                console.log({ selectedTab, questions });
                alert('Activity saved!');
                setQuestions([]);
                setShowModal(false);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
