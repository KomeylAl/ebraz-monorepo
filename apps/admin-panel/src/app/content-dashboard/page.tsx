"use client";

import Header from "@/components/layout/Header";
import { Calendar } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import weekends from "react-multi-date-picker/plugins/highlight_weekends";
import toast from "react-hot-toast";

const Dashboard = () => {
  const today = Date.now();
  return (
    <div className="flex-1 h-screen overflow-y-auto flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />
      <div className="p-12 w-full h-full">
        <Calendar
          disabled
          calendar={persian}
          locale={persian_fa}
          minDate={today}
          plugins={[<TimePicker />, weekends()]}
          mapDays={({ date }) => {
            let isWeekend = [6].includes(date.weekDay.index);

            if (isWeekend)
              return {
                disabled: true,
                style: { color: "#ccc" },
                onClick: () => toast.error("آخر هفته ها غیر فعال هستند"),
              };
          }}
          className="text-lg"
          shadow={false}
        />
      </div>
    </div>
  );
};

export default Dashboard;
