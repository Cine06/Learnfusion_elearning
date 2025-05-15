import React, { useState } from 'react';
import '../styles/message.css';
import Sidebar from "./Sidebar";

const Message = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [messageBody, setMessageBody] = useState('');

  const handleSend = () => {
    alert('Message sent!');
    setTo('');
    setCc('');
    setMessageBody('');
  };

  return (
    <div className="message-container">
      <Sidebar />
      <h2 className="message-title">Messages</h2>

      <div className="message-tabs">
        <button className={activeTab === 'inbox' ? 'active' : ''} onClick={() => setActiveTab('inbox')}>📥 Inbox</button>
        <button className={activeTab === 'sent' ? 'active' : ''} onClick={() => setActiveTab('sent')}>📤 Sent</button>
        <button className={activeTab === 'new' ? 'active' : ''} onClick={() => setActiveTab('new')}>✉️ New Message</button>
      </div>

      <div className="message-card">
        {activeTab === 'inbox' && (
          <div className="tab-content fadeIn">
            <h3 className="subheading">Inbox</h3>
            <p className="placeholder">No new messages.</p>
          </div>
        )}

        {activeTab === 'sent' && (
          <div className="tab-content fadeIn">
            <h3 className="subheading">Sent Messages</h3>
            <p className="placeholder">You haven’t sent any messages yet.</p>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="tab-content fadeIn">
            <h3 className="subheading">New Message</h3>
            <form className="message-form" onSubmit={(e) => e.preventDefault()}>
              <label>
                To:
                <input
                  type="text"
                  placeholder="name"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </label>

              <label>
                CC:
                <input
                  type="text"
                  placeholder="Add others (optional)"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
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
                <button className="send-btn" onClick={handleSend}>Send</button>
                <button className="cancel-btn" onClick={() => {
                  setTo('');
                  setCc('');
                  setMessageBody('');
                  setActiveTab('inbox');
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
