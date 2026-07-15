import { Calendar } from "@hassanmojab/react-modern-calendar-datepicker";
import "@hassanmojab/react-modern-calendar-datepicker/lib/DatePicker.css";

interface PersianCalendarProps {
    onSelectDate: () => void;
}

export default function PersianCalendar({ onSelectDate }: PersianCalendarProps) {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2">انتخاب روز</h2>
      <Calendar
        value={null}
        onChange={onSelectDate}
        shouldHighlightWeekends
        locale="fa"
      />
    </div>
  );
}
