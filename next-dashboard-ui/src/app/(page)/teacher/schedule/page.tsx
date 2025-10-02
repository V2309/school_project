import BigCalendar from "@/components/BigCalendar";

export default function SchedulePage() {
  return (
    <div className="">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
                  Lịch học
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                  Họp phụ huynh
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                  Sự kiện
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="w-full ">
          <BigCalendar />
        </div>

    
      </div>
    </div>
  );

}