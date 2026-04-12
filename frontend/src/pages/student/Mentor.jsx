import { useState, useEffect, useRef } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import api from "../../api/axios";
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

/* =============== MARKDOWN RENDERER =============== */
const renderMarkdown = (text) => {
  if (!text) return [];
  
  // Split into lines for processing
  let lines = text.split("\n");
  let result = [];
  let inCodeBlock = false;
  let codeContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        result.push({ type: "code", content: codeContent.join("\n") });
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // Handle headers
    if (line.startsWith("## ")) {
      result.push({ type: "h2", content: line.replace("## ", "") });
    } else if (line.startsWith("# ")) {
      result.push({ type: "h1", content: line.replace("# ", "") });
    }
    // Handle bold with **text**
    else if (line.includes("**")) {
      const parts = line.split(/(\*\*[^*]+\*\*)/);
      result.push({ type: "paragraph", content: parts });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(line)) {
      result.push({ type: "li", content: line.replace(/^\d+\.\s/, ""), ordered: true });
    }
    // Handle bullet points
    else if (line.startsWith("- ")) {
      result.push({ type: "li", content: line.replace("- ", "") });
    }
    // Handle paragraphs
    else if (line.trim()) {
      result.push({ type: "paragraph", content: line });
    }
  }

  return result || [];
};

const RichText = ({ text }) => {
  if (!text) return null;
  
  const parsed = renderMarkdown(text);

  if (!Array.isArray(parsed)) {
    return <p>{text}</p>;
  }

  return (
    <div className="rich-text">
      {parsed.map((block, idx) => {
        if (block.type === "h1")
          return <h1 key={idx}>{block.content}</h1>;
        if (block.type === "h2")
          return <h2 key={idx}>{block.content}</h2>;
        if (block.type === "code")
          return (
            <pre key={idx}>
              <code>{block.content}</code>
            </pre>
          );
        if (block.type === "li")
          return (
            <li key={idx} className={block.ordered ? "ordered" : ""}>
              {block.content}
            </li>
          );
        if (block.type === "paragraph") {
          if (Array.isArray(block.content)) {
            return (
              <p key={idx}>
                {block.content.map((part, i) =>
                  part.startsWith("**") ? (
                    <strong key={i}>{part.replace(/\*\*/g, "")}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>
            );
          }
          return <p key={idx}>{block.content}</p>;
        }
        return null;
      })}
    </div>
  );
};

/* ---------------- MOCK MENTORS ---------------- */
const MENTORS = [
  {
    id: "zulfiquar-ali",
    name: "Zulfiquar Ali",
    avatar: "https://ui-avatars.com/api/?name=Zulfiquar+Ali",
    rating: 4.9,
    reviews: 148,
    hourlyRate: 35,
    responseTime: "20 mins",
    expertise: ["Full Stack", "React", "Node.js"],
    bio: "Real mentor for full stack related queries.",
    recommendedFor: "Full stack related queries",
    categories: ["Full Stack"],
  },
  {
    id: "anas",
    name: "Anas",
    avatar: "https://ui-avatars.com/api/?name=Anas",
    rating: 4.8,
    reviews: 132,
    hourlyRate: 30,
    responseTime: "25 mins",
    expertise: ["Backend", "Finance", "APIs"],
    bio: "Real mentor for backend and finance related queries.",
    recommendedFor: "Backend and finance related queries",
    categories: ["Backend", "Finance"],
  },
  {
    id: "vipul",
    name: "Vipul",
    avatar: "https://ui-avatars.com/api/?name=Vipul",
    rating: 4.7,
    reviews: 96,
    hourlyRate: 22,
    responseTime: "35 mins",
    expertise: ["PPT", "Presentations", "Slides"],
    bio: "Real mentor for PPT and presentation related queries.",
    recommendedFor: "PPT related queries",
    categories: ["PPT"],
  },
  {
    id: "raj",
    name: "Raj",
    avatar: "https://ui-avatars.com/api/?name=Raj",
    rating: 4.8,
    reviews: 104,
    hourlyRate: 28,
    responseTime: "30 mins",
    expertise: ["Login Page", "Auth UI", "UX"],
    bio: "Real mentor for login page related queries.",
    recommendedFor: "Login page related queries",
    categories: ["Login Page"],
  },
];

const DEFAULT_MENTOR = MENTORS[0];
const MEETING_MODES = ["Google Meet", "Zoom", "Phone Call", "Email"];

const MENTOR_ROUTING = [
  {
    mentorId: "raj",
    keywords: ["login page", "login", "sign in", "signup", "sign up", "auth", "authentication"],
  },
  {
    mentorId: "vipul",
    keywords: ["ppt", "powerpoint", "presentation", "slides", "slide deck", "deck"],
  },
  {
    mentorId: "anas",
    keywords: ["finance", "financial", "budget", "revenue", "profit", "investment"],
  },
  {
    mentorId: "anas",
    keywords: ["backend", "back end", "api", "server", "database", "express", "mongodb", "sql"],
  },
  {
    mentorId: "zulfiquar-ali",
    keywords: ["full stack", "fullstack", "mern", "mean", "react", "frontend", "front end", "web development"],
  },
];

const getRecommendedMentor = (query = "") => {
  const normalizedQuery = query.toLowerCase();

  const matchedRoute = MENTOR_ROUTING.find(({ keywords }) =>
    keywords.some((keyword) => normalizedQuery.includes(keyword))
  );

  return MENTORS.find((mentor) => mentor.id === matchedRoute?.mentorId) || DEFAULT_MENTOR;
};

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Unable to read user from storage:", error);
    return null;
  }
};

const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const createBookingState = (mentor = null) => {
  const storedUser = getStoredUser();

  return {
    mentor,
    studentName: storedUser?.name || "",
    studentEmail: storedUser?.email || "",
    studentPhone: "",
    queryCategory: mentor?.categories?.[0] || "",
    topic: "",
    preferredDate: "",
    duration: 60,
    meetingMode: MEETING_MODES[0],
    notes: "",
    timezone: getUserTimezone(),
  };
};

const formatSessionDate = (value) => new Date(value).toLocaleString();

const mapBookingToSessionItem = (savedBooking) => ({
  id: savedBooking._id,
  mentor: savedBooking.mentorName,
  topic: savedBooking.topic,
  queryCategory: savedBooking.queryCategory,
  date: savedBooking.preferredDate,
  duration: savedBooking.duration,
  meetingMode: savedBooking.meetingMode,
  status: savedBooking.status,
  studentEmailSent: savedBooking.notificationStatus?.studentEmailSent,
  mentorEmailSent: savedBooking.notificationStatus?.mentorEmailSent,
});

function Mentor() {
  const [tab, setTab] = useState("ai");
  const [rateLimitError, setRateLimitError] = useState(false);

  /* ---------------- AI CHAT ---------------- */
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "🤖 Hi! I'm your AI Mentor. Ask about full stack, backend, PPT, finance, or login page topics and I'll also point you to the right real mentor.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [mentorPopup, setMentorPopup] = useState(null);
  const endRef = useRef(null);
  const mentorPopupTimerRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => {
    if (mentorPopupTimerRef.current) {
      clearTimeout(mentorPopupTimerRef.current);
    }
  }, []);

  const showMentorPopup = (mentor) => {
    if (mentorPopupTimerRef.current) {
      clearTimeout(mentorPopupTimerRef.current);
    }

    setMentorPopup(mentor);
    mentorPopupTimerRef.current = setTimeout(() => {
      setMentorPopup(null);
    }, 3200);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || typing || rateLimitError) return;

    const trimmedInput = input.trim();
    const matchedMentor = getRecommendedMentor(trimmedInput);
    const userMsg = { role: "user", text: trimmedInput };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setTyping(true);
    showMentorPopup(matchedMentor);

    try {
      let aiText = "";

      // Add empty AI message placeholder
      setMessages((p) => [
        ...p,
        {
          role: "ai",
          text: "",
        },
      ]);

      const response = await fetch(`${api.defaults.baseURL}/ai/mentor-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to get response");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setTyping(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              aiText += parsed.chunk;

              // Update the last AI message with streamed content
              setMessages((p) => {
                const updated = [...p];
                updated[updated.length - 1].text = aiText;
                return updated;
              });
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (error) {
      if (error.message?.includes("429")) {
        setRateLimitError(true);
        setTimeout(() => setRateLimitError(false), 5000);
      }

      const errorMessage =
        error.message ||
        "Unable to get a response. Check backend connection.";

      setMessages((p) => {
        const updated = [...p];
        const lastMessage = updated[updated.length - 1];

        if (lastMessage?.role === "ai") {
          updated[updated.length - 1] = {
            ...lastMessage,
            text: `❌ ${errorMessage}`,
          };
          return updated;
        }

        return [
          ...updated,
          { role: "ai", text: `❌ ${errorMessage}` },
        ];
      });
    } finally {
      setTyping(false);
    }
  };





  /* ---------------- BOOKINGS ---------------- */
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState(() => createBookingState());
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingFeedback, setBookingFeedback] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    let cancelled = false;

    const loadBookings = async () => {
      try {
        const response = await api.get("/mentor-bookings/mine");

        if (!cancelled) {
          setBookings(response.data.data.bookings.map(mapBookingToSessionItem));
        }
      } catch (error) {
        console.error("Unable to load mentor bookings:", error);
      }
    };

    loadBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const openBookingForm = (mentor) => {
    setTab("mentors");
    setBooking(createBookingState(mentor));
    setBookingFeedback(null);
  };

  const updateBookingField = (field, value) => {
    setBooking((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitBooking = async () => {
    if (
      !booking.mentor ||
      !booking.studentName.trim() ||
      !booking.studentEmail.trim() ||
      !booking.studentPhone.trim() ||
      !booking.queryCategory ||
      !booking.topic.trim() ||
      !booking.preferredDate ||
      !booking.notes.trim()
    ) {
      setBookingFeedback({
        type: "error",
        message: "Please fill all booking details before submitting the session request.",
      });
      return;
    }

    try {
      setBookingSubmitting(true);
      setBookingFeedback(null);

      const response = await api.post("/mentor-bookings", {
        mentorId: booking.mentor.id,
        studentName: booking.studentName.trim(),
        studentEmail: booking.studentEmail.trim().toLowerCase(),
        studentPhone: booking.studentPhone.trim(),
        queryCategory: booking.queryCategory,
        topic: booking.topic.trim(),
        preferredDate: new Date(booking.preferredDate).toISOString(),
        duration: Number(booking.duration),
        meetingMode: booking.meetingMode,
        notes: booking.notes.trim(),
        timezone: booking.timezone,
      });

      const { booking: savedBooking, emailStatus } = response.data.data;

      setBookings((current) => [
        {
          ...mapBookingToSessionItem({
            ...savedBooking,
            notificationStatus: emailStatus,
          }),
        },
        ...current,
      ]);

      let message = `Session booked with ${savedBooking.mentorName}.`;

      if (emailStatus?.studentEmailSent && emailStatus?.mentorEmailSent) {
        message += " Confirmation emails were sent to both you and the mentor.";
      } else if (emailStatus?.skippedReason === "email_not_configured") {
        message += " Booking was saved, but email notifications are not configured on the backend yet.";
      } else if (emailStatus?.skippedReason === "mentor_email_missing") {
        message += " Your confirmation email was sent, but the mentor email is not configured yet.";
      } else {
        message += " Booking was saved, but some email notifications could not be sent.";
      }

      setBookingFeedback({
        type: "success",
        message,
      });
      setBooking(createBookingState());
    } catch (error) {
      setBookingFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to submit the booking request right now. Please try again.",
      });
    } finally {
      setBookingSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      {/* ================= AI CHAT - FULL SCREEN MODE ================= */}
      {tab === "ai" ? (
        <div className="mentor-ai-fullscreen">
          {mentorPopup && (
            <div className="mentor-popup">
              <div className="mentor-popup-title">Recommended Real Mentor</div>
              <div className="mentor-popup-name">{mentorPopup.name}</div>
              <p>{mentorPopup.recommendedFor}</p>
            </div>
          )}

          {/* Header - Top Right */}
          <div className="ai-header">
            <div>
              <h2>AI Mentor</h2>
              <p>Get instant help with programming questions</p>
            </div>
            <button onClick={() => setTab("mentors")} className="switch-tab-btn">
              👤 Real Mentors
            </button>
          </div>

          {/* Chat Box - Full Display */}
          <div className="chat-box-fullscreen">
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role}`}>
                  {m.role === "ai" ? <Bot /> : <User />}
                  {m.role === "ai" ? (
                    <div className="msg-content">
                      <RichText text={m.text} />
                    </div>
                  ) : (
                    <p>{m.text}</p>
                  )}
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
                placeholder="💭 Ask about full stack, backend, PPT, finance, login page..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button><Send /></button>
            </form>
          </div>
        </div>
      ) : (
        /* ================= REGULAR LAYOUT - MENTORS TAB ================= */
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
                {MENTORS.map((m) => (
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
                      onClick={() => openBookingForm(m)}
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
                  <p className="booking-helper-text">
                    Share only the session details the mentor needs to contact you and prepare for the discussion.
                  </p>

                  <div className="booking-form-grid">
                    <label>
                      Full Name
                      <input
                        placeholder="Your full name"
                        value={booking.studentName}
                        onChange={(e) => updateBookingField("studentName", e.target.value)}
                      />
                    </label>

                    <label>
                      Email
                      <input
                        type="email"
                        placeholder="yourname@email.com"
                        value={booking.studentEmail}
                        onChange={(e) => updateBookingField("studentEmail", e.target.value)}
                      />
                    </label>

                    <label>
                      Phone Number
                      <input
                        placeholder="Phone number"
                        value={booking.studentPhone}
                        onChange={(e) => updateBookingField("studentPhone", e.target.value)}
                      />
                    </label>

                    <label>
                      Query Category
                      <select
                        value={booking.queryCategory}
                        onChange={(e) => updateBookingField("queryCategory", e.target.value)}
                      >
                        {booking.mentor.categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Preferred Date & Time
                      <input
                        type="datetime-local"
                        value={booking.preferredDate}
                        onChange={(e) => updateBookingField("preferredDate", e.target.value)}
                      />
                    </label>

                    <label>
                      Session Duration
                      <select
                        value={booking.duration}
                        onChange={(e) => updateBookingField("duration", e.target.value)}
                      >
                        <option value={30}>30 minutes</option>
                        <option value={60}>60 minutes</option>
                        <option value={90}>90 minutes</option>
                      </select>
                    </label>

                    <label>
                      Meeting Preference
                      <select
                        value={booking.meetingMode}
                        onChange={(e) => updateBookingField("meetingMode", e.target.value)}
                      >
                        {MEETING_MODES.map((mode) => (
                          <option key={mode} value={mode}>
                            {mode}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      Timezone
                      <input value={booking.timezone} readOnly />
                    </label>
                  </div>

                  <label className="booking-form-block">
                    Topic / Project
                    <input
                      placeholder="What exactly do you need help with?"
                      value={booking.topic}
                      onChange={(e) => updateBookingField("topic", e.target.value)}
                    />
                  </label>

                  <label className="booking-form-block">
                    Problem Statement
                    <textarea
                      rows="5"
                      placeholder="Describe the issue, requirements, or project context so the mentor can prepare."
                      value={booking.notes}
                      onChange={(e) => updateBookingField("notes", e.target.value)}
                    />
                  </label>

                  <p className="booking-note">
                    After you submit, a notification email will be sent to your email and to {booking.mentor.name}'s email.
                  </p>

                  {bookingFeedback && (
                    <div className={`booking-feedback ${bookingFeedback.type}`}>
                      {bookingFeedback.message}
                    </div>
                  )}

                  <button
                    className="sd-btn"
                    onClick={submitBooking}
                    disabled={bookingSubmitting}
                  >
                    {bookingSubmitting ? "Submitting..." : "✅ Confirm Booking"}
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
                      <p>🧭 Category: {s.queryCategory}</p>
                      <p>⏱️ Duration: {s.duration} minutes</p>
                      <p>📞 Meeting Mode: {s.meetingMode}</p>
                      <small>
                        📅 {formatSessionDate(s.date)} | Email notifications:{" "}
                        {s.studentEmailSent && s.mentorEmailSent ? "sent to both" : "check backend mail config"}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </StudentLayout>
  );
}

export default Mentor;
