import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookUp,
  FileText,
  ListChecks,
  KeyRound,
  MessageCircle,
  Send,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";

// ================= UI COMPONENTS =================

const Card = ({ children }) => (
  <div className="group rounded-2xl bg-white/60 backdrop-blur-md 
  border border-white/30 p-5 shadow-md
  hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
    {children}
  </div>
);

// ================= PAGES =================

const ManageDoc = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      Dashboard Overview
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { title: "Total Docs", value: 24 },
        { title: "Employee joined", value: 12 },
        { title: "Requests ", value: 8 },
      ].map((item, i) => (
        <Card key={i}>
          <p className="text-sm text-gray-500">{item.title}</p>
          <p className="text-3xl font-bold text-[#111439] mt-2">
            {item.value}
          </p>

          <div className="mt-3 h-2 bg-gray-200 rounded-full">
            <div className="h-2 rounded-full bg-gradient-to-r from-[#111439] to-[#6C63FF] w-[70%]"></div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const DocList = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      Documents
    </h2>

    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <div className="flex justify-between items-center hover:bg-[#F8F8F9] p-3 rounded-lg transition">
            <div className="flex items-center gap-3">
              <FileText className="text-[#111439]" />
              <div>
                <p className="font-medium text-[#111439]">
                  Document {i}
                </p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
            </div>

            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
              Active
            </span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const RequestList = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      Requests
    </h2>

    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i}>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-[#111439]">
                Request #{i}
              </p>
              <p className="text-xs text-gray-500">
                Employee {i}
              </p>
            </div>

            <span className="text-xs bg-red-100 text-red-500 px-2 py-1 rounded">
              Pending
            </span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const CreateTokenDocs = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      Generate Token
    </h2>

    <Card>
      <button className="w-full bg-gradient-to-r from-[#111439] to-[#6C63FF] text-white py-3 rounded-lg font-medium transition hover:opacity-90">
        Generate Token
      </button>
    </Card>
  </div>
);

const JoinChat = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      Join Chat
    </h2>

    <Card>
      <input
        placeholder="Enter token"
        className="w-full bg-white border border-gray-200 p-3 rounded-lg mb-4"
      />
      <button className="w-full bg-gradient-to-r from-[#111439] to-[#6C63FF] text-white py-3 rounded-lg">
        Join Chat
      </button>
    </Card>
  </div>
);

const ChatAssistant = () => (
  <Card>
    <div className="space-y-3">
      <div className="bg-gray-100 p-3 rounded-lg w-fit text-[#111439]">
        Hello! How can I help you?
      </div>

      <div className="bg-[#111439] text-white p-3 rounded-lg w-fit ml-auto">
        Show my documents
      </div>

      <input
        placeholder="Type a message..."
        className="w-full mt-4 bg-white border border-gray-200 p-3 rounded-lg"
      />
    </div>
  </Card>
);

const MyRequests = () => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-[#111439]">
      My Requests
    </h2>

    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i}>
          <div className="flex justify-between">
            <p className="text-[#111439]">Request #{i}</p>
            <span className="text-xs bg-green-100 px-2 py-1 rounded text-green-600">
              Approved
            </span>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ================= MAIN =================

export default function HomePage() {
  const navigate = useNavigate();
  const user =
    JSON.parse(localStorage.getItem("user")) || {
      role: "admin",
      name: "Guest",
      companyName: "Demo Corp",
    };

  const role = user.role;

  const [activeSection, setActiveSection] = useState("manage");
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const adminMenu = [
    { id: "manage", label: "Overview",description:"see the overview", icon: FileText },
    { id: "docs", label: "Documents",description:"Upload/Remove documents", icon: BookUp },
    { id: "requests", label: "Requests",description:"View and manage your requests", icon: Send },
    { id: "token", label: "chat Tokens",description:"create tokens", icon: KeyRound },
  ];

  const employeeMenu = [
    { id: "join", label: "Join", description: "Join a chat", icon: KeyRound },
    { id: "chat", label: "Chat", description: "Chat with others", icon: MessageCircle },
    { id: "myreq", label: "Requests", description: "View your requests", icon: ListChecks },
  ];

  const menu = role === "admin" ? adminMenu : employeeMenu;

  const renderContent = () => {
    const map = {
      manage: <ManageDoc />,
      docs: <DocList />,
      requests: <RequestList />,
      token: <CreateTokenDocs />,
      join: <JoinChat />,
      chat: <ChatAssistant />,
      myreq: <MyRequests />,
    };
    return map[activeSection];
  };

  return (
    <div className="flex min-h-screen bg-[#F8F8F9]">

      {/* SIDEBAR */}
      <div className="hidden md:flex flex-col w-[285px] bg-[#111439] text-white p-5 justify-evenly rounded-r-[22px] p-6 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">

        <h1 className="text-2xl font-bold mb-6">
          DocuMind
        </h1>

        {/* profile  */}
        <div className="mb-6 rounded-[28px] border border-white/30 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center gap-4">
          <p className="font-semibold flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-2xl font-bold text-black shadow-inner">{user.name.charAt(0)}</p>
          <div className="text-sm uppercase tracking-[0.25em] ">
          <p className="mt-3 text-xl opacity-70 capitalize">{user.name}</p>
          <p className="mt-3 text-xs">{user.companyName}</p>
           <p className="mt-3 text-xs">Role: {role}</p>
          </div>
        </div>

        {/* options/features  */}
        <div className="flex-1 mt-8 space-y-3 ">
          {menu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex text-left items-center gap-3 w-full px-4 py-3 rounded-lg border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)]   hover:shadow-xl hover:-translate-y-1 transition-all duration-300 transition ${
                activeSection === item.id
                  ? "bg-white text-[#111439]"
                  : "hover:bg-white/10"
              }`}
            >
              <item.icon size={20} className="h-5 w-5 "/>
              <div>
                <p className="font-semibold">{item.label}</p>
                <p className="text-xs opacity-30">{item.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* logout  */}
        <div
        className="flex items-center gap-2 w-full px-4 py-3 rounded-lg bg-red-900/70 border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition hover:bg-red-700/60 mt-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-3 text-white font-medium "
        >
          <LogOut size={18} /> Logout
        </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#111439] capitalize">
            {role} dashboard
          </h2>

          <button
            className="md:hidden"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenu && (
          <div className=" md:hidden mb-4 space-y-2">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="block w-full text-left px-4 py-2 bg-white rounded shadow"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200">
          {renderContent()}
        </div>
      </div>

      {/* FLOAT BUTTON */}
      <button className="fixed bottom-6 right-6 bg-gradient-to-r from-[#111439] to-[#6C63FF] text-white p-4 rounded-full shadow-lg hover:scale-110 transition">
        <Plus />
      </button>
    </div>
  );
}