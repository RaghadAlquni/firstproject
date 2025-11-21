const TeacherHome = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">لوحة تحكم الأدمن</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600">عدد المديرين</p>
          <h2 className="text-xl font-bold">12</h2>
        </div>

        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600">عدد الفروع</p>
          <h2 className="text-xl font-bold">5</h2>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;