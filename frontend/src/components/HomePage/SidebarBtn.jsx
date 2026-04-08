function SidebarBtn({ icon, label, onClick, active = false, badge, compact = false }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
        active
          ? "border-[#B0E4CC]/40 bg-[#B0E4CC] text-[#091413] shadow-[0_16px_40px_rgba(176,228,204,0.18)]"
          : "border-white/10 bg-white/5 text-[#E7F7EF] hover:border-[#B0E4CC]/25 hover:bg-white/10"
      } ${compact ? "px-3 py-2.5" : ""}`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`rounded-xl p-2 transition ${
            active ? "bg-[#091413]/10" : "bg-white/10 group-hover:bg-white/15"
          }`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium">{label}</span>
      </span>
      {badge ? (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            active ? "bg-[#091413] text-[#B0E4CC]" : "bg-[#408A71]/30 text-[#DDF5EA]"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default SidebarBtn;
