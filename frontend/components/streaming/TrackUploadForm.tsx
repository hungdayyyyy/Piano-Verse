"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, Music2, Video, X, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { useUploadAudioMutation, useUploadVideoMutation } from "@/features/streaming/streamingApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const uploadSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  artist: z.string().min(1, "Artist required").max(100),
  difficulty: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  tags: z.string().optional(),
});

type UploadInput = z.infer<typeof uploadSchema>;

export function TrackUploadForm() {
  const [type, setType] = useState<"audio" | "video">("audio");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploadAudio, { isLoading: uploadingAudio }] = useUploadAudioMutation();
  const [uploadVideo, { isLoading: uploadingVideo }] = useUploadVideoMutation();
  const isUploading = uploadingAudio || uploadingVideo;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UploadInput>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { difficulty: "beginner" },
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (f.size > maxSize) { toast.error("File must be under 100MB"); return; }
    setFile(f);
  };

  const onSubmit = async (data: UploadInput) => {
    if (!file) { toast.error("Please select a file"); return; }

    const formData = new FormData();
    formData.append(type === "audio" ? "audio" : "video", file);
    formData.append("title", data.title);
    formData.append("artist", data.artist);
    formData.append("difficulty", data.difficulty);
    if (data.tags) formData.append("tags", data.tags);

    // Fake progress animation while uploading to Cloudinary
    const interval = setInterval(() => setUploadProgress((v) => Math.min(v + 8, 90)), 300);

    try {
      if (type === "audio") await uploadAudio(formData).unwrap();
      else await uploadVideo(formData).unwrap();

      clearInterval(interval);
      setUploadProgress(100);
      setSuccess(true);
      toast.success("Track uploaded successfully!");
      setTimeout(() => { setSuccess(false); setFile(null); setUploadProgress(0); reset(); }, 2500);
    } catch (err) {
      clearInterval(interval);
      setUploadProgress(0);
      toast.error("Upload failed. Check file format and try again.");
    }
  };

  const removeFile = () => { setFile(null); if (fileRef.current) fileRef.current.value = ""; };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="h-4 w-4 text-[var(--primary)]" />
          Upload Track
        </CardTitle>
        <CardDescription>Upload audio or video tracks (teacher/admin only)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Type selector */}
          <div className="flex gap-3">
            {(["audio", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all",
                  type === t
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--border-muted)]"
                )}
              >
                {t === "audio" ? <Music2 className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* File drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors",
              file ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-muted)]"
            )}
          >
            {file ? (
              <div className="flex items-center gap-3">
                {type === "audio" ? <Music2 className="h-6 w-6 text-[var(--primary)]" /> : <Video className="h-6 w-6 text-[var(--primary)]" />}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-[var(--foreground-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="ml-2 text-[var(--foreground-muted)] hover:text-[var(--destructive)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-[var(--foreground-muted)]" />
                <div className="text-center">
                  <p className="text-sm font-medium">Drop file or click to browse</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    {type === "audio" ? "MP3, WAV, FLAC · Max 100MB" : "MP4, MOV, WebM · Max 100MB"}
                  </p>
                </div>
              </>
            )}
            <input ref={fileRef} type="file"
              accept={type === "audio" ? "audio/*" : "video/*"}
              className="sr-only" onChange={handleFile}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title" error={errors.title?.message} required>
              <Input id="title" placeholder="e.g. Für Elise" {...register("title")} error={!!errors.title} />
            </FormField>
            <FormField label="Artist" htmlFor="artist" error={errors.artist?.message} required>
              <Input id="artist" placeholder="e.g. Ludwig van Beethoven" {...register("artist")} error={!!errors.artist} />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Difficulty" htmlFor="difficulty">
              <Select id="difficulty" {...register("difficulty")}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </Select>
            </FormField>
            <FormField label="Tags" htmlFor="tags" hint="Comma-separated">
              <Input id="tags" placeholder="classical, baroque, solo" {...register("tags")} />
            </FormField>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                <span>Uploading to Cloudinary…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--background-muted)]">
                <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <Button type="submit" disabled={isUploading || success || !file} className="w-full">
            {success ? (
              <><CheckCircle2 className="mr-2 h-4 w-4" />Uploaded!</>
            ) : isUploading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
            ) : (
              <><Upload className="mr-2 h-4 w-4" />Upload {type}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
