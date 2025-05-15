import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import '../styles/Handouts.css';
import Sidebar from './Sidebar';

const Handouts = () => {
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);

  const fetchLessonsAndTopics = async () => {
    try {
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .order('title', { ascending: true });

      if (lessonError) throw lessonError;
      setLessons(lessonData);

      const { data: topicData, error: topicError } = await supabase
        .from('topics')
        .select('*');

      if (topicError) throw topicError;
      setTopics(topicData);
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  };

  useEffect(() => {
    fetchLessonsAndTopics();

    const lessonsChannel = supabase
      .channel('lessons-sub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, handleLessonChange)
      .subscribe();

    const topicsChannel = supabase
      .channel('topics-sub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, handleTopicChange)
      .subscribe();

    return () => {
      supabase.removeChannel(lessonsChannel);
      supabase.removeChannel(topicsChannel);
    };
  }, []);

  const handleLessonChange = ({ eventType, new: newLesson, old: oldLesson }) => {
    setLessons(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newLesson];
        case 'UPDATE':
          return prev.map(lesson => lesson.id === newLesson.id ? newLesson : lesson);
        case 'DELETE':
          return prev.filter(lesson => lesson.id !== oldLesson.id);
        default:
          return prev;
      }
    });
  };

  const handleTopicChange = ({ eventType, new: newTopic, old: oldTopic }) => {
    setTopics(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newTopic];
        case 'UPDATE':
          return prev.map(topic => topic.id === newTopic.id ? newTopic : topic);
        case 'DELETE':
          return prev.filter(topic => topic.id !== oldTopic.id);
        default:
          return prev;
      }
    });
  };

  const handleComplete = async (index) => {
    const lesson = lessons[index];
    if (!lesson) return;

    try {
      await supabase.from('lessons').update({ completed: true }).eq('id', lesson.id);

      const nextLesson = lessons[index + 1];
      if (nextLesson) {
        await supabase.from('lessons').update({ unlocked: true }).eq('id', nextLesson.id);
      }

      fetchLessonsAndTopics();
    } catch (error) {
      console.error('Error updating lesson:', error.message);
    }
  };

  const getTopicsForLesson = (lessonId) =>
    topics.filter(topic => String(topic.lesson_id) === String(lessonId));

  return (
    <div className="handouts-layout">
      <Sidebar />
      <main className="handouts-content">
        <div className="handouts-header">
          <h2 className="section-title">Handouts</h2>
        </div>

        <div className="lessons-grid">
          {lessons.map((lesson, index) => {
            const relatedTopics = getTopicsForLesson(lesson.id);
            return (
              <div key={lesson.id} className={`lesson-card ${lesson.unlocked ? '' : 'locked'}`}>
                {!lesson.unlocked && (
                  <div className="locked-overlay">
                    <div className="lock-icon" title="Locked 🔒" />
                  </div>
                )}

                <div className="lesson-header">
                  <h3>{lesson.title}</h3>
                  {lesson.completed && <span className="completed-label">Completed</span>}
                </div>

                <div className="topics-section">
                  {relatedTopics.length > 0 ? (
                    <ul className="topic-title-list">
                      {relatedTopics.map(topic => (
                        <li key={topic.id}>{topic.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-topics-msg">Programming Paradigms.</p>
                  )}

                  {lesson.unlocked && !lesson.completed && (
                    <button className="complete-btn" onClick={() => handleComplete(index)}>
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Handouts;
