import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2, PartyPopper, ExternalLink, QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useBirthday } from "@/contexts/BirthdayContext";
import { useNavigate } from "react-router-dom";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";

const SharePage = () => {
  useBackgroundMusic();
  const { data, shareUrl } = useBirthday();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!data || !shareUrl) {
    navigate("/create");
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `🎂 ${data.name}'s Birthday!`,
          text: `You're invited to ${data.name}'s virtual birthday celebration! 🎉`,
          url: shareUrl,
        });
      } catch {}
    }
  };

  const handlePreview = () => {
    window.open(shareUrl, "_blank");
  };

  const handleDownloadQr = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${data.name}-birthday-qr.png`;
    link.click();
  };

  return (
    <div className="gradient-bg relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-accent/15 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card relative z-20 w-full max-w-lg p-8 text-center"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 shadow-[0_0_40px_rgba(255,107,157,0.3)]"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PartyPopper className="h-12 w-12 text-accent" />
          </motion.div>
        </motion.div>

        <h1 className="text-gradient mb-2 font-display text-3xl font-extrabold">
          🎉 Celebration Ready!
        </h1>
        <p className="mb-6 text-muted-foreground">
          Share this magical link with <span className="font-bold text-primary">{data.name}</span> to
          surprise them with their birthday celebration!
        </p>

        {/* Photo preview */}
        {data.photoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-full border-4 border-primary/50 shadow-[0_0_20px_rgba(255,107,157,0.3)]"
          >
            <img src={data.photoUrl} alt={data.name} className="h-full w-full object-cover" />
          </motion.div>
        )}

        {/* Share URL box */}
        <div className="mb-6 overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            🔗 Shareable Link
          </p>
          <div className="break-all rounded-lg bg-background/50 p-3 text-left text-xs text-foreground/80">
            {shareUrl.length > 120 ? shareUrl.slice(0, 120) + "..." : shareUrl}
          </div>
        </div>

        {/* QR Code Section */}
        <motion.div
          initial={false}
          animate={{ height: showQr ? "auto" : 0, opacity: showQr ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="mb-6 rounded-xl border border-primary/20 bg-muted/20 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              📱 Scan to Celebrate
            </p>
            <div ref={qrRef} className="mx-auto mb-3 w-fit rounded-2xl border-4 border-primary/30 bg-white p-3 shadow-[0_0_30px_rgba(255,107,157,0.2)]">
              <QRCodeCanvas value={shareUrl} size={200} level="L" />
            </div>
            <Button
              onClick={handleDownloadQr}
              variant="outline"
              size="sm"
              className="rounded-full border-primary/40 bg-primary/10 text-sm font-bold text-foreground hover:bg-primary/20"
            >
              <Download className="mr-2 h-4 w-4" /> Download QR
            </Button>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCopy}
            size="lg"
            className="btn-glow w-full rounded-full bg-gradient-to-r from-primary to-secondary font-display text-lg font-bold shadow-xl"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5" /> Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" /> Copy Link
              </>
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={() => setShowQr(!showQr)}
              variant="outline"
              className="flex-1 rounded-full border-accent/50 bg-accent/10 font-bold text-foreground hover:bg-accent/20"
            >
              <QrCode className="mr-2 h-4 w-4" /> {showQr ? "Hide QR" : "QR Code"}
            </Button>
            {typeof navigator.share === "function" && (
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="flex-1 rounded-full border-primary/50 bg-primary/10 font-bold text-foreground hover:bg-primary/20"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            )}
          </div>

          <Button
            onClick={handlePreview}
            variant="outline"
            className="w-full rounded-full border-accent/50 bg-accent/10 font-bold text-foreground hover:bg-accent/20"
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Preview Celebration
          </Button>

          <Button
            onClick={() => navigate("/create")}
            variant="ghost"
            className="mt-2 text-muted-foreground hover:text-foreground"
          >
            ← Create Another
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SharePage;
