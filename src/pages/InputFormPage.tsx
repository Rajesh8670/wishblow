import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Hash,
  Heart,
  ImageIcon,
  Loader2,
  MessageSquare,
  Music,
  Plus,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FloatingBalloons } from "@/components/birthday/FloatingBalloons";
import { useBirthday } from "@/contexts/BirthdayContext";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { useToast } from "@/hooks/use-toast";
import { createCelebration } from "@/lib/celebrations";
import { uploadAudioToCloudinary, uploadToCloudinary, optimizedUrl } from "@/lib/cloudinary";
import { buildCelebrationUrl, buildShareUrl } from "@/lib/shareUtils";

const relationshipOptions = [
  "Friend",
  "Best Friend",
  "Brother / Sister",
  "Partner ❤️",
  "Parent",
  "Teacher",
  "Other",
];

const InputFormPage = () => {
  useBackgroundMusic();

  const navigate = useNavigate();
  const { setData, setShareUrl } = useBirthday();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [relationshipTag, setRelationshipTag] = useState("Friend");
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
      toast({ title: "Photo uploaded!" });
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

    const newEntries = toUpload.map((file) => ({
      preview: URL.createObjectURL(file),
      url: null as string | null,
      uploading: true,
    }));

    const startIndex = memoryFiles.length;
    setMemoryFiles((prev) => [...prev, ...newEntries]);

    for (let index = 0; index < toUpload.length; index += 1) {
      try {
        const url = await uploadToCloudinary(toUpload[index]);
        const optimized = optimizedUrl(url, 600);
        setMemoryFiles((prev) =>
          prev.map((memory, memoryIndex) =>
            memoryIndex === startIndex + index
              ? { ...memory, url: optimized, uploading: false }
              : memory,
          ),
        );
      } catch {
        setMemoryFiles((prev) =>
          prev.map((memory, memoryIndex) =>
            memoryIndex === startIndex + index
              ? { ...memory, uploading: false }
              : memory,
          ),
        );
        toast({ title: "Memory upload failed", description: `Image ${index + 1} failed.`, variant: "destructive" });
      }
    }

    if (e.target) {
      e.target.value = "";
    }
  };

  const removeMemory = (index: number) => {
    setMemoryFiles((prev) => prev.filter((_, memoryIndex) => memoryIndex !== index));
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
      toast({ title: "BGM uploaded!" });
    } catch (err: any) {
      toast({ title: "BGM upload failed", description: err.message || "Try again.", variant: "destructive" });
      setBgmName(null);
    } finally {
      setUploadingBgm(false);
    }
  };

  const anyUploading = uploadingPhoto || uploadingBgm || memoryFiles.some((memory) => memory.uploading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !age.trim() || !senderName.trim()) {
      toast({
        title: "Missing fields",
        description: "Please enter the birthday name, age, and your name.",
        variant: "destructive",
      });
      return;
    }

    const parsedAge = parseInt(age, 10);
    if (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      toast({ title: "Invalid age", description: "Enter a valid age (1-150).", variant: "destructive" });
      return;
    }

    if (anyUploading) {
      toast({ title: "Please wait", description: "Images are still uploading.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const validMemoryUrls = memoryFiles.map((memory) => memory.url).filter(Boolean) as string[];

      const birthdayData = {
        name: name.trim(),
        age: parsedAge,
        message: message.trim() || `Happy Birthday ${name.trim()}!`,
        senderName: senderName.trim(),
        relationshipTag,
        photoUrl,
        memoryPhotos: validMemoryUrls,
        wishText: wishText.trim() || message.trim() || `Wishing you the happiest birthday, ${name.trim()}!`,
        audioUrl: null,
        bgmUrl,
      };

      setData(birthdayData);
      let url: string;

      try {
        const created = await createCelebration(birthdayData);
        url = buildCelebrationUrl(created.id);
      } catch (err: any) {
        url = buildShareUrl(birthdayData);
        toast({
          title: "Share link created",
          description:
            err?.message || "Backend was unavailable, so a direct share link was generated instead.",
        });
      }

      setShareUrl(url);
      navigate("/share");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
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
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-2 text-5xl"
          >
            Birthday
          </motion.div>
          <h2 className="text-gradient font-display text-3xl font-extrabold">Create Birthday Wish</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the details and share the magic link.</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-primary" />
              Birthday Person&apos;s Photo
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
                <motion.img
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  src={photoPreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-primary/50"
                />
              ) : (
                <>
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground transition-colors group-hover:text-primary" />
                  <span className="text-sm text-muted-foreground">Upload photo (any size)</span>
                </>
              )}
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <User className="h-3.5 w-3.5 text-primary" /> Name
              </Label>
              <Input
                id="name"
                placeholder="Birthday person name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Hash className="h-3.5 w-3.5 text-primary" /> Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={1}
                max={150}
                className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="senderName" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <User className="h-3.5 w-3.5 text-secondary" /> Your Name
              </Label>
              <Input
                id="senderName"
                placeholder="Who is wishing?"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationshipTag" className="flex items-center gap-1 text-sm font-semibold text-foreground">
                <Heart className="h-3.5 w-3.5 text-secondary" /> Relationship
              </Label>
              <select
                id="relationshipTag"
                value={relationshipTag}
                onChange={(e) => setRelationshipTag(e.target.value)}
                className="flex h-10 w-full rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-foreground focus:border-secondary focus:outline-none"
              >
                {relationshipOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2 font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" /> Short Birthday Message
            </Label>
            <Input
              id="message"
              placeholder="e.g. Happy Birthday, sunshine!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-accent" />
              Memory Photos
              <span className="text-xs font-normal text-muted-foreground">(up to 6)</span>
            </Label>
            <p className="text-xs text-muted-foreground">Upload photos from your device.</p>
            <p className="text-xs font-medium text-primary/80">Images are temporary and auto-delete after viewing.</p>

            {memoryFiles.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                <AnimatePresence>
                  {memoryFiles.map((memory, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative aspect-square overflow-hidden rounded-lg border border-border"
                    >
                      <img src={memory.preview} alt={`Memory ${index + 1}`} className="h-full w-full object-cover" />
                      {memory.uploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                      {!memory.uploading && (
                        <button
                          type="button"
                          onClick={() => removeMemory(index)}
                          className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-destructive"
                        >
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

            <input
              ref={memoryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              multiple
              className="hidden"
              onChange={handleMemoryPhotos}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-semibold text-foreground">
              <Music className="h-4 w-4 text-secondary" />
              Celebration BGM
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <p className="text-xs text-muted-foreground">Upload a song to play during the celebration (max 10MB).</p>
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBgmUrl(null);
                      setBgmName(null);
                    }}
                    className="ml-1 rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                  >
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
            <input
              ref={bgmInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/mp3"
              className="hidden"
              onChange={handleBgmChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wishText" className="flex items-center gap-2 font-semibold text-foreground">
              <Heart className="h-4 w-4 text-primary" /> Heartfelt Wish Message
            </Label>
            <p className="text-xs text-muted-foreground">This special message will be revealed after the cake cutting.</p>
            <Textarea
              id="wishText"
              placeholder="Write a beautiful, heartfelt wish..."
              value={wishText}
              onChange={(e) => setWishText(e.target.value)}
              rows={4}
              className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || anyUploading}
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
