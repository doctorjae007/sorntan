import khuhaLogo from "../assets/Khuha.jpg";

export default function Header() {
  return (
    <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 mb-6 border border-slate-700">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <img
          src={khuhaLogo}
          alt="Khuha logo"
          className="h-16 w-16 rounded-md bg-white object-contain p-1 shadow-sm"
        />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-3">
            <span>📋</span> ตารางสอนแทน
          </h1>
          <p className="text-slate-200 mt-2 text-sm sm:text-base">
            กรุณากรอกข้อมูลครูที่ไม่มาปฏิบัติราชการและคาบสอนที่ต้องการแทน
          </p>
        </div>
      </div>
    </div>
  );
}
