import React, { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css';
import { useNavigate } from 'react-router-dom';

const Chat = ({ tutor: propTutor, onBack: propOnBack }) => {
    const navigate = useNavigate();

    const dummyTutor = {
        id: 1,
        name: 'Dr. Sarah Chen',
        subject: 'Mathematics',
        rating: 4.8,
        reviews: 127,
        price: 45,
        availability: 'Mon, Wed, Fri',
        bio: 'PhD in Mathematics with 5 years teaching experience. Specialized in Calculus and Linear Algebra.',
        image: '/tutor.png'
    };

    const dummyOnBack = () => {
        console.log('Back to tutors list');
        navigate(-1);
        // In a real app, this would navigate back
    };

    const tutor = propTutor || dummyTutor;
    const onBack = propOnBack || dummyOnBack;

    const [messages, setMessages] = useState([
        { id: 1, text: `Hi! I'm ${tutor.name}. How can I help you with ${tutor.subject}?`, sender: 'tutor', time: '10:00 AM' },
        { id: 2, text: 'Hi! I have questions about calculus derivatives.', sender: 'user', time: '10:01 AM' }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim() === '') return;
        const userMsg = { id: Date.now(), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMsg]);
        setNewMessage('');

        // Simulate tutor response after 1 second
        setTimeout(() => {
            const tutorMsg = {
                id: Date.now() + 1,
                text: 'Great question! Derivatives measure the rate of change. For f(x) = x², f\'(x) = 2x. What specific part would you like to dive into?',
                sender: 'tutor',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, tutorMsg]);
        }, 1000);
    };

    return (
        <div className={styles.chatContainer} role="main" aria-label="Chat">
            <header className={styles.chatHeader}>
                <div className={styles.tutorInfo}>
                    <div className={styles.tutorAvatar}>
                        <img src={tutor.image} alt={tutor.name} />
                    </div>
                    <div>
                        <h2>{tutor.name}</h2>
                        <span className={styles.status}>Online</span>
                    </div>
                </div>
                <button onClick={onBack} className={styles.btnBack}>← Back</button>
            </header>

            <section className={styles.messagesContainer}>
                <div className={styles.messages}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.tutorMessage}`}>
                            <div className={styles.messageContent}>
                                <p>{msg.text}</p>
                                <span className={styles.messageTime}>{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </section>

            <footer className={styles.chatInput}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend} className={styles.btnSend}>Send</button>
            </footer>
        </div>
    );
};

export default Chat;