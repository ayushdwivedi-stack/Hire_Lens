export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>Hirelens — resume and job description matching.</p>
        <p>In the local setup, analysis runs through Ollama on your machine.</p>
      </div>
    </footer>
  );
}
