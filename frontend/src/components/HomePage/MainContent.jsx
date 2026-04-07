/* ================= MAIN CONTENT ================= */
function MainContent({ role, activeMenu }) {

  /* EMPLOYEE CHAT STATE */
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "user", text: "What is the leave policy?" },
    { sender: "bot", text: "20 days per year." },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setChat([...chat, { sender: "user", text: message }]);

    setTimeout(() => {
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Answer from documents." },
      ]);
    }, 500);

    setMessage("");
  };

  /* ================= ADMIN CONTENT ================= */
  if (role === "admin") {
    return (
      <div className="flex-1 bg-[#0F2F26] text-white p-8">
        {activeMenu === "home" && (
          <h1 className="text-3xl">👋 Welcome Admin</h1>
        )}

        {activeMenu === "upload" && <h1>Upload Documents</h1>}
        {activeMenu === "remove" && <h1>Remove Documents</h1>}
        {activeMenu === "requests" && <h1>Requests Page</h1>}
        {activeMenu === "uploaded" && <h1>Uploaded Docs</h1>}
        {activeMenu === "token" && <h1>Token System</h1>}
      </div>
    );
  }

  /* ================= EMPLOYEE CONTENT ================= */
  return (
    <div className="flex-1 flex flex-col bg-indigo-100">

      {/* 👋 INITIAL GREETING */}
      <div className="p-6 text-xl font-semibold">
        👋 Welcome Employee
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-3">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.sender === "user"
                  ? "bg-indigo-500 text-white ml-auto"
                  : "bg-white"
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border px-3 py-2 rounded"
          />
          <button onClick={handleSend} className="bg-indigo-600 text-white px-4 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
export default MainContent;