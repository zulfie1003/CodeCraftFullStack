import { useState, useEffect, useRef } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/mentor.css";
import {
  Bot,
  Send,
  User,
  Star,
  Clock,
  DollarSign,
  Calendar,
} from "lucide-react";

/* ---------------- AI RESPONSE GENERATOR - REAL OPENAI API ----------------*/
const generateAIResponse = async (userInput) => {
  try {
    const response = await fetch("http://localhost:3001/api/ai/mentor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });

    if (!response.ok) {
      throw new Error("Failed to get AI response");
    }

    const data = await response.json();
    return data.data.answer || "Sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("AI API Error:", error);
    return "⚠️ Unable to connect to AI service. Please verify:\n1. Backend is running on port 3001\n2. OpenAI API key is set in backend/.env\n3. Check browser console for detailed errors";
  }
};

const fakeAI = generateAIResponse;


/* ---------------- MOCK MENTORS ---------------- */
const MENTORS = [
  {
    id: 1,
    name: "Rahul Verma",
    avatar: "https://ui-avatars.com/api/?name=RV",
    rating: 4.8,
    reviews: 120,
    hourlyRate: 25,
    responseTime: "1 hour",
    expertise: ["React", "System Design", "DSA"],
    bio: "Senior Frontend Engineer at Amazon",
  },
  {
    id: 2,
    name: "Anjali Sharma",
    avatar: "https://ui-avatars.com/api/?name=AS",
    rating: 4.9,
    reviews: 210,
    hourlyRate: 30,
    responseTime: "30 mins",
    expertise: ["Backend", "Node.js", "MongoDB"],
    bio: "Backend Lead, 8+ years experience",
  },
];

function Mentor() {
  const [tab, setTab] = useState("ai");
  const [mentors, setMentors] = useState(MENTORS); // Use MENTORS as default

  useEffect(() => {
    // Try to fetch from API, but fall back to mock data
    fetch("http://localhost:5000/api/mentors")
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMentors(data);
        }
      })
      .catch(err => {
        console.log("Using mock mentors data");
        setMentors(MENTORS);
      });
  }, []);



  /* ---------------- AI CHAT ---------------- */
  const [messages, setMessages] = useState([
    { role: "ai", text: "💡 Hi there! I'm your AI Mentor. Ask me anything about coding, DSA, web development, or any tech topic!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);

    const aiText = await fakeAI(input);
    setMessages((p) => [...p, { role: "ai", text: aiText }]);
    setTyping(false);
  };





  /* ---------------- BOOKINGS ---------------- */
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState({
    mentor: null,
    topic: "",
    date: "",
    duration: 60,
  });

  const bookSession = () => {
    if (!booking.mentor || !booking.topic || !booking.date) return;

    setBookings((p) => [
      ...p,
      {
        id: Date.now(),
        mentor: booking.mentor.name,
        topic: booking.topic,
        date: booking.date,
        duration: booking.duration,
        status: "upcoming",
      },
    ]);
    setBooking({ mentor: null, topic: "", date: "", duration: 60 });
  };

  return (
    <StudentLayout>
      <div className="sd-container mentor-page">
        {/* Page Header */}
        <div style={{ marginBottom: "30px" }}>
          <h1 className="page-title">AI Mentor & Guidance 🎓</h1>
          <p className="page-subtitle">Get instant help from AI or book real mentors for personalized guidance</p>
        </div>

        {/* TABS */}
        <div className="mentor-tabs">
          <button onClick={() => setTab("ai")} className={tab === "ai" ? "active" : ""}>
            <Bot /> AI Mentor
          </button>
          <button onClick={() => setTab("mentors")} className={tab === "mentors" ? "active" : ""}>
            <User /> Real Mentors
          </button>
        </div>

        {/* ================= AI CHAT ================= */}
        {tab === "ai" && (
          <div className="chat-box">
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {m.role === "ai" ? <Bot /> : <User />}
                  <p>{m.text}</p>
                </div>
              ))}
              {typing && (
                <div className="msg ai typing">
                  <Bot /> <p><span></span></p>
                </div>
              )}
              <div ref={endRef} />
            </div>

            <form className="chat-input" onSubmit={sendMessage}>
              <input
                placeholder="💭 Ask anything about coding, DSA, web dev..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button><Send /></button>
            </form>
          </div>
        )}

        {/* ================= MENTORS ================= */}
        {tab === "mentors" && (
          <>
            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ color: "#38bdf8", fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}>
                🌟 Available Mentors
              </h2>
              <p style={{ color: "#94a3b8" }}>Connect with experienced professionals for personalized guidance</p>
            </div>

            <div className="mentor-grid">
              {mentors.map((m) => (
                <div key={m.id} className="mentor-card">
                  <img src={m.avatar} alt={m.name} />
                  <h3>{m.name}</h3>
                  <p>{m.bio}</p>

                  <div className="mentor-stats">
                    <span><Star /> {m.rating}</span>
                    <span><DollarSign /> ${m.hourlyRate}/hr</span>
                    <span><Clock /> {m.responseTime}</span>
                  </div>

                  <div className="mentor-tags">
                    {m.expertise.map((s) => <span key={s}>{s}</span>)}
                  </div>

                  <button
                    className="sd-btn"
                    onClick={() => setBooking({ ...booking, mentor: m })}
                  >
                    📅 Book Session
                  </button>
                </div>
              ))}
            </div>

            {/* BOOKING FORM */}
            {booking.mentor && (
              <div className="booking-box">
                <h3>→ Booking Session with {booking.mentor.name}</h3>

                <input
                  placeholder="📌 Topic (e.g., React Hooks, System Design)"
                  value={booking.topic}
                  onChange={(e) => setBooking({ ...booking, topic: e.target.value })}
                />
                <input
                  type="datetime-local"
                  placeholder="📅 Select Date & Time"
                  value={booking.date}
                  onChange={(e) => setBooking({ ...booking, date: e.target.value })}
                />
                <select
                  value={booking.duration}
                  onChange={(e) => setBooking({ ...booking, duration: e.target.value })}
                >
                  <option value={30}>⏱️ 30 minutes</option>
                  <option value={60}>⏱️ 60 minutes</option>
                  <option value={90}>⏱️ 90 minutes</option>
                </select>

                <button className="sd-btn" onClick={bookSession}>
                  ✅ Confirm Booking
                </button>
              </div>
            )}

            {/* SESSIONS */}
            {bookings.length > 0 && (
              <div className="session-box">
                <h3><Calendar /> Your Upcoming Sessions ({bookings.length})</h3>
                {bookings.map((s) => (
                  <div key={s.id} className="session-item">
                    <p>👤 {s.mentor}</p>
                    <p>📚 Topic: <b>{s.topic}</b></p>
                    <p>⏱️ Duration: {s.duration} minutes</p>
                    <small>📅 {new Date(s.date).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}

export default Mentor;

