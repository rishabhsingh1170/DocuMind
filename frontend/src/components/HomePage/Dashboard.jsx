export default function Dashboard({ role, active, setActive, children }) {

  const adminMenu = [
    { id: "manage", label: "Overview" },
    { id: "docs", label: "Documents" },
    { id: "requests", label: "Requests" },
    { id: "token", label: "Tokens" },
  ];

  const employeeMenu = [
    { id: "join", label: "Join Chat" },
    { id: "chat", label: "Chat" },
    { id: "myreq", label: "My Requests" },
  ];

  const menu = role === "admin" ? adminMenu : employeeMenu;

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-[#111439] text-white p-5">
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className="block w-full text-left py-2"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}