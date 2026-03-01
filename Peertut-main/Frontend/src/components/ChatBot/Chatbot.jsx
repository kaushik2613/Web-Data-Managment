import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader } from 'lucide-react';
import styles from './Chatbot.module.css';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const MOCK_RESPONSES = [
  "Let's explore that! Could you tell me what part you're finding tricky? 🤔",
  "That's a great question! Imagine it like this... 🧠",
  "Good thinking! Let me explain that step by step 📚",
  "Let's break this down together so it makes more sense 😄"
];

const getRandomMock = () =>
  MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];

// ✨ Helper: Clean markdown-like symbols from Gemini output
const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/[*_#`~>]/g, '') // remove markdown-style characters
    .replace(/\n{2,}/g, '\n') // compress excessive newlines
    .trim();
};

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "🎓 Hey there! I’m your AI Tutor — ready to make learning fun and easy. What topic shall we dive into today?",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput("");

    let botResponse = "";

    // 🧑‍🏫 Tutor system prompt
    const tutorPrompt = `
You are a fun and friendly AI tutor who makes learning enjoyable and engaging.
Teach every concept clearly and patiently, adding humor, relatable jokes, and playful analogies 🤹‍♀️.
Break complex ideas into simple steps, like you're teaching a curious beginner who loves to laugh while learning.
Use storytelling, emojis, and witty examples where appropriate 🎨.
When explaining code, include well-commented snippets and fun analogies about how the logic works.
Keep your tone light, encouraging, and enthusiastic — like a fun teacher who makes every topic exciting and easy to understand.
Avoid sarcasm or negativity. Always make the student feel smart and confident. 🌟
Keep answer concise and to the point in 5 linex max, but never boring!
`;

    if (GOOGLE_API_KEY) {
      try {
        const res = await fetch(GEMINI_API_URL, {
          method: "POST",
          headers: {
            "x-goog-api-key": GOOGLE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: tutorPrompt }] },
              { parts: [{ text: input }] }
            ]
          }),
        });

        const data = await res.json();
        botResponse =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Hmm, I didn’t quite get that — can you rephrase it? 🤔";

        botResponse = cleanText(botResponse);
      } catch (error) {
        console.error("API error:", error);
        botResponse = "⚠️ I had trouble connecting to the tutor service. Let’s try again!";
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      botResponse = getRandomMock();
    }

    setMessages(m => [...m, { from: "bot", text: botResponse, timestamp: Date.now() }]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onKeyDown = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.chatbotContainer}>
      {/* Chat Messages */}
      <div className={styles.messagesArea}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${styles.messageWrapper} ${msg.from === "user" ? styles.userWrapper : styles.botWrapper}`}
          >
            <div
              className={`${styles.message} ${msg.from === "user" ? styles.userMessage : styles.botMessage}`}
            >
              <p className={styles.messageText}>{msg.text}</p>
              <span className={styles.messageTime}>{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.messageWrapper} ${styles.botWrapper}`}>
            <div className={`${styles.message} ${styles.botMessage} ${styles.loadingMessage}`}>
              <Loader size={16} className={styles.spinner} />
              <span>Thinking... 🧠</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder={loading ? "Thinking..." : "Ask your tutor anything... 🎓"}
            className={styles.input}
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={styles.sendButton}
          >
            <Send size={20} />
          </button>
        </div>
        <p className={styles.disclaimer}>
          ⚠️ AI Tutor may make mistakes — always double-check important facts!
        </p>
      </div>
    </div>
  );
};

export default Chatbot;
