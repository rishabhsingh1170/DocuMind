import SidebarBtn from "../SidebarBtn";
import {
    BookUp,BookX,MessageCircleQuestionMark,CircleStar,KeyRound
} from "lucide-react";

function EmployeeSidebar({ handleLogout }) {
  return (
    <div className="w-[250px] bg-indigo-300 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-xl font-bold">Employee Name</h2>
        <p className="text-sm">Department: IT</p>
      </div>

      <button onClick={handleLogout} className="bg-red-400 text-white py-2 rounded-full">
        Logout
      </button>
    </div>
  );
}
export default EmployeeSidebar;