import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import defaultProfile from '/public/default_profile.png';
import '../styles/detailedChatView.css';

const DetailedChatView = () => {
  const { otherUserId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [fetchMessagesError, setFetchMessagesError] = useState(null);
  const [otherUserDetails, setOtherUserDetails] = useState(null);
  const [otherUserError, setOtherUserError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendMessageError, setSendMessageError] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedFileForUpload, setSelectedFileForUpload] = useState(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState(null); // For image previews
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOtherUserDetails = useCallback(async () => {
    if (!otherUserId) return;
    setOtherUserError(null);
    setOtherUserDetails(null);

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, profile_picture')
      .eq('id', otherUserId)
      .single();

    if (error) {
      console.error('Error fetching other user details:', error);
      setOtherUserError('Failed to load user details. User may not exist.');
    } else if (!data) {
      console.error('Other user not found:', otherUserId);
      setOtherUserError('Chat partner not found.');
    } else {
      setOtherUserDetails(data);
    }
  }, [otherUserId]);

  const markMessagesAsRead = useCallback(async () => {
    if (!user || !otherUserId) return;
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('sender_id', otherUserId)
        .eq('read', false);

      if (error) console.error('Error marking messages as read:', error);
    } catch (err) {
      console.error('Exception marking messages as read:', err);
    }
  }, [user, otherUserId]);

  const fetchMessages = useCallback(async () => {
    if (!user || !otherUserId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }
    setLoadingMessages(true);
    setFetchMessagesError(null);
    const { data, error } = await supabase
      .from('messages') // Ensure your select includes new file_url and file_name fields
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      setFetchMessagesError(error.message || 'Failed to fetch messages.');
      setMessages(data || []);
    } else {
      setMessages(data || []);
      markMessagesAsRead();
    }
    setLoadingMessages(false);
  }, [user, otherUserId, markMessagesAsRead]);

 useEffect(() => {
    fetchOtherUserDetails();
    fetchMessages();
  }, [fetchOtherUserDetails, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user || !otherUserId || !otherUserDetails || otherUserError) return;

    const ids = [user.id, otherUserId].sort();
    const canonicalChannelName = `chat:${ids[0]}:${ids[1]}`;

    const channel = supabase
      .channel(canonicalChannelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const newMessagePayload = payload.new;
        if (
          (newMessagePayload.sender_id === user.id && newMessagePayload.receiver_id === otherUserId) ||
          (newMessagePayload.sender_id === otherUserId && newMessagePayload.receiver_id === user.id)
        ) { 
         setMessages(prevMessages => {
            // Avoid duplicating messages if already added optimistically and finalized
            const messageExists = prevMessages.some(msg => msg.id === newMessagePayload.id && !msg.isOptimistic);
            if (messageExists) {
              return prevMessages;
            }
            // If an optimistic message with the same content signature (e.g. temp ID) exists, replace it.
            // For simplicity here, we'll rely on the sender's flow to replace its own optimistic message.
            // This primarily adds messages from the other user or new messages not yet in state.
            return [...prevMessages, newMessagePayload];
          });
          if (newMessagePayload.receiver_id === user.id && newMessagePayload.sender_id === otherUserId) markMessagesAsRead();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, otherUserId, otherUserDetails, otherUserError, markMessagesAsRead]);

  const handleFileIconClick = () => {
    fileInputRef.current?.click();
  };

  // Stages the file, doesn't upload immediately
  const handleFileSelected = (event) => {
    const file = event.target.files?.[0];
    if (event.target) { // Reset file input
      event.target.value = null;
    }
    if (!file) {
      // If no file is selected (e.g., user cancels file dialog), clear any existing staged file
      // setSelectedFileForUpload(null); // Or keep existing if user cancels
      // setSelectedFilePreview(null);
      return;
    }

    setSelectedFileForUpload(file);
    setFileUploadError(null); // Clear previous errors
    setSendMessageError(null);

    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFilePreview(null); // Not an image or no preview
    }
  };

  const clearSelectedFile = () => {
    setSelectedFileForUpload(null);
    setSelectedFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  // Handles sending either a staged file (with optional caption) or a text message
  const handleSendMessage = async e => {
    e.preventDefault();
    if (!user || !otherUserId) return;

    if (selectedFileForUpload) {
      setIsUploadingFile(true);
      setFileUploadError(null);
      setSendMessageError(null);

      const file = selectedFileForUpload;
      const caption = newMessage.trim();

      try {
        const BUCKET_NAME = 'message-attachments';
        const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `public/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file);

        if (uploadError) throw new Error(`Storage error: ${uploadError.message}`);

        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        if (!urlData || !urlData.publicUrl) throw new Error('Could not retrieve public URL for the file.');
        
        const publicURL = urlData.publicUrl;
        const messageContent = caption || `File: ${file.name}`;

        const { data: dbMessage, error: messageError } = await supabase
          .from('messages')
          .insert([{
            sender_id: user.id,
            receiver_id: otherUserId,
            content: messageContent,
            file_url: publicURL,
            file_name: file.name,
          }])
          .select()
          .single();

        if (messageError) throw messageError;

        if (dbMessage) {
          setMessages(prevMessages => [...prevMessages, dbMessage]);
          scrollToBottom();
        } else {
          console.warn('File uploaded and DB insert attempted, but no message data returned.');
          setFileUploadError('Failed to finalize file message. Please try again.');
        }
        clearSelectedFile();
        setNewMessage('');
      } catch (error) {
        console.error('Error sending file:', error);
        setFileUploadError(`Failed to send file: ${error.message}`);
      } finally {
        setIsUploadingFile(false);
      }
    } else if (newMessage.trim()) {
      setSendingMessage(true);
      setSendMessageError(null);
      setFileUploadError(null);

      const tempId = crypto.randomUUID();
      const optimisticMessage = {
        id: tempId,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        read: false,
        isOptimistic: true,
      };
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      const messageToSend = newMessage.trim();
      setNewMessage('');
      scrollToBottom();

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: otherUserId,
          content: messageToSend,
        }])
        .select()
        .single();

      setSendingMessage(false);

      if (error) {
        console.error('Error sending message:', error);
        setSendMessageError('Failed to send message. Please try again.');
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== optimisticMessage.id));
      } else if (data) {
        setMessages(prevMessages => prevMessages.map(msg => (msg.id === optimisticMessage.id ? data : msg)));
      }
    }
  };

  // This function is removed as its logic is now part of handleSendMessage when selectedFileForUpload exists
  // const handleFileSelectedAndUpload = async (event) => {
  // ... old immediate upload logic ...
  // };

  // (If you had a separate function for immediate upload, ensure it's removed or refactored out)
  // For example, the previous diff's handleFileSelected was doing immediate upload.
  // That logic is now integrated into the `if (selectedFileForUpload)` block of `handleSendMessage`.
  // The new `handleFileSelected` above only stages the file.

  // If the user cancels the file dialog, this function is called.
  // `selectedFileForUpload` will be null if they cancel after previously selecting a file.
  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileSelected(event); // Call the staging function
  };

  if (otherUserError) {
    return (
      <div className="detailed-chat-container">
        <Sidebar />
        <main className="detailed-chat-main">
          <header className="detailed-chat-header">
            <button onClick={() => navigate('/messages')} className="back-button">
              Back
            </button>
            <h2>Chat Error</h2>
          </header>
          <div className="messages-area error-message">{otherUserError}</div>
        </main>
      </div>
    );
  }

  if (!otherUserDetails) return <div className="loading-chat">Loading chat...</div>;

  return (
    <div className="detailed-chat-container">
      <Sidebar />
      <main className="detailed-chat-main">
        <header className="detailed-chat-header">
          <button onClick={() => navigate('/messages')} className="back-button">
            Back
          </button>
          <img
            src={otherUserDetails.profile_picture || defaultProfile}
            alt={otherUserDetails.first_name || 'User'}
            className="chat-header-avatar"
            onError={e => {
              e.target.onerror = null;
              e.target.src = defaultProfile;
            }}
          />
          <h2>
            {otherUserDetails.first_name} {otherUserDetails.last_name}
          </h2>
        </header>

        <div className="messages-area">
          {loadingMessages && messages.length === 0 && <p className="info-message">Loading messages...</p>}
          {!loadingMessages && fetchMessagesError && <p className="error-message">Error: {fetchMessagesError}</p>}
          {!loadingMessages && !fetchMessagesError && messages.length === 0 && (
            <p className="info-message">No messages yet. Start the conversation!</p>
          )}
        {!fetchMessagesError && messages.map(msg => {
            const isFileMessage = msg.file_url && msg.file_name;
            const isImageFile = isFileMessage && /\.(jpeg|jpg|gif|png|webp)$/i.test(msg.file_name);

            return (
              <div key={msg.id} className={`message-bubble ${msg.sender_id === user?.id ? 'sent' : 'received'} ${msg.isOptimistic ? 'optimistic' : ''}`}>
                {msg.isOptimistic && msg.file_name ? (
                  <div className="message-content optimistic-file-upload">
                    <p><em>{msg.content || `Uploading ${msg.file_name}...`}</em></p>
                    {/* You could add a small spinner here */}
                  </div>
                ) : isFileMessage ? (
                  <div className="message-content file-message-content">
                    {isImageFile ? (
                       // For optimistic images, msg.file_url might be a local blob URL if you implement that
                      // For now, it will only show once the real URL is available
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
                        <img src={msg.file_url} alt={msg.file_name} className="message-image-attachment" />
                        <p>{msg.file_name}</p>
                      </a>
                    ) : (
                      <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="file-attachment-link">
                        📄 {msg.file_name || 'View Attached File'}
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="message-content">{msg.content}</p>
                )}
                <span className="message-timestamp">
                  {new Date(msg.created_at).toLocaleTimeString('en-US', {
                    hour: 'numeric', // Use 'numeric' for no leading zero, '2-digit' for leading zero
                    minute: '2-digit',
                    timeZone: 'Asia/Manila',
                    hour12: true,
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {sendMessageError && <p className="error-message send-error-message">{sendMessageError}</p>}
        {fileUploadError && <p className="error-message send-error-message">{fileUploadError}</p>}
        {isUploadingFile && <p className="info-message">Uploading file, please wait...</p>}

        {/* Display staged file preview */}
        {selectedFileForUpload && (
          <div className="staged-file-preview-container">
            {selectedFilePreview ? (
              <img src={selectedFilePreview} alt="Preview" className="staged-file-image-preview" />
            ) : (
              <div className="staged-file-icon">📄</div>
            )}
            <span className="staged-file-name">{selectedFileForUpload.name}</span>
            <button type="button" onClick={clearSelectedFile} className="clear-staged-file-button" aria-label="Remove selected file" disabled={isUploadingFile}>
              &times;
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="message-input-form">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none'}}
            onChange={handleFileInputChange} // Changed to use the new handler
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" // Customize accepted file types
          />
         <button type="button" onClick={handleFileIconClick} className="attach-file-button" disabled={isUploadingFile || sendingMessage} title="Attach file" aria-label="Attach file"> 📎
          </button>
          <input 
            className="type"
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={selectedFileForUpload ? "Add a caption (optional)..." : "Type a message..."}
            disabled={sendingMessage || isUploadingFile}
          />
          <button
            type="submit"
            disabled={
              sendingMessage || 
              isUploadingFile || 
              (!newMessage.trim() && !selectedFileForUpload) // Disabled if no text AND no file staged
            }
          >
            {isUploadingFile ? 'Uploading...' : sendingMessage ? 'Sending...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default DetailedChatView;
