"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { PdfPageThumb } from "./PdfPageThumb";

interface SortablePageGridProps {
  buffer: ArrayBuffer;
  order: number[];
  onChange: (order: number[]) => void;
}

function SortablePage({
  buffer,
  page,
  position,
}: {
  buffer: ArrayBuffer;
  page: number;
  position: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: page });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative flex flex-col items-center gap-1.5 rounded-xl bg-surface p-1.5"
    >
      <div className="relative w-full">
        <PdfPageThumb buffer={buffer} pageNumber={page} />
        <span className="absolute end-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
          {position}
        </span>
        <button
          {...attributes}
          {...listeners}
          className="absolute start-2 top-2 flex h-6 w-6 cursor-grab items-center justify-center rounded-full bg-black/40 text-white active:cursor-grabbing"
          aria-label="اسحب لإعادة الترتيب"
        >
          <GripVertical size={13} />
        </button>
      </div>
      <p className="text-xs font-medium text-ink-soft">صفحة {page}</p>
    </div>
  );
}

export function SortablePageGrid({ buffer, order, onChange }: SortablePageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(Number(active.id));
    const newIndex = order.indexOf(Number(over.id));
    onChange(arrayMove(order, oldIndex, newIndex));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {order.map((page, idx) => (
            <SortablePage key={page} buffer={buffer} page={page} position={idx + 1} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
