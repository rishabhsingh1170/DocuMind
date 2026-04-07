import { useNavigate } from "react-router-dom";
import { BookUp, BookX, MessageCircleQuestionMark } from "lucide-react";

function AdminSidebar({ handleLogout }) {
  const navigate = useNavigate();

  return (
    <div className="w-[300px] bg-[#285A48] text-white p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold">Admin</h2>

        <div className="mt-6 space-y-3">
          <button onClick={() => navigate("/home/upload")}>
            <BookUp /> Upload
          </button>

          <button onClick={() => navigate("/home/remove")}>
            <BookX /> Remove
          </button>

          <button onClick={() => navigate("/home/requests")}>
            <MessageCircleQuestionMark /> Requests
          </button>
        </div>
      </div>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default AdminSidebar;