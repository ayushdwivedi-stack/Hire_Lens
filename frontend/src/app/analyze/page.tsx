"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ResumeDropzone } from "@/components/analyzer/ResumeDropzone";
import { JobDescriptionInput } from "@/components/analyzer/JobDescriptionInput";
import { JD_MAX_CHARS, JD_MIN_CHARS } from "@/lib/validation";
import { AnalysisProgress, ANALYSIS_STAGES } from "@/components/analyzer/AnalysisProgress";
import { Button } from "@/components/ui/Button";
import { Callout } from "@/components/ui/Callout";
import { analyzeResumeFile, checkHealth, ApiError } from "@/lib/api";
import { saveResult } from "@/lib/resultsStore";

type Status = "idle" | "submitting" | "error";

export default function AnalyzePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [backendUnavailable, setBackendUnavailable] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkHealth()
      .then(() => {
        if (!cancelled) setBackendUnavailable(false);
      })
      .catch(() => {
        if (!cancelled) setBackendUnavailable(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const jdLength = jobDescription.trim().length;
  const jdValid = jdLength >= JD_MIN_CHARS && jdLength <= JD_MAX_CHARS;
  const canSubmit = !!file && !fileError && jdValid && status !== "submitting";

  useEffect(() => {
    return () => {
      if (stageTimer.current) clearInterval(stageTimer.current);
    };
  }, []);

  function startStageProgression() {
    setStageIndex(0);
    stageTimer.current = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, ANALYSIS_STAGES.length - 1));
    }, 6000);
  }

  function stopStageProgression() {
    if (stageTimer.current) {
      clearInterval(stageTimer.current);
      stageTimer.current = null;
    }
  }

  async function handleSubmit() {
    if (!file || !canSubmit) return;
    setStatus("submitting");
    setSubmitError(null);
    startStageProgression();

    try {
      const result = await analyzeResumeFile(file, jobDescription);
      saveResult(result);
      router.push("/results");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setSubmitError(message);
      setStatus("error");
    } finally {
      stopStageProgression();
    }
  }

  if (status === "submitting") {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-6 py-24">
          <AnalysisProgress activeIndex={stageIndex} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-content px-6 py-12">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Analyze your resume</h1>
          <p className="mt-2 max-w-prose text-ink-soft">
            Add your resume and the job description you&apos;re targeting. Both are required to
            run a comparison.
          </p>

          {backendUnavailable && !submitError && (
            <div className="mt-6">
              <Callout tone="error" title="Couldn't connect to Hirelens">
                Please make sure the backend is running at the configured address, then refresh
                this page.
              </Callout>
            </div>
          )}

          {submitError && (
            <div className="mt-6">
              <Callout
                tone="error"
                title="Analysis didn't complete"
                action={
                  <Button variant="secondary" onClick={handleSubmit}>
                    Try again
                  </Button>
                }
              >
                {submitError}
              </Callout>
            </div>
          )}

          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-sm font-medium text-ink">Resume</h2>
              <div className="mt-2">
                <ResumeDropzone
                  file={file}
                  onFileSelected={setFile}
                  error={fileError}
                  onError={setFileError}
                />
              </div>
            </div>

            <JobDescriptionInput value={jobDescription} onChange={setJobDescription} />
          </div>

          <div className="mt-10 flex items-center gap-4 border-t border-line pt-8">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              Analyze resume
            </Button>
            {!file && <p className="text-sm text-ink-faint">Add a resume to get started.</p>}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
