/* ================= REUSABLE BUTTON ================= */
function SidebarBtn({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded hover:bg-white/20"
    >
      {icon}
      {label}
    </button>
  );
}
export default SidebarBtn;