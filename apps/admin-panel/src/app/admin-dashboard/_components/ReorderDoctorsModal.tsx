"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { PuffLoader } from "react-spinners";
import {
  useAllDoctorsForReorder,
  useReorderDoctors,
} from "@/hooks/useDoctors";

type DoctorItem = {
  id: string;
  name: string;
  avatar?: string | null;
};

function SortableDoctorRow({ doctor }: { doctor: DoctorItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: doctor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-md border border-gray-200 bg-white px-4 py-3 ${
        isDragging ? "opacity-70 shadow-md" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        aria-label="جابه‌جایی"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      {doctor.avatar ? (
        <img
          src={doctor.avatar}
          alt={doctor.name}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm text-gray-500">
          {doctor.name.charAt(0)}
        </div>
      )}
      <span className="flex-1 text-right font-medium">{doctor.name}</span>
    </div>
  );
}

type ReorderDoctorsModalProps = {
  onClose: () => void;
  onSaved: () => void;
};

export default function ReorderDoctorsModal({
  onClose,
  onSaved,
}: ReorderDoctorsModalProps) {
  const { data, isLoading, error } = useAllDoctorsForReorder();
  const { mutate: reorderDoctors, isPending } = useReorderDoctors(() => {
    onSaved();
    onClose();
  });
  const [items, setItems] = useState<DoctorItem[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (data?.data) {
      setItems(data.data);
    }
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    reorderDoctors(items.map((item) => item.id));
  };

  return (
    <div className="flex w-full flex-col p-8">
      <h2 className="mb-2 text-center text-2xl font-bold">تغییر ترتیب مشاورین</h2>
      <p className="mb-6 text-center text-sm text-gray-500">
        با کشیدن و رها کردن، ترتیب نمایش در سایت را تغییر دهید.
      </p>

      {isLoading && (
        <div className="flex justify-center py-12">
          <PuffLoader size={48} color="#3e86fa" />
        </div>
      )}

      {error && (
        <p className="py-8 text-center text-rose-500">خطا در دریافت لیست مشاورین</p>
      )}

      {!isLoading && !error && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto">
              {items.map((doctor) => (
                <SortableDoctorRow key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-md border border-gray-300 px-8 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isLoading || !!error || items.length === 0}
          className="rounded-md bg-blue-600 px-8 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "در حال ذخیره..." : "ذخیره ترتیب"}
        </button>
      </div>
    </div>
  );
}
