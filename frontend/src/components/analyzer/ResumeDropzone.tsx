"use client";

import { useId, useRef, useState } from "react";
import { cx, formatBytes } from "@/lib/utils";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

interface ResumeDropzoneProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
  error: string | null;
  onError: (message: string | null) => void;
}

function validate(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Hirelens only reads PDF resumes. Please upload a .pdf file.";
  if (file.size > MAX_SIZE_BYTES) return "That file is larger than 10MB. Try a smaller PDF.";
  if (file.size === 0) return "That file looks empty. Please choose a different PDF.";
  return null;
}

export function ResumeDropzone({ file, onFileSelected, error, onError }: ResumeDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const describedById = useId();

  function handleFiles(fileList: FileList | null) {
    const selected = fileList?.[0];
    if (!selected) return;
    const validationError = validate(selected);
    if (validationError) {
      onError(validationError);
      onFileSelected(null);
      return;
    }
    onError(null);
    onFileSelected(selected);
  }

  if (file) {
    return (
      <div className="rounded-md border border-line bg-surface p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFileSelected(null);
              onError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 text-sm text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-bad"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={describedById}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cx(
          "flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-6 py-10 text-center transition-colors",
          isDragOver ? "border-accent bg-accent-soft" : "border-line-strong bg-surface hover:bg-surface-sunken"
        )}
      >
        <p className="text-sm font-medium text-ink">
          Drag and drop your resume, or{" "}
          <span className="text-accent underline underline-offset-4">browse files</span>
        </p>
        <p className="mt-1.5 text-xs text-ink-faint">PDF only, up to 10MB</p>
        <input
          ref={inputRef}
          id={describedById}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
