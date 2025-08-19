import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { supabase } from '../utils/supabaseClient'; 
import '../styles/Handouts.css';

const Handouts = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLessonsAndTopics = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, title') 
          .order('created_at', { ascending: true });

        if (lessonsError) throw lessonsError;

        const lessonsWithTopics = await Promise.all(
          lessonsData.map(async (lesson) => {
            const { data: topicsData, error: topicsError } = await supabase
              .from('topics')
              .select('id, title')
              .eq('lesson_id', lesson.id)
              .order('created_at', { ascending: true });

            if (topicsError) console.warn(`Error fetching topics for lesson ${lesson.id}:`, topicsError.message);
            return { ...lesson, topics: topicsData || [] };
          })
        );
        setLessons(lessonsWithTopics);
      } catch (err) {
        console.error('Error fetching handouts data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsAndTopics();
  }, []);

  const handleLessonClick = (lessonId) => {
    navigate(`/lesson/${lessonId}`);
  };

  return (
    <div className="handouts-layout">
      <Sidebar />
      <main className="handouts-content">
        <div className="handouts-header">
          <h2 className="section-title">Handouts</h2>
        </div>

        {loading && <p>Loading lessons...</p>}
        {error && <p style={{ color: 'red' }}>Error loading lessons: {error}</p>}
        {!loading && !error && (
          <div className="lessons-grid">
            {lessons.length === 0 ? (
              <p>No lessons available yet.</p>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="lesson-card"
                  onClick={() => handleLessonClick(lesson.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="lesson-header">
                    <h3>{lesson.title}</h3>
                  </div>

                  {lesson.topics && lesson.topics.length > 0 && (
                    <div className="topics-section">
                      <ul className="topic-title-list">
                        {lesson.topics.map((topic) => (
                          <li key={topic.id}>{topic.title}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Handouts;
