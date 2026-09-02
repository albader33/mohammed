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
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FileText, GripVertical, X } from "lucide-react";

interface FileItem {
  id: string;
  file: File;
}

interface SortableFileListProps {
  items: FileItem[];
  onChange: (items: FileItem[]) => void;
  onRemove: (id: string) => void;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`;
}

function Row({ item, index, onRemove }: { item: FileItem; index: number; onRemove: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex h-8 w-8 shrink-0 cursor-grab items-center justify-center rounded-lg text-ink-soft hover:bg-line/50 active:cursor-grabbing"
        aria-label="اسحب لإعادة الترتيب"
      >
        <GripVertical size={16} />
      </button>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
        <FileText size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{item.file.name}</p>
        <p className="text-xs text-ink-soft">{formatSize(item.file.size)}</p>
      </div>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-line/60 text-xs font-bold text-ink-soft">
        {index + 1}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-red-50 hover:text-red-600"
        aria-label="إزالة الملف"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function SortableFileList({ items, onChange, onRemove }: SortableFileListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onChange(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">
          {items.map((item, idx) => (
            <Row key={item.id} item={item} index={idx} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
