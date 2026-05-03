"use client";

import { useState } from "react";

export default function EditableTextarea({ value, onSave }) {
  const [edit, setEdit] = useState(false);
  const [val, setVal] = useState(value);

  if (edit) {
    return (
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => {
          setEdit(false);
          onSave(val);
        }}
      />
    );
  }

  return <div onClick={() => setEdit(true)}>{value}</div>;
}