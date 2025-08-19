import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import '../styles/Assessment.css';
import Sidebar from './Sidebar';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

function MatchingQuestionPreviewDND({ question, questionIndex }) {
  const prompts = question.matchingPairs.map((p, i) => ({
    id: `prompt-${questionIndex}-${i}`, 
    content: p.left,
  }));

  const initialChoices = question.matchingPairs.map((p, i) => ({
    id: `choice-${questionIndex}-${i}-${p.right.replace(/\W/g, '')}`,
    content: p.right,
  }));

  const [choicesInPool, setChoicesInPool] = useState(() => shuffleArray([...initialChoices]));
  const [slots, setSlots] = useState(() => Array(prompts.length).fill(null)); 

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return; 

    const draggedItem = choicesInPool.find(c => c.id === draggableId) || slots.find(s => s && s.id === draggableId);
    if (!draggedItem) return; 

    let newChoicesInPool = [...choicesInPool];
    let newSlots = [...slots];

    if (source.droppableId === `choices-pool-${questionIndex}`) {
      newChoicesInPool = newChoicesInPool.filter(item => item.id !== draggableId);
    } else if (source.droppableId.startsWith(`prompt-slot-${questionIndex}`)) {
      const sourceSlotIndex = parseInt(source.droppableId.split('-')[3]);
      if (newSlots[sourceSlotIndex] && newSlots[sourceSlotIndex].id === draggableId) {
        newSlots[sourceSlotIndex] = null;
      }
    }

    if (destination.droppableId === `choices-pool-${questionIndex}`) {
      if (!newChoicesInPool.find(item => item.id === draggableId)) { 
        newChoicesInPool.splice(destination.index, 0, draggedItem);
      }
    } else if (destination.droppableId.startsWith(`prompt-slot-${questionIndex}`)) {
      const destSlotIndex = parseInt(destination.droppableId.split('-')[3]);
      const itemCurrentlyInDestSlot = newSlots[destSlotIndex];

      if (itemCurrentlyInDestSlot) {
        if (!newChoicesInPool.find(item => item.id === itemCurrentlyInDestSlot.id)) {
          newChoicesInPool.push(itemCurrentlyInDestSlot);
        }
      }
      newSlots[destSlotIndex] = draggedItem; 
    }

    setChoicesInPool(newChoicesInPool);
    setSlots(newSlots);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '10px' }}>

        <div style={{ width: '50%' }}>
          <strong>Prompts:</strong>
          {prompts.map((prompt, promptIndex) => (
            <div key={prompt.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <span style={{ flexGrow: 1, marginRight: '10px' }}>{prompt.content}</span>
              <Droppable droppableId={`prompt-slot-${questionIndex}-${promptIndex}`} type="CHOICE_ITEM">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      border: `2px dashed ${snapshot.isDraggingOver ? 'dodgerblue' : '#cccccc'}`,
                      padding: '10px',
                      minHeight: '44px',
                      width: '180px',
                      backgroundColor: snapshot.isDraggingOver ? 'aliceblue' : (slots[promptIndex] ? '#fffacd' : '#f9f9f9'),
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {slots[promptIndex] ? (
                      <Draggable draggableId={slots[promptIndex].id} index={0} type="CHOICE_ITEM">
                        {(providedDraggable, snapshotDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            style={{
                              padding: '8px',
                              border: '1px solid #cccccc',
                              backgroundColor: snapshotDraggable.isDragging ? 'lightyellow' : 'white',
                              borderRadius: '4px',
                              userSelect: 'none',
                              boxShadow: snapshotDraggable.isDragging ? '0px 2px 5px rgba(0,0,0,0.2)' : 'none',
                              ...providedDraggable.draggableProps.style,
                            }}
                          >
                            {slots[promptIndex].content}
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      <span style={{ color: '#aaaaaa', fontSize: '0.9em' }}>Drop here</span>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>

        <div style={{ width: '40%' }}>
          <strong>Choices:</strong>
          <Droppable droppableId={`choices-pool-${questionIndex}`} type="CHOICE_ITEM">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  border: `2px dashed ${snapshot.isDraggingOver ? 'mediumseagreen' : '#cccccc'}`,
                  minHeight: '120px',
                  backgroundColor: snapshot.isDraggingOver ? 'honeydew' : '#f9f9f9',
                  borderRadius: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {choicesInPool.map((choice, choiceIndex) => (
                  <Draggable key={choice.id} draggableId={choice.id} index={choiceIndex} type="CHOICE_ITEM">
                    {(providedDraggable, snapshotDraggable) => (
                      <div
                        ref={providedDraggable.innerRef}
                        {...providedDraggable.draggableProps}
                        {...providedDraggable.dragHandleProps}
                        style={{
                          padding: '8px',
                          border: '1px solid #cccccc',
                          backgroundColor: snapshotDraggable.isDragging ? 'lightyellow' : 'white',
                          borderRadius: '4px',
                          userSelect: 'none',
                          boxShadow: snapshotDraggable.isDragging ? '0px 2px 5px rgba(0,0,0,0.2)' : 'none',
                          ...providedDraggable.draggableProps.style,
                        }}
                      >
                        {choice.content}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </div>
    </DragDropContext>
  );
}
export default function Assessment() {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('Quiz');
  const [selectedTaskToAssign, setSelectedTaskToAssign] = useState(null);
  const [selectedTaskToPreview, setSelectedTaskToPreview] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [deadline, setDeadline] = useState('');
  const [time, setTime] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewOverlay, setShowPreviewOverlay] = useState(false);
  const [givenTasks, setGivenTasks] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [sections, setSections] = useState([]);
  const [tasks, setTasks] = useState({ Quiz: [], Assignment: [] });
  const [description, setDescription] = useState('');


  useEffect(() => {
    if (!user) return;
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('teacher_id', user.id)
        .order("section_name", { ascending: true });
      if (error) console.error('Error fetching sections:', error);
      else setSections(data);
    };
    fetchSections();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchAssessments = async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('teacher_id', user.id);
      if (error) console.error('Error fetching assessments:', error);
      else {
        setTasks({
          Quiz: data.filter(d => d.type === 'Quiz'),
          Assignment: data.filter(d => d.type === 'Assignment'),
        });
        setSelectedTaskToAssign(null);
        setSelectedTaskToPreview(null);
      }
    };
    fetchAssessments();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchAssigned = async () => {
      const taskIds = [...tasks.Quiz, ...tasks.Assignment].map(t => t.id);
      if (taskIds.length === 0) {
        setGivenTasks([]);
        return;
      }
      const { data, error } = await supabase
        .from('assigned_assessments')
        .select('assessment_id, section_id')
        .in('assessment_id', taskIds);
      if (error) console.error('Error fetching assigned assessments:', error);
      else {
        const keys = data.map(({ assessment_id, section_id }) => `${assessment_id}-${section_id}`);
        setGivenTasks(keys);
      }
    };
    fetchAssigned();
  }, [tasks, user]);

  const handleGive = async () => {
    if (!selectedTaskToAssign || !selectedSection || !deadline || !time) {
      toast.error('Please complete all fields');
      return;
    }

    const secObj = sections.find(s => s.section_name === selectedSection);
    if (!secObj) return toast.error('Invalid section selected');

    const key = `${selectedTaskToAssign.id}-${secObj.id}`;
    if (givenTasks.includes(key)) {
      toast.info('Already assigned');
      return;
    }

    const { error } = await supabase.from('assigned_assessments').insert([{
      assessment_id: selectedTaskToAssign.id,
      section_id: secObj.id,
      deadline: `${deadline}T${time}`,
    }]);

    if (error) {
      toast.error(error.message);
      return;
    }

    setGivenTasks(prev => [...prev, key]);
    toast.success('Assessment assigned!');
  };

  const handleUngive = async () => {
    if (!selectedTaskToAssign || !selectedSection) {
      toast.error('Select task and section to unassign');
      return;
    }

    const secObj = sections.find(s => s.section_name === selectedSection);
    if (!secObj) return toast.error('Invalid section selected');

    const { error } = await supabase.from('assigned_assessments')
      .delete()
      .eq('assessment_id', selectedTaskToAssign.id)
      .eq('section_id', secObj.id);

    if (error) return toast.error(error.message);

    setGivenTasks(prev => prev.filter(k => k !== `${selectedTaskToAssign.id}-${secObj.id}`));
    toast.success('Assessment unassigned!');
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase.from('assessments').delete().eq('id', id);
    if (error) return toast.error(error.message);

    setTasks(prev => ({
      ...prev,
      [selectedTab]: prev[selectedTab].filter(t => t.id !== id),
    }));

    if (selectedTaskToPreview?.id === id) {
      setSelectedTaskToPreview(null);
      setShowPreviewOverlay(false);
    }

    toast.success('Task deleted!');
  };

  const openPreview = (task) => {
    setSelectedTaskToPreview(task);
    setShowPreviewOverlay(true);
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuestions(prevQuestions => {
      const newQuestions = [...prevQuestions];
      const questionToUpdate = { ...newQuestions[qIndex] };
      questionToUpdate[field] = value;
      newQuestions[qIndex] = questionToUpdate;
      return newQuestions;
    });
  };

  const handleRemoveQuestion = (qIndex) => {
    setQuestions(prevQuestions => prevQuestions.filter((_, index) => index !== qIndex));
  };



  const handleAddQuestion = () => {
  let newQuestion;

  if (questionType === 'Matching') {
    newQuestion = {
      question: '',
      activityType: 'Matching',
      matchingPairs: [{ left: '', right: '' }],
    };
  } else if (questionType === 'True or False') {
    newQuestion = {
      question: '',
      activityType: 'True or False',
      choices: ['True', 'False'],
      correctAnswer: '', 
    };
  } else {
    newQuestion = {
      question: '',
      activityType: questionType, 
      correctAnswer: '',
    };
    if (questionType === 'Multiple Choice') {
      newQuestion.choices = ['', '', '', ''];
    } else {
      delete newQuestion.choices; 
    }
  }

  setQuestions(prev => [...prev, newQuestion]);
};
const addMatchingPair = (qIndex) => {
  setQuestions(prev => {
    const newQs = [...prev];
    newQs[qIndex].matchingPairs.push({ left: '', right: '' });
    return newQs;
  });
};

const removeMatchingPair = (qIndex, pairIndex) => {
  setQuestions(prev => {
    const newQs = [...prev];
    newQs[qIndex].matchingPairs.splice(pairIndex, 1);
    return newQs;
  });
};

const updateMatchingPair = (qIndex, pairIndex, field, value) => {
  setQuestions(prev => {
    const newQs = [...prev];
    newQs[qIndex].matchingPairs[pairIndex][field] = value;
    return newQs;
  });
};

  const updateChoice = (qIndex, choiceIndex, value) => {
    setQuestions(prev => {
      const newQs = [...prev];
      if (newQs[qIndex].choices) {
        newQs[qIndex].choices[choiceIndex] = value;
      }
      return newQs;
    });
  };

  const saveAssessment = async () => {
    if (questions.length === 0) return toast.error('Add at least one question.');

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} text cannot be empty.`);
        return;
      }

      if (q.activityType === 'Multiple Choice') {
        if (!q.choices || q.choices.some(choice => !choice.trim())) {
          toast.error(`All choices for Question ${i + 1} (Multiple Choice) must be filled.`);
          return;
        }
        if (!q.correctAnswer.trim()) {
          toast.error(`Correct answer for Question ${i + 1} (Multiple Choice) must be set.`);
          return;
        }
        if (!q.choices.includes(q.correctAnswer)) {
            toast.error(`Correct answer for Question ${i + 1} must be one of the choices.`);
            return;
        }
      } else if (q.activityType === 'Matching') {
        if (!q.matchingPairs || q.matchingPairs.some(pair => !pair.left.trim() || !pair.right.trim())) {
          toast.error(`All items must be filled.`);
          return;
        }
      } else if (q.activityType === 'True or False') {
        if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
          toast.error(`Correct answer for Question ${i + 1} (True or False) must be selected.`);
          return;
        }
      } else { 
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          toast.error(`Correct answer for Question ${i + 1} (${q.activityType}) must be filled.`);
          return;
        }
      }
    }

    const title = prompt('Enter title for this assessment');
    if (!title) return toast.info('Assessment creation cancelled.');

    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        title,
        description,
        teacher_id: user.id,
        type: selectedTab,
        questions,
      }])
      .select();

    if (error) return toast.error(error.message);

    setTasks(prev => ({
      ...prev,
      [selectedTab]: [...prev[selectedTab], data[0]],
    }));

    setShowCreateModal(false);
    setQuestions([]);
    setDescription('');
    toast.success('Assessment saved!');
  };

  return (
    <div className="assessment-container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <Sidebar />
      <div className="assessment-header">Activities</div>

      <div className="tab-toggle">
        {['Quiz', 'Assignment'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${selectedTab === tab ? 'active' : ''}`}
            onClick={() => {
              setSelectedTab(tab);
              setSelectedTaskToAssign(null);
              setSelectedTaskToPreview(null);
              setShowPreviewOverlay(false);
            }}
          >
            {tab}
          </button>
        ))}
        <button className="add-btn" onClick={() => setShowCreateModal(true)}>
          <FiPlus /> Add {selectedTab}
        </button>
      </div>

      <div className="assessment-content" style={{ display: 'flex', gap: '20px' }}>

        <div className="task-list" style={{ flex: 1 }}>
          <h3>Assign {selectedTab}</h3>
          {tasks[selectedTab].length === 0 ? (
            <div>No {selectedTab.toLowerCase()} found.</div>
          ) : (
            tasks[selectedTab].map(task => (
              <div
                key={task.id}
                className={`task-item ${selectedTaskToAssign?.id === task.id ? 'selected' : ''}`}
                onClick={() => setSelectedTaskToAssign(task)}
                style={{ cursor: 'pointer' }}
                title={task.title}
              >
                {task.title}
              </div>
            ))
          )}
        </div>

        <div className="section-container">
          <div className="section-header">Section</div>
          <select
            className="section-select"
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
          >
            <option value="">Select Section</option>
            {sections.map(s => (
              <option key={s.id} value={s.section_name}>{s.section_name}</option>
            ))}
          </select>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">Set Deadline</div>
          <input
            className="date-input"
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <input
            className="time-input"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <button className="give-button" onClick={handleGive}>Give</button>
          <button
            className="give-button"
            style={{ backgroundColor: '#ef4444', marginTop: '10px' }}
            onClick={handleUngive}
          >
            Ungive
          </button>
        </div>

        <div className="task-list preview-list" style={{ flex: 1 }}>
          <h3>Preview {selectedTab}</h3>
          {tasks[selectedTab].length === 0 ? (
            <div>No {selectedTab.toLowerCase()} found.</div>
          ) : (
            tasks[selectedTab].map(task => (
              <div
                key={task.id}
                className={`task-item ${selectedTaskToPreview?.id === task.id ? 'selected' : ''}`}
                onClick={() => openPreview(task)}
                style={{ cursor: 'pointer' }}
                title={task.title}
              >
                {task.title}
                <button
                  className="delete-task-btn"
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteTask(task.id);
                  }}
                  title="Delete Task"
                  style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer', color: 'red', marginTop: 0 }}
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {showPreviewOverlay && selectedTaskToPreview && (
        <div
          className="overlay"
          onClick={() => setShowPreviewOverlay(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="preview-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '800px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative', 
            }}
          >
            <button
              onClick={() => setShowPreviewOverlay(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#333',
              }}
            >
              &times; 
            </button>
            <h2>{selectedTaskToPreview.title}</h2>

            {/* DESCRIPTION */}
            {selectedTaskToPreview.description && (
              <p style={{ fontStyle: 'italic', color: '#555' }}>
                {selectedTaskToPreview.description}
              </p>
            )}

            {/* QUESTIONS */}
            {selectedTaskToPreview.questions?.map((q, idx) => (
            <div key={idx} style={{ marginBottom: '15px' }}>
              <b>Q{idx + 1} ({q.activityType}):</b> {q.question}

              {q.activityType === 'Multiple Choice' && (
                <ul>
                  {q.choices.map((c, i) => (
                    <li key={i} style={{ color: c === q.correctAnswer ? 'green' : 'inherit' }}>
                      {c}
                    </li>
                  ))}
                </ul>
              )}

              {q.activityType === 'True or False' && (
                <div>
                  Answer: <span style={{ color: '#4CAF50' }}>{q.correctAnswer}</span>
                </div>
              )}

              {q.activityType === 'Matching' && q.matchingPairs && q.matchingPairs.length > 0 && (
                <>
                  <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <strong>Correct Pairs:</strong>
                    <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                      {q.matchingPairs.map((pair, pairIdx) => (
                        <li key={`correct-pair-${idx}-${pairIdx}`}>{pair.left} &rarr; {pair.right}</li>
                      ))}
                    </ul>
                  </div>
                <MatchingQuestionPreviewDND question={q} questionIndex={idx} />
                </>
              )}

          {q.activityType !== 'Matching' && q.activityType !== 'True or False' && ( 
          <div>
            <label>
              Correct Answer:
              <input
                type="text"
                value={q.correctAnswer}
                readOnly 
                style={{ width: '97%' }}
              />
            </label>
          </div>
          )}
            </div> 
            ))} 
          </div>
        </div> 
      )} 
          
      {showCreateModal && (
        <div
          className="overlay"
          onClick={() => setShowCreateModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            marginLeft: 250,
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              width: '90%',
            }}
          >
           <h2>Create {selectedTab}</h2>
            <label>Description:</label>
            <textarea
              style={{ width: '100%', marginBottom: '10px', height: '80px' }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div>
              <label>
                Question Type:&nbsp;
                <select
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value)}
                >
                  <option>Multiple Choice</option>
                  <option>Short Answer</option>
                  <option>Matching</option>
                  <option>True or False</option>
                  <option>Fill in the Blanks</option>
                </select>
              </label>
            </div>

            <div className="questions-container" style={{ marginTop: '20px' }}>

              {questions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #ccc',
                    padding: '15px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => handleRemoveQuestion(idx)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'red',
                      fontSize: '18px',
                    }}
                    title="Remove Question"
                  >
                    <FiTrash2 />
                  </button>

                  <div>
                    <label>
                      Question:
                      <input
                        type="text"
                        value={q.question}
                        onChange={e => updateQuestion(idx, 'question', e.target.value)}
                        style={{ width: '97%' , marginTop: '15px'}}
                      />
                    </label>
                  </div>

                  {q.activityType === 'Multiple Choice' && (
                    <div>
                      <label>Choices:</label>
                      {q.choices.map((choice, i) => (
                        <input
                          key={i}
                          type="text"
                          value={choice}
                          placeholder={`Choice ${i + 1}`}
                          onChange={e => updateChoice(idx, i, e.target.value)}
                          style={{ display: 'block', width: '97%', marginBottom: '5px' }}
                        />
                      ))}
                    </div>
                  )}
                  {q.activityType === 'Matching' && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Matching Pairs (Prompt and its Correct Answer):</label>
                    {q.matchingPairs.map((pair, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                        <input
                          type="text"
                          value={pair.left}
                          placeholder="Item"
                          onChange={e => updateMatchingPair(idx, i, 'left', e.target.value)}
                          style={{ width: '45%' }}
                        />
                        <input
                          type="text"
                          value={pair.right}
                          placeholder="Match"
                          onChange={e => updateMatchingPair(idx, i, 'right', e.target.value)}
                          style={{ width: '45%' }}
                        />
                        <button type="button" onClick={() => removeMatchingPair(idx, i)} title="Remove Pair" style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}><FiTrash2 /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addMatchingPair(idx)} style={{ marginTop: '5px', padding: '5px 10px' }}>
                      <FiPlus /> Add Pair
                    </button>
                  </div>
                )}

                {q.activityType === 'True or False' && (
                  <div>
                    <p style={{ marginTop: '10px' }}>Correct Answer:</p>
                    <button
                      style={{
                        backgroundColor: q.correctAnswer === 'True' ? '#4CAF50' : '#ccc',
                        color: '#fff',
                        marginRight: '5px',
                        padding: '5px 10px',
                        borderRadius: '3px',
                      }}
                      onClick={() => updateQuestion(idx, 'correctAnswer', 'True')}
                    >
                      True
                    </button>
                    <button
                      style={{
                        backgroundColor: q.correctAnswer === 'False' ? '#f44336' : '#ccc',
                        color: '#fff',
                        padding: '5px 10px',
                        borderRadius: '3px',
                      }}
                      onClick={() => updateQuestion(idx, 'correctAnswer', 'False')}
                    >
                      False
                    </button>
                  </div>
                )}

                  {q.activityType !== 'Matching' && q.activityType !== 'True or False' && (
                    <label>
                      Correct Answer:
                      <input
                        type="text"
                        value={q.correctAnswer}
                        onChange={e => updateQuestion(idx, 'correctAnswer', e.target.value)}
                        style={{ width: '97%' }}
                      />
                    </label>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddQuestion}
                style={{ marginTop: '10px', color: 'white', padding: '10px', borderRadius: '5px' }}
              >
                <FiPlus /> Add Question
              </button>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{ marginRight: '10px', padding: '8px 16px' }}
              >
                Cancel
              </button>
              <button
                onClick={saveAssessment}
                style={{ padding: '8px 16px', color: 'white' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
