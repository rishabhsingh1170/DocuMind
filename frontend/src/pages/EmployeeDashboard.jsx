import { useState } from "react";

function EmployeeDashboard() {
    const [showHistory, setShowHistory] = useState(false);
    const [message, setMessage] = useState("");

    // Demo chat messages
    const [chat, setChat] = useState([
        { sender: "user", text: "What is the leave policy?" },
        { sender: "bot", text: "The leave policy allows 20 days per year." },
    ]);

    const handleSend = () => {
        if (!message.trim()) return;

        // Add user message
        setChat([...chat, { sender: "user", text: message }]);

        // DEMO RESPONSE (replace with backend later)
        setTimeout(() => {
            setChat((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "This answer is generated based on company documents.",
                },
            ]);
        }, 500);

        setMessage("");
    };

    return (
        <div className="min-h-screen flex bg-slate-100">

            {/* 🔹 LEFT SIDEBAR */}
            <div className="w-1/4 bg-indigo-300 p-6 flex flex-col justify-between">
                <div>
                    {/* Profile */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold">Employee Name</h2>
                        <p className="text-sm text-gray-700">Department: IT</p>
                        <p className="text-sm text-gray-600">Company XYZ</p>
                    </div>

                    <hr className="my-4" />

                    {/* Ask Query */}
                    {/* <button className="w-full bg-indigo-500 text-white py-2 rounded-lg mb-4">
                        Ask Query
                    </button> */}

                    {/* History Dropdown */}
                    {/* <div>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="w-full bg-white py-2 rounded-lg shadow"
                        >
                            History
                        </button>

                        {showHistory && (
                            <div className="mt-2 bg-white p-2 rounded shadow">
                                <p className="text-sm">Leave policy query</p>
                                <p className="text-sm">Salary structure</p>
                                <p className="text-sm">Work from home rules</p>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* logout button  */}
                <div className=" py-4 border-t" >
                    <button
                        onClick={() => {
                            localStorage.removeItem("role");
                            window.location.href = "/";
                        }}
                        className="bg-red-400 text-white w-full py-2 rounded-full"
                    >
                        Logout
                    </button>
                    <p className="p-2 text-xs text-gray-600">Employee Panel</p>
                </div>

                
            </div>

            {/* 🔹 RIGHT SECTION (6:3 GRID) */}
            <div className="flex bg-black">

                {/* 🟦 CHAT SECTION (6 parts) */}
                <div className=" bg-indigo-200 rounded-2xl shadow flex flex-col">

                    {/* Chat Messages */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg max-w-[70%] ${msg.sender === "user"
                                        ? "bg-indigo-500 text-white ml-auto"
                                        : "bg-white text-gray-800"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <div className="p-4  flex gap-2  ">
                        <input
                            type="text"
                            placeholder="Ask something..."
                            className="flex-1 border rounded-lg px-3 py-3"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-indigo-600 text-white px-4 rounded-lg"
                        >
                        <MessageCircleQuestionMark size={18} />
                            Send
                        </button>
                    </div>

                    {/* 🔴 FUTURE RAG + LLM INTEGRATION */}
                    {/*
            TODO:
            - Replace handleSend with API call
            - Send query to backend (FastAPI)
            - Backend will:
                → Retrieve documents (RAG)
                → Pass context to LLM
                → Return response
            - Update chat with real response
          */}
                </div>

                {/* 🟩 DOCUMENT REFERENCE SECTION (3 parts) */}
                {/* <div className="col-span-3 bg-white rounded-2xl shadow p-4">

                    <h3 className="text-lg font-semibold mb-4">
                        Document References
                    </h3>

                    Demo references
                    <div className="space-y-3 ">
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <p className="font-medium">HR Policy.pdf</p>
                            <p className="text-sm text-gray-600">
                                Section: Leave Policy
                            </p>
                        </div>

                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <p className="font-medium">Company Handbook.pdf</p>
                            <p className="text-sm text-gray-600">
                                Section: Work Guidelines
                            </p>
                        </div>

                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <p className="font-medium">Salary Structure.docx</p>
                            <p className="text-sm text-gray-600">
                                Section: Compensation
                            </p>
                        </div>
                    </div>

                    🔴 FUTURE RAG INTEGRATION
                    
            TODO:
            - Show actual document chunks retrieved by RAG
            - Highlight relevant text
            - Add "View Full Document" option
         
                </div> */}
            </div>
        </div>
    );
}

export default EmployeeDashboard;