import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TOOL_LIST = [
  { key: "crop", label: "Crop", icon: "fa-crop-simple" },
  { key: "resize", label: "Resize", icon: "fa-up-right-and-down-left-from-center" },
  { key: "filters", label: "Filters", icon: "fa-wand-magic-sparkles" },
  { key: "adjustments", label: "Adjustments", icon: "fa-sliders" },
  { key: "retouch", label: "Retouch", icon: "fa-sparkles" },
  { key: "watermark", label: "Watermark", icon: "fa-stamp" },
  { key: "text", label: "Text", icon: "fa-font" },
  { key: "frames", label: "Frames", icon: "fa-border-all" },
  { key: "background", label: "Background", icon: "fa-fill-drip" },
  { key: "ai", label: "AI Enhance", icon: "fa-robot" },
  { key: "export", label: "Export", icon: "fa-file-export" },
  { key: "history", label: "History", icon: "fa-clock-rotate-left" },
];

const CROP_PRESETS = [
  { key: "free", label: "Free", ratio: null },
  { key: "1:1", label: "1:1", ratio: 1 },
  { key: "4:5", label: "4:5", ratio: 4 / 5 },
  { key: "16:9", label: "16:9", ratio: 16 / 9 },
  { key: "9:16", label: "9:16", ratio: 9 / 16 },
  { key: "instagram", label: "Instagram", ratio: 4 / 5 },
  { key: "facebook", label: "Facebook", ratio: 1.91 / 1 },
  { key: "linkedin", label: "LinkedIn", ratio: 1.91 / 1 },
  { key: "banner", label: "Website Banner", ratio: 3 / 1 },
];

const FILTER_PRESETS = {
  none: {},
  natural: { brightness: 4, contrast: 4, saturation: 4, vibrance: 3 },
  portrait: { brightness: 8, contrast: 3, saturation: 5, temperature: 2, retouch: 10 },
  wedding: { brightness: 12, contrast: -2, saturation: 3, highlights: 8, vibrance: 8, temperature: 4 },
  fashion: { contrast: 10, vibrance: 6, clarity: 6, sharpness: 10 },
  vintage: { saturation: -10, temperature: 8, grain: 15, fade: 8 },
  bw: { saturation: -100, contrast: 8, clarity: 10 },
  cinematic: { contrast: 12, shadows: -8, temperature: -2, tint: 3, dehaze: 4 },
  golden: { temperature: 12, saturation: 6, highlights: 8, vibrance: 10 },
  airy: { brightness: 12, exposure: 6, shadows: 10, contrast: -6 },
  moody: { contrast: 14, shadows: -14, saturation: -6, clarity: 10 },
  landscape: { contrast: 8, saturation: 10, vibrance: 12, dehaze: 8, sharpness: 10 },
  studio: { brightness: 5, contrast: 6, whites: 8, blacks: -6, sharpness: 8 },
  editorial: { contrast: 10, highlights: -8, shadows: 7, tint: 4, grain: 8 },
};

const AI_PRESETS = {
  auto: { brightness: 6, contrast: 5, vibrance: 6, sharpness: 6 },
  noise: { retouch: 12, clarity: -4, sharpness: 4 },
  face: { brightness: 4, retouch: 16, vibrance: 3 },
  color: { vibrance: 12, saturation: 8, temperature: 2, tint: 2 },
  sky: { dehaze: 10, saturation: 8, contrast: 6, tint: -4 },
  sharp: { sharpness: 18, clarity: 10 },
  restore: { brightness: 6, contrast: 5, grain: -10, retouch: 8 },
  repair: { brightness: 8, contrast: 4, grain: -15, retouch: 10, saturation: -8 },
};

const FRAME_STYLES = {
  none: { padding: 0, color: "transparent", radius: 0 },
  clean: { padding: 18, color: "#ffffff", radius: 10 },
  gallery: { padding: 24, color: "#f4efe8", radius: 12 },
  polaroid: { padding: 18, color: "#fffef8", radius: 6, footer: 56 },
  wedding: { padding: 20, color: "#fdf7f8", radius: 16 },
  modern: { padding: 14, color: "#1a2e3b", radius: 14 },
  editorial: { padding: 30, color: "#ece6de", radius: 0 },
};

const DEFAULT_STATE = {
  cropPreset: "free",
  customWidth: 1800,
  customHeight: 1200,
  zoom: 1,
  rotation: 0,
  flipH: false,
  flipV: false,
  straighten: 0,
  filterPreset: "none",
  filterIntensity: 100,
  adjustments: {
    brightness: 0,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    whites: 0,
    blacks: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    sharpness: 0,
    clarity: 0,
    dehaze: 0,
    grain: 0,
    fade: 0,
    retouch: 0,
  },
  watermark: {
    enabled: false,
    type: "text",
    text: "Relic Snap",
    opacity: 35,
    scale: 1,
    rotation: -20,
    position: "bottomRight",
    customX: 50,
    customY: 50,
    color: "#ffffff",
    logoUrl: "",
  },
  textOverlay: {
    enabled: false,
    text: "",
    fontSize: 52,
    fontWeight: 700,
    color: "#ffffff",
    opacity: 100,
    rotation: 0,
    align: "center",
    x: 50,
    y: 14,
    shadow: 35,
    stroke: 0,
  },
  frame: "none",
  background: {
    mode: "transparent",
    solid: "#ffffff",
    gradientFrom: "#1A2E3B",
    gradientTo: "#6BBDD0",
    blur: 0,
  },
  export: {
    format: "image/jpeg",
    quality: 0.92,
    preset: "original",
  },
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeAdjustments(base, patch, intensity = 100) {
  const next = { ...base };
  const factor = intensity / 100;
  Object.entries(patch || {}).forEach(([key, value]) => {
    next[key] = (next[key] || 0) + value * factor;
  });
  return next;
}

function getAppliedAdjustments(state) {
  return mergeAdjustments(
    state.adjustments,
    FILTER_PRESETS[state.filterPreset] || {},
    state.filterIntensity
  );
}

function getAspectRatio(state) {
  if (state.cropPreset === "custom" && state.customWidth > 0 && state.customHeight > 0) {
    return state.customWidth / state.customHeight;
  }
  const preset = CROP_PRESETS.find((item) => item.key === state.cropPreset);
  return preset?.ratio ?? null;
}

function fitDimensions(width, height, ratio = null) {
  if (!ratio) return { width, height };
  const currentRatio = width / height;
  if (currentRatio > ratio) {
    return { width: Math.round(height * ratio), height };
  }
  return { width, height: Math.round(width / ratio) };
}

function getCanvasFilter(state) {
  const a = getAppliedAdjustments(state);
  const brightness = 100 + a.brightness + a.exposure * 1.4 + a.whites * 0.4 - a.blacks * 0.2;
  const contrast = 100 + a.contrast + a.clarity * 0.5 + a.dehaze * 0.4;
  const saturate = 100 + a.saturation + a.vibrance * 0.7;
  const sepia = clamp((a.temperature + a.fade) * 0.6, 0, 100);
  const grayscale = clamp(-a.saturation, 0, 100);
  const blur = Math.max(0, a.retouch * 0.06 + Math.max(0, -a.sharpness) * 0.03);
  return [
    `brightness(${brightness}%)`,
    `contrast(${contrast}%)`,
    `saturate(${saturate}%)`,
    `sepia(${sepia}%)`,
    `grayscale(${grayscale}%)`,
    `blur(${blur}px)`,
  ].join(" ");
}

function positionFromKey(position, width, height, customX, customY) {
  if (position === "custom") return { x: (customX / 100) * width, y: (customY / 100) * height };
  if (position === "center") return { x: width / 2, y: height / 2 };
  if (position === "topLeft") return { x: 80, y: 70 };
  if (position === "topRight") return { x: width - 80, y: 70 };
  if (position === "bottomLeft") return { x: 80, y: height - 60 };
  return { x: width - 80, y: height - 60 };
}

function qualityLabelToValue(value) {
  if (value === "low") return 0.55;
  if (value === "medium") return 0.78;
  if (value === "high") return 0.92;
  return 1;
}

function draftStorageKey(mediaId) {
  return `media_editor_draft_${mediaId}`;
}

function versionStorageKey(mediaId) {
  return `media_editor_versions_${mediaId}`;
}

export default function MediaEditingStudio({
  photo,
  albumName,
  selectedCount = 1,
  onClose,
  onPublish,
}) {
  const canvasRef = useRef(null);
  const hiddenImageRef = useRef(null);
  const historyRef = useRef([deepClone(DEFAULT_STATE)]);
  const historyIndexRef = useRef(0);
  const [tool, setTool] = useState("crop");
  const [editorState, setEditorState] = useState(DEFAULT_STATE);
  const [history, setHistory] = useState([deepClone(DEFAULT_STATE)]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [originalReady, setOriginalReady] = useState(false);
  const [zoomView, setZoomView] = useState(1);
  const [compareSplit, setCompareSplit] = useState(50);
  const [showCompare, setShowCompare] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState("Saved");
  const [versionRefresh, setVersionRefresh] = useState(0);
  const [versionHistory, setVersionHistory] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const sourceUrl = useMemo(
    () => photo?.fileUrl || photo?.watermarkedUrl || photo?.imageUrl || "",
    [photo]
  );

  const pushState = useCallback((producer) => {
    setEditorState((current) => {
      const next = typeof producer === "function" ? producer(current) : producer;
      const snapshot = deepClone(next);
      const nextHistory = [...historyRef.current.slice(0, historyIndexRef.current + 1), snapshot];
      historyRef.current = nextHistory;
      historyIndexRef.current = nextHistory.length - 1;
      setHistory(nextHistory);
      setHistoryIndex(historyIndexRef.current);
      setAutoSaveState("Editing…");
      return next;
    });
  }, []);

  useEffect(() => {
    const draftRaw = localStorage.getItem(draftStorageKey(photo?._id));
    const nextState = draftRaw ? { ...deepClone(DEFAULT_STATE), ...JSON.parse(draftRaw) } : deepClone(DEFAULT_STATE);
    setEditorState(nextState);
    const nextHistory = [deepClone(nextState)];
    historyRef.current = nextHistory;
    historyIndexRef.current = 0;
    setHistory(nextHistory);
    setHistoryIndex(0);
    setTool("crop");
    setShowCompare(false);
  }, [photo?._id]);

  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(draftStorageKey(photo?._id), JSON.stringify(editorState));
      setAutoSaveState(`Auto-saved ${new Date().toLocaleTimeString()}`);
    }, 4000);
    return () => clearInterval(timer);
  }, [editorState, photo?._id]);

  useEffect(() => {
    setVersionHistory(JSON.parse(localStorage.getItem(versionStorageKey(photo?._id)) || "[]"));
  }, [photo?._id, versionRefresh]);

  const renderCanvas = useCallback(() => {
    const image = hiddenImageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !image.naturalWidth || !image.naturalHeight) return;

    const ratio = getAspectRatio(editorState);
    const baseSize = fitDimensions(image.naturalWidth, image.naturalHeight, ratio);
    const frame = FRAME_STYLES[editorState.frame] || FRAME_STYLES.none;
    const framePadding = frame.padding || 0;
    const footerPadding = frame.footer || 0;

    canvas.width = baseSize.width + framePadding * 2;
    canvas.height = baseSize.height + framePadding * 2 + footerPadding;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (editorState.background.mode === "solid") {
      ctx.fillStyle = editorState.background.solid;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (editorState.background.mode === "gradient") {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, editorState.background.gradientFrom);
      gradient.addColorStop(1, editorState.background.gradientTo);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (frame.color !== "transparent") {
      ctx.fillStyle = frame.color;
      if (frame.radius) {
        ctx.beginPath();
        ctx.roundRect(0, 0, canvas.width, canvas.height, frame.radius);
        ctx.fill();
      } else {
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const drawWidth = baseSize.width;
    const drawHeight = baseSize.height;
    const offsetX = framePadding;
    const offsetY = framePadding;

    ctx.save();
    ctx.filter = getCanvasFilter(editorState);
    ctx.translate(offsetX + drawWidth / 2, offsetY + drawHeight / 2);
    ctx.rotate(((editorState.rotation + editorState.straighten) * Math.PI) / 180);
    ctx.scale(
      (editorState.flipH ? -1 : 1) * editorState.zoom,
      (editorState.flipV ? -1 : 1) * editorState.zoom
    );
    ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
    ctx.filter = "none";

    const adjustments = getAppliedAdjustments(editorState);
    if (adjustments.grain > 0) {
      ctx.save();
      ctx.globalAlpha = adjustments.grain / 240;
      for (let i = 0; i < 9000; i += 1) {
        ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#000000";
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          1,
          1
        );
      }
      ctx.restore();
    }

    if (editorState.watermark.enabled) {
      ctx.save();
      const mark = editorState.watermark;
      const markPos = positionFromKey(mark.position, canvas.width, canvas.height, mark.customX, mark.customY);
      ctx.translate(markPos.x, markPos.y);
      ctx.rotate((mark.rotation * Math.PI) / 180);
      ctx.globalAlpha = mark.opacity / 100;
      if (mark.type === "text") {
        ctx.fillStyle = mark.color;
        ctx.font = `${Math.round(42 * mark.scale)}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(mark.text || "Relic Snap", 0, 0);
      } else if (mark.logoUrl) {
        const logo = new Image();
        logo.src = mark.logoUrl;
      }
      ctx.restore();
    }

    if (editorState.textOverlay.enabled && editorState.textOverlay.text.trim()) {
      const text = editorState.textOverlay;
      ctx.save();
      ctx.globalAlpha = text.opacity / 100;
      ctx.translate((text.x / 100) * canvas.width, (text.y / 100) * canvas.height);
      ctx.rotate((text.rotation * Math.PI) / 180);
      ctx.font = `${text.fontWeight} ${text.fontSize}px Georgia, serif`;
      ctx.textAlign = text.align;
      ctx.fillStyle = text.color;
      if (text.shadow > 0) {
        ctx.shadowColor = `rgba(0,0,0,${text.shadow / 100})`;
        ctx.shadowBlur = 20;
      }
      if (text.stroke > 0) {
        ctx.lineWidth = text.stroke;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.strokeText(text.text, 0, 0);
      }
      ctx.fillText(text.text, 0, 0);
      ctx.restore();
    }

    setPreviewUrl(canvas.toDataURL("image/png"));
  }, [editorState]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const applyFilterPreset = (presetKey) => {
    pushState((current) => ({ ...current, filterPreset: presetKey }));
  };

  const updateAdjustment = (key, value) => {
    pushState((current) => ({
      ...current,
      adjustments: { ...current.adjustments, [key]: Number(value) },
    }));
  };

  const applyAiPreset = (presetKey) => {
    pushState((current) => ({
      ...current,
      adjustments: mergeAdjustments(current.adjustments, AI_PRESETS[presetKey], 100),
    }));
  };

  const resetCurrentTool = () => {
    pushState((current) => {
      const next = deepClone(current);
      if (tool === "adjustments" || tool === "filters" || tool === "retouch" || tool === "ai") {
        next.filterPreset = "none";
        next.adjustments = deepClone(DEFAULT_STATE.adjustments);
      } else if (tool === "crop" || tool === "resize") {
        next.cropPreset = "free";
        next.zoom = 1;
        next.rotation = 0;
        next.straighten = 0;
        next.flipH = false;
        next.flipV = false;
      } else if (tool === "watermark") {
        next.watermark = deepClone(DEFAULT_STATE.watermark);
      } else if (tool === "text") {
        next.textOverlay = deepClone(DEFAULT_STATE.textOverlay);
      } else if (tool === "frames") {
        next.frame = "none";
      } else if (tool === "background") {
        next.background = deepClone(DEFAULT_STATE.background);
      }
      return next;
    });
  };

  const revertAll = () => {
    const next = deepClone(DEFAULT_STATE);
    setEditorState(next);
    const nextHistory = [deepClone(next)];
    historyRef.current = nextHistory;
    historyIndexRef.current = 0;
    setHistory(nextHistory);
    setHistoryIndex(0);
    setAutoSaveState("Reverted");
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    setEditorState(deepClone(history[nextIndex]));
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextIndex = historyIndex + 1;
    historyIndexRef.current = nextIndex;
    setHistoryIndex(nextIndex);
    setEditorState(deepClone(history[nextIndex]));
  };

  const saveDraft = () => {
    localStorage.setItem(draftStorageKey(photo?._id), JSON.stringify(editorState));
    const versions = JSON.parse(localStorage.getItem(versionStorageKey(photo?._id)) || "[]");
    versions.unshift({
      id: `${Date.now()}`,
      label: `Draft ${new Date().toLocaleString()}`,
      state: editorState,
    });
    localStorage.setItem(versionStorageKey(photo?._id), JSON.stringify(versions.slice(0, 12)));
    setVersionRefresh((value) => value + 1);
    setAutoSaveState("Draft saved");
  };

  const exportImage = async () => {
    setExporting(true);
    try {
      const canvas = canvasRef.current;
      const quality = editorState.export.quality;
      const ext = editorState.export.format === "image/png" ? "png" : editorState.export.format === "image/webp" ? "webp" : "jpg";
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) return resolve();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${(photo?.title || "edited-photo").replace(/\s+/g, "-").toLowerCase()}.${ext}`;
          link.click();
          URL.revokeObjectURL(url);
          resolve();
        }, editorState.export.format, quality);
      });
    } finally {
      setExporting(false);
    }
  };

  const publishImage = async (applyToSelected) => {
    if (!canvasRef.current || !onPublish) return;
    setPublishing(true);
    try {
      const blob = await new Promise((resolve) => {
        canvasRef.current.toBlob(resolve, editorState.export.format, editorState.export.quality);
      });
      if (!blob) return;
      await onPublish({
        blob,
        state: editorState,
        applyToSelected,
      });
      saveDraft();
    } finally {
      setPublishing(false);
    }
  };

  const renderToolControls = () => {
    const adjustments = getAppliedAdjustments(editorState);

    if (tool === "crop" || tool === "resize") {
      return (
        <>
          <label style={styles.label}>Aspect Ratio</label>
          <div style={styles.chipGrid}>
            {[...CROP_PRESETS, { key: "custom", label: "Custom" }].map((item) => (
              <button key={item.key} onClick={() => pushState((current) => ({ ...current, cropPreset: item.key }))} style={chipStyle(editorState.cropPreset === item.key)}>
                {item.label}
              </button>
            ))}
          </div>
          {editorState.cropPreset === "custom" && (
            <div style={styles.rowTwo}>
              <input type="number" value={editorState.customWidth} onChange={(e) => pushState((current) => ({ ...current, customWidth: Number(e.target.value) || 1 }))} className="form-control" />
              <input type="number" value={editorState.customHeight} onChange={(e) => pushState((current) => ({ ...current, customHeight: Number(e.target.value) || 1 }))} className="form-control" />
            </div>
          )}
          <Slider label="Zoom" min={1} max={2.4} step={0.01} value={editorState.zoom} onChange={(value) => pushState((current) => ({ ...current, zoom: Number(value) }))} />
          <Slider label="Rotate" min={-180} max={180} step={1} value={editorState.rotation} onChange={(value) => pushState((current) => ({ ...current, rotation: Number(value) }))} />
          <Slider label="Straighten" min={-20} max={20} step={1} value={editorState.straighten} onChange={(value) => pushState((current) => ({ ...current, straighten: Number(value) }))} />
          <div style={styles.rowTwo}>
            <button style={styles.secondaryBtn} onClick={() => pushState((current) => ({ ...current, flipH: !current.flipH }))}>Flip Horizontal</button>
            <button style={styles.secondaryBtn} onClick={() => pushState((current) => ({ ...current, flipV: !current.flipV }))}>Flip Vertical</button>
          </div>
        </>
      );
    }

    if (tool === "filters") {
      return (
        <>
          <label style={styles.label}>Professional Presets</label>
          <div style={styles.chipGrid}>
            {Object.keys(FILTER_PRESETS).map((key) => (
              <button key={key} style={chipStyle(editorState.filterPreset === key)} onClick={() => applyFilterPreset(key)}>
                {key === "none" ? "Original" : key}
              </button>
            ))}
          </div>
          <Slider label="Preset Intensity" min={0} max={150} step={1} value={editorState.filterIntensity} onChange={(value) => pushState((current) => ({ ...current, filterIntensity: Number(value) }))} />
        </>
      );
    }

    if (tool === "adjustments" || tool === "retouch") {
      const controls = tool === "retouch"
        ? [
            ["retouch", "Skin Smoothing"],
            ["sharpness", "Eye Enhancement"],
            ["brightness", "Teeth Whitening"],
            ["clarity", "Spot Healing"],
            ["shadows", "Background Cleanup"],
          ]
        : [
            ["brightness", "Brightness"],
            ["exposure", "Exposure"],
            ["contrast", "Contrast"],
            ["highlights", "Highlights"],
            ["shadows", "Shadows"],
            ["whites", "Whites"],
            ["blacks", "Blacks"],
            ["saturation", "Saturation"],
            ["vibrance", "Vibrance"],
            ["temperature", "Temperature"],
            ["tint", "Tint"],
            ["sharpness", "Sharpness"],
            ["clarity", "Clarity"],
            ["dehaze", "Dehaze"],
            ["grain", "Grain"],
          ];
      return controls.map(([key, label]) => (
        <Slider key={key} label={label} min={-100} max={100} step={1} value={adjustments[key] || 0} onChange={(value) => updateAdjustment(key, value)} />
      ));
    }

    if (tool === "watermark") {
      return (
        <>
          <label style={styles.label}>Watermark Type</label>
          <div style={styles.rowTwo}>
            <button style={chipStyle(editorState.watermark.type === "text")} onClick={() => pushState((current) => ({ ...current, watermark: { ...current.watermark, enabled: true, type: "text" } }))}>Text</button>
            <button style={chipStyle(editorState.watermark.type === "logo")} onClick={() => pushState((current) => ({ ...current, watermark: { ...current.watermark, enabled: true, type: "logo" } }))}>Logo</button>
          </div>
          <input className="form-control" value={editorState.watermark.text} onChange={(e) => pushState((current) => ({ ...current, watermark: { ...current.watermark, text: e.target.value, enabled: true } }))} placeholder="Watermark text" />
          <Slider label="Opacity" min={0} max={100} step={1} value={editorState.watermark.opacity} onChange={(value) => pushState((current) => ({ ...current, watermark: { ...current.watermark, opacity: Number(value), enabled: true } }))} />
          <Slider label="Scale" min={0.4} max={2.5} step={0.01} value={editorState.watermark.scale} onChange={(value) => pushState((current) => ({ ...current, watermark: { ...current.watermark, scale: Number(value), enabled: true } }))} />
          <Slider label="Rotation" min={-180} max={180} step={1} value={editorState.watermark.rotation} onChange={(value) => pushState((current) => ({ ...current, watermark: { ...current.watermark, rotation: Number(value), enabled: true } }))} />
          <div style={styles.chipGrid}>
            {["center", "bottomLeft", "bottomRight", "topLeft", "topRight", "custom"].map((key) => (
              <button key={key} style={chipStyle(editorState.watermark.position === key)} onClick={() => pushState((current) => ({ ...current, watermark: { ...current.watermark, position: key, enabled: true } }))}>
                {key}
              </button>
            ))}
          </div>
          {editorState.watermark.position === "custom" && (
            <>
              <Slider label="Custom X" min={0} max={100} step={1} value={editorState.watermark.customX} onChange={(value) => pushState((current) => ({ ...current, watermark: { ...current.watermark, customX: Number(value), enabled: true } }))} />
              <Slider label="Custom Y" min={0} max={100} step={1} value={editorState.watermark.customY} onChange={(value) => pushState((current) => ({ ...current, watermark: { ...current.watermark, customY: Number(value), enabled: true } }))} />
            </>
          )}
        </>
      );
    }

    if (tool === "text") {
      return (
        <>
          <textarea className="form-control" rows={3} value={editorState.textOverlay.text} onChange={(e) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, text: e.target.value } }))} placeholder="Add overlay text" />
          <Slider label="Font Size" min={18} max={120} step={1} value={editorState.textOverlay.fontSize} onChange={(value) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, fontSize: Number(value) } }))} />
          <Slider label="Opacity" min={0} max={100} step={1} value={editorState.textOverlay.opacity} onChange={(value) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, opacity: Number(value) } }))} />
          <Slider label="Rotation" min={-180} max={180} step={1} value={editorState.textOverlay.rotation} onChange={(value) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, rotation: Number(value) } }))} />
          <Slider label="Position X" min={0} max={100} step={1} value={editorState.textOverlay.x} onChange={(value) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, x: Number(value) } }))} />
          <Slider label="Position Y" min={0} max={100} step={1} value={editorState.textOverlay.y} onChange={(value) => pushState((current) => ({ ...current, textOverlay: { ...current.textOverlay, enabled: true, y: Number(value) } }))} />
        </>
      );
    }

    if (tool === "frames") {
      return (
        <div style={styles.chipGrid}>
          {Object.keys(FRAME_STYLES).map((key) => (
            <button key={key} style={chipStyle(editorState.frame === key)} onClick={() => pushState((current) => ({ ...current, frame: key }))}>
              {key}
            </button>
          ))}
        </div>
      );
    }

    if (tool === "background") {
      return (
        <>
          <div style={styles.chipGrid}>
            {["transparent", "solid", "gradient"].map((mode) => (
              <button key={mode} style={chipStyle(editorState.background.mode === mode)} onClick={() => pushState((current) => ({ ...current, background: { ...current.background, mode } }))}>
                {mode}
              </button>
            ))}
          </div>
          {editorState.background.mode === "solid" && (
            <input type="color" value={editorState.background.solid} onChange={(e) => pushState((current) => ({ ...current, background: { ...current.background, solid: e.target.value } }))} />
          )}
          {editorState.background.mode === "gradient" && (
            <div style={styles.rowTwo}>
              <input type="color" value={editorState.background.gradientFrom} onChange={(e) => pushState((current) => ({ ...current, background: { ...current.background, gradientFrom: e.target.value } }))} />
              <input type="color" value={editorState.background.gradientTo} onChange={(e) => pushState((current) => ({ ...current, background: { ...current.background, gradientTo: e.target.value } }))} />
            </div>
          )}
        </>
      );
    }

    if (tool === "ai") {
      return (
        <div style={styles.chipGrid}>
          {Object.entries(AI_PRESETS).map(([key]) => (
            <button key={key} style={styles.secondaryBtn} onClick={() => applyAiPreset(key)}>
              {key}
            </button>
          ))}
        </div>
      );
    }

    if (tool === "export") {
      return (
        <>
          <label style={styles.label}>Format</label>
          <select className="form-control" value={editorState.export.format} onChange={(e) => pushState((current) => ({ ...current, export: { ...current.export, format: e.target.value } }))}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
            <option value="image/webp">WEBP</option>
          </select>
          <label style={styles.label}>Quality</label>
          <div style={styles.rowTwo}>
            {["low", "medium", "high", "original"].map((level) => (
              <button
                key={level}
                style={chipStyle(editorState.export.preset === level)}
                onClick={() => pushState((current) => ({
                  ...current,
                  export: {
                    ...current.export,
                    preset: level,
                    quality: qualityLabelToValue(level),
                  },
                }))}
              >
                {level}
              </button>
            ))}
          </div>
        </>
      );
    }

    if (tool === "history") {
      return (
        <div style={{ display: "grid", gap: "0.55rem" }}>
          {versionHistory.length === 0 && <div style={styles.muted}>No saved versions yet.</div>}
          {versionHistory.map((item) => (
            <div key={item.id} style={styles.versionCard}>
              <div style={{ fontWeight: 700, color: "var(--pm-navy)" }}>{item.label}</div>
              <div style={styles.versionActions}>
                <button style={styles.secondaryBtn} onClick={() => pushState(item.state)}>Restore</button>
                <button style={styles.secondaryBtn} onClick={() => {
                  const next = versionHistory.filter((version) => version.id !== item.id);
                  localStorage.setItem(versionStorageKey(photo?._id), JSON.stringify(next));
                  setVersionRefresh((value) => value + 1);
                  setAutoSaveState("Version deleted");
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={styles.overlay}>
      <img
        ref={hiddenImageRef}
        src={sourceUrl}
        alt=""
        style={{ display: "none" }}
        onLoad={() => {
          setOriginalReady(true);
          renderCanvas();
        }}
      />

      <div style={styles.topbar}>
        <div>
          <div style={styles.eyebrow}>{albumName}</div>
          <div style={styles.title}>Media Editing Studio</div>
        </div>
        <div style={styles.topActions}>
          <button style={styles.secondaryBtn} onClick={saveDraft}><i className="fas fa-floppy-disk me-2"></i>Save Draft</button>
          <button style={styles.secondaryBtn} onClick={revertAll}><i className="fas fa-rotate-left me-2"></i>Revert</button>
          <span style={styles.autoSave}>{autoSaveState}</span>
          <button style={styles.secondaryBtn} onClick={exportImage} disabled={exporting}>{exporting ? "Exporting…" : "Export"}</button>
          <button style={styles.primaryBtn} onClick={() => publishImage(false)} disabled={publishing}>{publishing ? "Publishing…" : "Publish To Album"}</button>
          {selectedCount > 1 && (
            <button style={styles.primaryGhostBtn} onClick={() => publishImage(true)} disabled={publishing}>
              Apply To {selectedCount} Selected
            </button>
          )}
          <button style={styles.closeBtn} onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
      </div>

      <div style={styles.workspace}>
        <aside style={styles.leftbar}>
          {TOOL_LIST.map((item) => (
            <button key={item.key} style={toolNavStyle(tool === item.key)} onClick={() => setTool(item.key)}>
              <i className={`fas ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </aside>

        <main style={styles.center}>
          <div style={styles.previewToolbar}>
            <div style={styles.previewActions}>
              <button style={styles.secondaryBtn} onClick={() => setZoomView((value) => clamp(value - 0.1, 0.5, 2))}><i className="fas fa-search-minus"></i></button>
              <span style={styles.zoomLabel}>{Math.round(zoomView * 100)}%</span>
              <button style={styles.secondaryBtn} onClick={() => setZoomView((value) => clamp(value + 0.1, 0.5, 2))}><i className="fas fa-search-plus"></i></button>
              <button style={styles.secondaryBtn} onClick={() => setZoomView(1)}>Fit</button>
            </div>
            <div style={styles.previewActions}>
              <button style={chipStyle(showCompare)} onClick={() => setShowCompare((value) => !value)}>Before / After</button>
            </div>
          </div>

          <div style={styles.previewStage}>
            {!originalReady && <div style={styles.loader}>Loading full resolution preview…</div>}
            <div style={{ ...styles.previewFrame, transform: `scale(${zoomView})` }}>
              {previewUrl && <img src={previewUrl} alt="Edited preview" style={styles.previewImage} />}
              {showCompare && sourceUrl && (
                <>
                  <div style={{ ...styles.compareOriginalWrap, width: `${compareSplit}%` }}>
                    <img src={sourceUrl} alt="Original preview" style={styles.previewImage} />
                  </div>
                  <input type="range" min="0" max="100" value={compareSplit} onChange={(e) => setCompareSplit(Number(e.target.value))} style={styles.compareSlider} />
                </>
              )}
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </main>

        <aside style={styles.rightbar}>
          <div style={styles.rightHeader}>
            <div>
              <div style={styles.eyebrow}>Tool Controls</div>
              <h3 style={styles.rightTitle}>{TOOL_LIST.find((item) => item.key === tool)?.label}</h3>
            </div>
            <div style={styles.historyRow}>
              <button style={styles.secondaryBtn} onClick={undo} disabled={historyIndex <= 0}><i className="fas fa-arrow-left"></i></button>
              <button style={styles.secondaryBtn} onClick={redo} disabled={historyIndex >= history.length - 1}><i className="fas fa-arrow-right"></i></button>
            </div>
          </div>
          <div style={styles.controlPane}>
            {renderToolControls()}
          </div>
          <button style={{ ...styles.secondaryBtn, width: "100%" }} onClick={resetCurrentTool}>Reset Tool</button>
        </aside>
      </div>
    </div>
  );
}

function Slider({ label, ...props }) {
  return (
    <label style={{ display: "block", marginBottom: "0.9rem" }}>
      <div style={styles.sliderLabel}>
        <span>{label}</span>
        <span>{props.value}</span>
      </div>
      <input type="range" {...props} style={{ width: "100%" }} />
    </label>
  );
}

function chipStyle(active) {
  return {
    ...styles.chip,
    background: active ? "var(--pm-navy, #1A2E3B)" : "rgba(26,46,59,0.06)",
    color: active ? "#fff" : "var(--pm-navy, #1A2E3B)",
    borderColor: active ? "var(--pm-navy, #1A2E3B)" : "rgba(26,46,59,0.08)",
  };
}

function toolNavStyle(active) {
  return {
    ...styles.toolBtn,
    background: active ? "rgba(107,189,208,0.15)" : "transparent",
    color: active ? "var(--pm-navy, #1A2E3B)" : "rgba(255,255,255,0.75)",
    borderLeft: active ? "3px solid var(--pm-teal, #6BBDD0)" : "3px solid transparent",
  };
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1700,
    background: "#07111a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  topbar: {
    height: 74,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.9rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(7,17,26,0.95)",
    backdropFilter: "blur(12px)",
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr) 340px",
    minHeight: 0,
    flex: 1,
  },
  leftbar: {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: "0.8rem 0",
    overflowY: "auto",
    background: "#091520",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  rightbar: {
    borderLeft: "1px solid rgba(255,255,255,0.08)",
    padding: "1rem",
    background: "#0b1722",
    overflowY: "auto",
  },
  toolBtn: {
    width: "100%",
    textAlign: "left",
    padding: "0.85rem 1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    border: "none",
    fontWeight: 600,
    cursor: "pointer",
  },
  previewToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.9rem 1rem",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  previewStage: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.25rem",
    overflow: "auto",
  },
  previewFrame: {
    position: "relative",
    maxWidth: "min(100%, 1100px)",
    maxHeight: "min(100%, 82vh)",
    overflow: "hidden",
    borderRadius: 24,
    boxShadow: "0 30px 100px rgba(0,0,0,0.42)",
    background: "#091520",
    transformOrigin: "center center",
  },
  previewImage: {
    maxWidth: "100%",
    maxHeight: "82vh",
    display: "block",
    objectFit: "contain",
  },
  compareOriginalWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    overflow: "hidden",
    borderRight: "2px solid rgba(255,255,255,0.8)",
  },
  compareSlider: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 14,
  },
  loader: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: 600,
  },
  rightHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "0.75rem",
    marginBottom: "1rem",
  },
  eyebrow: {
    fontSize: "0.72rem",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    color: "rgba(255,255,255,0.52)",
  },
  title: {
    fontSize: "1.2rem",
    fontWeight: 700,
  },
  rightTitle: {
    margin: "0.25rem 0 0",
    fontSize: "1.1rem",
  },
  controlPane: {
    display: "grid",
    gap: "0.85rem",
    marginBottom: "1rem",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  sliderLabel: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.76rem",
    color: "rgba(255,255,255,0.78)",
    marginBottom: "0.25rem",
  },
  chipGrid: {
    display: "flex",
    gap: "0.45rem",
    flexWrap: "wrap",
  },
  chip: {
    padding: "0.5rem 0.75rem",
    borderRadius: 999,
    border: "1px solid rgba(26,46,59,0.08)",
    fontWeight: 700,
    fontSize: "0.76rem",
    cursor: "pointer",
  },
  rowTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.65rem",
  },
  secondaryBtn: {
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    borderRadius: 12,
    padding: "0.6rem 0.85rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  primaryBtn: {
    border: "none",
    background: "var(--pm-teal, #6BBDD0)",
    color: "#072030",
    borderRadius: 12,
    padding: "0.7rem 1rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  primaryGhostBtn: {
    border: "1px solid rgba(107,189,208,0.35)",
    background: "rgba(107,189,208,0.12)",
    color: "#9ddbea",
    borderRadius: 12,
    padding: "0.7rem 1rem",
    fontWeight: 800,
    cursor: "pointer",
  },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.65rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  autoSave: {
    fontSize: "0.75rem",
    color: "rgba(255,255,255,0.65)",
    minWidth: 110,
  },
  previewActions: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  zoomLabel: {
    fontSize: "0.78rem",
    color: "rgba(255,255,255,0.82)",
    minWidth: 48,
    textAlign: "center",
  },
  historyRow: {
    display: "flex",
    gap: "0.45rem",
  },
  muted: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.55)",
  },
  versionCard: {
    padding: "0.8rem",
    borderRadius: 14,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  versionActions: {
    display: "flex",
    gap: "0.45rem",
    marginTop: "0.55rem",
  },
};
