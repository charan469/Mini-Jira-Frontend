"use client";

import { useState } from "react";

export default function EditableText({ value, onSave }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(value);

  if (edit) {
    return (
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          setEdit(false);
          onSave(val);
        }}
      />
    );
  }

  return <span onClick={() => setEdit(true)}>{value}</span>;
}