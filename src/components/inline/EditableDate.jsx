"use client";

export default function EditableDate({ value, onSave }) {
  return (
    <input
      type="date"
      value={value || ""}
      onChange={(e) => onSave(e.target.value)}
    />
  );
}