import React, { useState, useEffect, useCallback } from 'react';
import '../styles/message.css';
import Sidebar from "./Sidebar";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import defaultProfile from "/public/default_profile.png"; // Assuming you have a default profile image

const Message = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize useNavigate
  const [activeTab, setActiveTab] = useState('inbox');
  const [recipientIdentifier, setRecipientIdentifier] = useState(''); // For email or school_id
  const [recipientSearchQuery, setRecipientSearchQuery] = useState('');
  const [recipientSuggestions, setRecipientSuggestions] = useState([]);
  const [selectedRecipientUser, setSelectedRecipientUser] = useState(null);
  const [messageBody, setMessageBody] = useState('');
  const [conversations, setConversations] = useState([]); // Changed from inboxMessages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // General error
  const [searchError, setSearchError] = useState(''); // Specific for recipient search

  const fetchMessages = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'inbox') {
        const { data: allMessages, error: fetchError } = await supabase
          .from('messages')
          .select(`
            id, content, created_at, read, sender_id, receiver_id,
            sender:sender_id (id, first_name, last_name, profile_picture),
            receiver:receiver_id (id, first_name, last_name, profile_picture)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const conversationsMap = new Map();
        (allMessages || []).forEach(msg => {
          const otherParty = msg.sender_id === user.id ? msg.receiver : msg.sender;
          // Ensure otherParty and its id are valid
          if (!otherParty || !otherParty.id) {
            console.warn("Skipping message due to missing other party data:", msg);
            return;
          }

          const conversationId = otherParty.id;

          if (!conversationsMap.has(conversationId) || new Date(msg.created_at) > new Date(conversationsMap.get(conversationId).latestMessage.created_at)) {
            conversationsMap.set(conversationId, {
              otherUser: {
                id: otherParty.id,
                first_name: otherParty.first_name,
                last_name: otherParty.last_name,
                profile_picture: otherParty.profile_picture,
              },
              latestMessage: {
                id: msg.id,
                content: msg.content,
                created_at: msg.created_at,
                sender_id: msg.sender_id,
                read: msg.read,
              },
              unreadCount: 0,
            });
          }
        });

        (allMessages || []).forEach(msg => {
          if (msg.receiver_id === user.id && !msg.read) {
            const conversation = conversationsMap.get(msg.sender_id); // Key is the other user's ID
            if (conversation) {
              conversation.unreadCount += 1;
            }
          }
        });

        const conversationList = Array.from(conversationsMap.values())
          .sort((a, b) => new Date(b.latestMessage.created_at) - new Date(a.latestMessage.created_at));
        setConversations(conversationList);
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab} messages:`, err.message);
      setError(`Failed to load ${activeTab} messages. ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

  // Debounced search for recipients
  useEffect(() => {
    if (selectedRecipientUser) { // Don't search if a recipient is already selected
      setRecipientSuggestions([]);
      return;
    }
    if (recipientSearchQuery.trim().length < 2) {
      setRecipientSuggestions([]);
      setSearchError('');
      return;
    }

    const searchUsers = async () => {
      setLoading(true); // Can use a more specific loading state if preferred
      setSearchError('');
      try {
        const searchTerm = `%${recipientSearchQuery.trim()}%`;
        const { data, error: searchDbError } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, school_id, profile_picture')
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},school_id.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .neq('id', user.id) // Exclude self
          .limit(5);

        if (searchDbError) throw searchDbError;
        setRecipientSuggestions(data || []);
        if (!data || data.length === 0) {
          setSearchError('No users found.');
        }
      } catch (err) {
        console.error("Error searching recipients:", err.message);
        setSearchError('Failed to search users.');
        setRecipientSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      searchUsers();
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(debounceTimer);
  }, [recipientSearchQuery, user?.id, selectedRecipientUser]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSend = async () => {
    if (!selectedRecipientUser) {
      setError("Please select a recipient.");
      return;
    }
    if (!messageBody.trim()) {
      setError("Message body cannot be empty.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Insert message
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: selectedRecipientUser.id,
          content: messageBody.trim(),
        });

      if (insertError) throw insertError;

      alert('Message sent!');
      setRecipientIdentifier('');
      setRecipientSearchQuery('');
      setMessageBody('');
      setSelectedRecipientUser(null);
      setActiveTab('inbox'); // Switch to inbox tab after sending
      fetchMessages(); // Refresh messages, which will now fetch sent messages
    } catch (err) {
      console.error("Error sending message:", err.message);
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientSelect = (recipient) => {
    setSelectedRecipientUser(recipient);
    setRecipientIdentifier(`${recipient.first_name} ${recipient.last_name} (${recipient.email || recipient.school_id})`);
    setRecipientSearchQuery(''); // Clear search query
    setRecipientSuggestions([]); // Clear suggestions
  };

  return (
    <div className="message-container">
      <Sidebar />
      <h2 className="message-title">Messages</h2>

      <div className="message-tabs">
        <button className={activeTab === 'inbox' ? 'active' : ''} onClick={() => setActiveTab('inbox')}>📥 Inbox</button>
        <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>✉️ New Message</button>
      </div>

      <div className="message-card">
        {error && <p className="error-message" style={{color: 'red', textAlign: 'center', marginBottom: '1rem'}}>{error}</p>}

        {activeTab === 'inbox' && (
          <div className="tab-content fadeIn">
            <h3 className="subheading">Inbox</h3>
            {loading && <p className="placeholder">Loading conversations...</p>}
            {!loading && conversations.length === 0 && <p className="placeholder">No conversations yet.</p>}
            {!loading && conversations.map(conv => ( // Navigate to a detailed chat view
              <div 
                key={conv.otherUser.id} 
                className="message-item conversation-item" 
                onClick={() => navigate(`/messages/chat/${conv.otherUser.id}`)}
              >
                <img 
                  src={conv.otherUser?.profile_picture || defaultProfile} 
                  alt={`${conv.otherUser?.first_name || 'User'}'s avatar`}
                  className="message-avatar"
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultProfile; }}
                />
                <div className="message-details">
                  <p><strong>{conv.otherUser?.first_name || 'Unknown'} {conv.otherUser?.last_name || 'User'}</strong>
                  {conv.unreadCount > 0 && <span className="unread-badge">{conv.unreadCount}</span>}
                  </p>
                  <p className={`message-content-snippet ${conv.latestMessage.sender_id !== user.id && !conv.latestMessage.read ? 'unread-message' : ''}`}>
                    {conv.latestMessage.sender_id === user.id && "You: "}
                    {conv.latestMessage.content.substring(0, 70)}{conv.latestMessage.content.length > 70 ? '...' : ''}
                  </p>
                  <p className="message-timestamp">
                    {new Date(conv.latestMessage.created_at).toLocaleString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Manila',
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'new' && (
          <div className="tab-content fadeIn">
            <h3 className="subheading">New Message</h3>
            <form className="message-form" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
              <label>
                To:
                <div className="recipient-search-container">
                  <input
                    type="text"
                    placeholder="Search by Name, Email, or School ID"
                    value={selectedRecipientUser ? recipientIdentifier : recipientSearchQuery}
                    onChange={(e) => {
                      if (selectedRecipientUser) { // If a user is selected, this input is for display
                        return;
                      }
                      setRecipientSearchQuery(e.target.value);
                      setRecipientIdentifier(e.target.value); // Keep this for potential direct ID/email use if needed
                    }}
                    disabled={!!selectedRecipientUser} // Disable if a recipient is fully selected
                  />
                  {selectedRecipientUser && (
                    <button type="button" onClick={() => {
                      setSelectedRecipientUser(null);
                      setRecipientIdentifier('');
                      setRecipientSearchQuery('');
                    }} className="clear-recipient-btn">Clear</button>
                  )}
                  {recipientSuggestions.length > 0 && !selectedRecipientUser && (
                    <ul className="recipient-suggestions">
                      {recipientSuggestions.map(sugg => (
                        <li key={sugg.id} onClick={() => handleRecipientSelect(sugg)}>
                          <img src={sugg.profile_picture || defaultProfile} alt="avatar" className="suggestion-avatar" />
                          {sugg.first_name} {sugg.last_name} ({sugg.school_id || sugg.email})
                        </li>
                      ))}
                    </ul>
                  )}
                  {searchError && <p className="search-error-message">{searchError}</p>}
                </div>
              </label>

              <label>
                Message:
                <textarea
                  rows="6"
                  placeholder="Write your message..."
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                ></textarea>
              </label>

              <div className="message-controls">
                <button type="submit" className="send-btn" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
                <button className="cancel-btn" onClick={() => {
                  setSelectedRecipientUser(null);
                  setRecipientIdentifier('');
                  setRecipientSearchQuery('');
                  setMessageBody('');
                  setActiveTab('inbox');
                  setError('');
                }}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
