import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Upload, User, Hash, MessageSquare, ArrowRight, ImageIcon, Sparkles, Heart, X, Plus, Loader2, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBirthday } from "@/contexts/BirthdayContext";
import { useToast } from "@/hooks/use-toast";
import { FloatingBalloons } from "@/components/birthday/FloatingBalloons";
import { buildShareUrl } from "@/lib/shareUtils";
import { uploadToCloudinary, uploadAudioToCloudinary, optimizedUrl } from "@/lib/cloudinary";

const InputFormPage = () => {
  const navigate = useNavigate();
  const { setData, setShareUrl } = useBirthday();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const [wishText, setWishText] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [memoryFiles, setMemoryFiles] = useState<{ preview: string; url: string | null; uploading: boolean }[]>([]);
  const [bgmUrl, setBgmUrl] = useState<string | null>(null);
  const [bgmName, setBgmName] = useState<string | null>(null);
  const [uploadingBgm, setUploadingBgm] = useState(false);
  const [loading, setLoading] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const memoryInputRef = useRef<HTMLInputElement>(null);
  const bgmInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoUrl(optimizedUrl(url, 500));
      toast({ title: "Photo uploaded! ✅" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Try again.", variant: "destructive" });
      setPhotoPreview(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleMemoryPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - memoryFiles.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    const newEntries = toUpload.map(f => ({
      preview: URL.createObjectURL(f),
      url: null as string | null,
      uploading: true,
    }));
    const startIdx = memoryFiles.length;
    setMemoryFiles(prev => [...prev, ...newEntries]);

    for (let i = 0; i < toUpload.length; i++) {
      try {
        const url = await uploadToCloudinary(toUpload[i]);
        const optimized = optimizedUrl(url, 600);
        setMemoryFiles(prev =>
          prev.map((m, idx) => idx === startIdx + i ? { ...m, url: optimized, uploading: false } : m)
        );
      } catch {
        setMemoryFiles(prev =>
          prev.map((m, idx) => idx === startIdx + i ? { ...m, uploading: false } : m)
        );
        toast({ title: "Memory upload failed", description: `Image ${i + 1} failed.`, variant: "destructive" });
      }
    }
    if (e.target) e.target.value = "";
  };

  const removeMemory = (index: number) => {
    setMemoryFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleBgmChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 10MB for audio.", variant: "destructive" });
      return;
    }
    setBgmName(file.name);
    setUploadingBgm(true);
    try {
      const url = await uploadAudioToCloudinary(file);
      setBgmUrl(url);
      toast({ title: "BGM uploaded! 🎵" });
    } catch (err: any) {
      toast({ title: "BGM upload failed", description: err.message || "Try again.", variant: "destructive" });
      setBgmName(null);
    } finally {
      setUploadingBgm(false);
    }
  };

  const anyUploading = uploadingPhoto || uploadingBgm || memoryFiles.some(m => m.uploading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) {
      toast({ title: "Missing fields", description: "Please enter name and age.", variant: "destructive" });
      return;
    }
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      toast({ title: "Invalid age", description: "Enter a valid age (1-150).", variant: "destructive" });
      return;
    }
    if (anyUploading) {
      toast({ title: "Please wait", description: "Images are still uploading.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const validMemoryUrls = memoryFiles.map(m => m.url).filter(Boolean) as string[];

      const birthdayData = {
        name: name.trim(),
        age: parsedAge,
        message: message.trim() || `Happy Birthday ${name.trim()}! 🎂🎉`,
        photoUrl: photoUrl,
        memoryPhotos: validMemoryUrls,
        wishText: wishText.trim() || message.trim() || `Wishing you the happiest birthday, ${name.trim()}! 💖`,
        audioUrl: null,
        bgmUrl: bgmUrl,
      };

      setData(birthdayData);

      const shareableData = {
        name: birthdayData.name,
        age: birthdayData.age,
        message: birthdayData.message,
        photoUrl: birthdayData.photoUrl,
        memoryPhotos: validMemoryUrls,
        wishText: birthdayData.wishText,
        bgmUrl: birthdayData.bgmUrl,
      };
      const url = buildShareUrl(shareableData);
      setShareUrl(url);
      navigate("/share");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8">
      <FloatingBalloons />

      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-secondary/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card relative z-20 w-full max-w-md p-6 sm:p-8"
      >
        <motion.div className="mb-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="mb-2 text-5xl">
            🎂
          </motion.div>
          <h2 className="text-gradient font-display text-3xl font-extrabold">Create Birthday Wish</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the details and share the magic link! ✨</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Photo Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-primary" />
              Birthday Person's Photo
            </Label>
            <div
              onClick={() => !uploadingPhoto && photoInputRef.current?.click()}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 transition-all hover:border-primary hover:bg-primary/10"
            >
              {uploadingPhoto ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : photoPreview ? (
                <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                  src={photoPreview} alt="Preview"
                  className="h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-primary/50" />
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="text-sm text-muted-foreground">Upload photo (any size)</span>
                </>
              )}
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <User className="h-3.5 w-3.5 text-primary" /> Name
              </Label>
              <Input id="name" placeholder="Name" value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Hash className="h-3.5 w-3.5 text-primary" /> Age
              </Label>
              <Input id="age" type="number" placeholder="Age" value={age}
                onChange={(e) => setAge(e.target.value)} min={1} max={150}
                className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary" />
            </div>
          </div>

          {/* Birthday Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2 font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" /> Short Birthday Message
            </Label>
            <Input id="message" placeholder="e.g. Happy Birthday, sunshine! 🌟"
              value={message} onChange={(e) => setMessage(e.target.value)}
              className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary" />
          </div>

          {/* Memory Photos Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-accent" />
              Memory Photos
              <span className="text-xs font-normal text-muted-foreground">(up to 6)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload photos from your device — they'll appear as memory cards 💫
            </p>
            <p className="text-xs text-primary/80 font-medium">
              🔒 Images are temporary and will be auto-deleted after viewing the celebration.
            </p>

            {/* Memory previews grid */}
            {memoryFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <AnimatePresence>
                  {memoryFiles.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border"
                    >
                      <img src={m.preview} alt={`Memory ${i + 1}`} className="h-full w-full object-cover" />
                      {m.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                      {!m.uploading && (
                        <button type="button" onClick={() => removeMemory(i)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {memoryFiles.length < 6 && (
              <button
                type="button"
                onClick={() => memoryInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/10 p-2.5 text-sm text-muted-foreground transition-all hover:border-accent hover:text-accent"
              >
                <Plus className="h-4 w-4" /> Upload memory photos
              </button>
            )}
            <input ref={memoryInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jpg" multiple className="hidden" onChange={handleMemoryPhotos} />
          </div>

          {/* BGM Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <Music className="h-4 w-4 text-secondary" />
              Celebration BGM
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">
              Upload a song to play during the celebration 🎵 (max 10MB)
            </p>
            <div
              onClick={() => !uploadingBgm && bgmInputRef.current?.click()}
              className="group flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 p-4 transition-all hover:border-secondary hover:bg-secondary/10"
            >
              {uploadingBgm ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                  <span className="text-sm text-muted-foreground">Uploading audio...</span>
                </div>
              ) : bgmUrl ? (
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-secondary" />
                  <span className="text-sm font-medium text-foreground">{bgmName}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setBgmUrl(null); setBgmName(null); }}
                    className="ml-1 rounded-full p-0.5 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-secondary" />
                  <span className="text-sm text-muted-foreground">Upload MP3, WAV, or M4A</span>
                </>
              )}
            </div>
            <input ref={bgmInputRef} type="file" accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/mp3" className="hidden" onChange={handleBgmChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wishText" className="flex items-center gap-2 font-semibold text-foreground">
              <Heart className="h-4 w-4 text-primary" /> Heartfelt Wish Message
            </Label>
            <p className="text-xs text-muted-foreground">
              This special message will be revealed after the cake cutting 💝
            </p>
            <Textarea id="wishText" placeholder="Write a beautiful, heartfelt wish..."
              value={wishText} onChange={(e) => setWishText(e.target.value)} rows={4}
              className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary" />
          </div>

          <Button type="submit" size="lg" disabled={loading || anyUploading}
            className="btn-glow w-full rounded-full bg-gradient-to-r from-primary to-secondary font-display text-lg font-bold shadow-xl transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating...
              </span>
            ) : anyUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading images...
              </span>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate & Share
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default InputFormPage;
