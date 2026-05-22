export default function ExportButton({ onClick, isLoading = false }) {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-slate-800 hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg shadow-md transition text-lg flex items-center justify-center gap-2 mb-4 border border-slate-700"
    >
      <span>{isLoading ? "⏳" : "💾"}</span> {isLoading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
    </button>
  );
}
