"use client";

export default function EditableSelect({ value, options, onSave }) {
  return (
    <select value={value} onChange={(e) => onSave(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}