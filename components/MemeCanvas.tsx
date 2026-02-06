"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { TextBox } from "@/types";
import { useAuth } from "@/components/AppShell";

interface MemeCanvasProps {
  onPostMeme?: (
    imageUrl: string,
    textBoxes: TextBox[],
    baseImageUrl: string,
  ) => void;
  onUpdateMeme?: (
    imageUrl: string,
    textBoxes: TextBox[],
    baseImageUrl: string,
  ) => void;
  initialImageUrl?: string;
  initialTextBoxes?: TextBox[];
}

const TEMPLATES = [
  "/assets/Carl Sagan.jpg",
  "/assets/Cute girl.jpg",
  "/assets/Heroes & Villains.jpg",
  "/assets/Miley Cyrus.jpg",
  "/assets/relatable.jpg",
];

export default function MemeCanvas({
  onPostMeme,
  onUpdateMeme,
  initialImageUrl,
  initialTextBoxes,
}: MemeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasInitializedRef = useRef(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextBoxId, setSelectedTextBoxId] = useState<string | null>(
    null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const isEditing = Boolean(onUpdateMeme);
  const { isSignedIn, openSignIn } = useAuth();

  const ensureSignedIn = () => {
    if (!onPostMeme) return true;
    if (isSignedIn) return true;
    openSignIn("Please sign in to post photos or memes.");
    return false;
  };

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw text boxes
    textBoxes.forEach((textBox) => {
      ctx.font = `bold ${textBox.fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw subtle background for readability
      const textMetrics = ctx.measureText(textBox.text);
      const textWidth = textMetrics.width;
      const textHeight = textBox.fontSize;
      const padding = Math.max(6, Math.round(textBox.fontSize * 0.3));
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(
        textBox.x - textWidth / 2 - padding,
        textBox.y - textHeight / 2 - padding,
        textWidth + padding * 2,
        textHeight + padding * 2,
      );

      // Draw black border (stroke)
      const strokeWidth = Math.max(2, Math.round(textBox.fontSize / 6));
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = Math.max(2, Math.round(textBox.fontSize / 12));
      ctx.shadowOffsetY = 1;
      ctx.strokeStyle = "black";
      ctx.lineWidth = strokeWidth;
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeText(textBox.text, textBox.x, textBox.y);

      // Draw text with selected color (fill)
      ctx.fillStyle = textBox.color || "#ffffff";
      ctx.fillText(textBox.text, textBox.x, textBox.y);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw selection indicator
      if (textBox.id === selectedTextBoxId) {
        const textMetrics = ctx.measureText(textBox.text);
        const textWidth = textMetrics.width;
        const textHeight = textBox.fontSize;

        ctx.strokeStyle = "#ff5722";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          textBox.x - textWidth / 2 - 5,
          textBox.y - textHeight / 2 - 5,
          textWidth + 10,
          textHeight + 10,
        );
        ctx.setLineDash([]);
      }
    });
  }, [image, textBoxes, selectedTextBoxId]);

  const setupCanvas = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const maxWidth = 800;
    const maxHeight = 600;

    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width = width * scale;
      height = height * scale;
    }

    canvas.width = width;
    canvas.height = height;
  }, []);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    if (
      !initialImageUrl &&
      (!initialTextBoxes || initialTextBoxes.length === 0)
    ) {
      return;
    }

    if (initialImageUrl) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setupCanvas(img);
      };
      img.src = initialImageUrl;
    }

    if (initialTextBoxes && initialTextBoxes.length > 0) {
      setTextBoxes(initialTextBoxes);
      setSelectedTextBoxId(null);
    }

    hasInitializedRef.current = true;
  }, [initialImageUrl, initialTextBoxes, setupCanvas]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!ensureSignedIn()) {
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setupCanvas(img);
      };
      if (!reader.result) return;
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadTemplate = (src: string) => {
    if (!ensureSignedIn()) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setupCanvas(img);
    };
    img.src = src;
  };

  const addTextBox = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) {
      alert("Please upload an image first!");
      return;
    }

    const id = Date.now().toString();
    const newTextBox: TextBox = {
      id,
      text: "Your text here",
      x: canvas.width / 2,
      y: canvas.height / 2,
      fontSize,
      color: textColor,
      width: 200,
      height: 40,
    };

    setTextBoxes([...textBoxes, newTextBox]);
    setSelectedTextBoxId(id);
  };

  const deleteTextBox = (id: string) => {
    const newTextBoxes = textBoxes.filter((tb) => tb.id !== id);
    setTextBoxes(newTextBoxes);
    if (selectedTextBoxId === id) {
      setSelectedTextBoxId(null);
      setFontSize(40);
      setTextColor("#ffffff");
    }
  };

  const selectTextBox = (id: string) => {
    setSelectedTextBoxId(id);
    const textBox = textBoxes.find((tb) => tb.id === id);
    if (textBox) {
      setFontSize(textBox.fontSize);
      setTextColor(textBox.color || "#ffffff");
    }
  };

  const updateTextBoxText = useCallback((id: string, text: string) => {
    setTextBoxes((prevTextBoxes) =>
      prevTextBoxes.map((tb) => (tb.id === id ? { ...tb, text } : tb)),
    );
  }, []);

  const updateTextBoxFontSize = useCallback(
    (id: string, newFontSize: number) => {
      setTextBoxes((prevTextBoxes) =>
        prevTextBoxes.map((tb) =>
          tb.id === id ? { ...tb, fontSize: newFontSize } : tb,
        ),
      );
    },
    [],
  );

  const updateTextBoxColor = useCallback((id: string, color: string) => {
    setTextBoxes((prevTextBoxes) =>
      prevTextBoxes.map((tb) => (tb.id === id ? { ...tb, color } : tb)),
    );
  }, []);

  const getTextBoxAtPoint = (x: number, y: number): TextBox | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    for (let i = textBoxes.length - 1; i >= 0; i--) {
      const textBox = textBoxes[i];
      ctx.font = `${textBox.fontSize}px Arial`;
      const textMetrics = ctx.measureText(textBox.text);
      const textWidth = textMetrics.width;
      const textHeight = textBox.fontSize;

      const left = textBox.x - textWidth / 2;
      const right = textBox.x + textWidth / 2;
      const top = textBox.y - textHeight / 2;
      const bottom = textBox.y + textHeight / 2;

      if (x >= left && x <= right && y >= top && y <= bottom) {
        return textBox;
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const textBox = getTextBoxAtPoint(canvasX, canvasY);
    if (textBox) {
      setIsDragging(true);
      setSelectedTextBoxId(textBox.id);
      setDragOffset({ x: canvasX - textBox.x, y: canvasY - textBox.y });
      canvas.style.cursor = "grabbing";

      const selectedBox = textBoxes.find((tb) => tb.id === textBox.id);
      if (selectedBox) {
        setFontSize(selectedBox.fontSize);
        setTextColor(selectedBox.color || "#ffffff");
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    if (isDragging && selectedTextBoxId !== null) {
      const textBox = textBoxes.find((tb) => tb.id === selectedTextBoxId);
      if (textBox) {
        let newX = canvasX - dragOffset.x;
        let newY = canvasY - dragOffset.y;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.font = `bold ${textBox.fontSize}px Arial`;
          const textMetrics = ctx.measureText(textBox.text);
          const textWidth = textMetrics.width;
          const textHeight = textBox.fontSize;
          const padding = Math.max(8, Math.round(textBox.fontSize * 0.35));
          const minX = textWidth / 2 + padding;
          const maxX = canvas.width - textWidth / 2 - padding;
          const minY = textHeight / 2 + padding;
          const maxY = canvas.height - textHeight / 2 - padding;

          newX = Math.max(minX, Math.min(newX, maxX));
          newY = Math.max(minY, Math.min(newY, maxY));
        } else {
          newX = Math.max(0, Math.min(newX, canvas.width));
          newY = Math.max(0, Math.min(newY, canvas.height));
        }

        setTextBoxes(
          textBoxes.map((tb) =>
            tb.id === selectedTextBoxId ? { ...tb, x: newX, y: newY } : tb,
          ),
        );
      }
    } else {
      const textBox = getTextBoxAtPoint(canvasX, canvasY);
      canvas.style.cursor = textBox ? "grab" : "default";
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = "move";
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    canvasRef.current?.dispatchEvent(mouseEvent);
  };

  useEffect(() => {
    if (selectedTextBoxId) {
      updateTextBoxFontSize(selectedTextBoxId, fontSize);
    }
  }, [fontSize, selectedTextBoxId, updateTextBoxFontSize]);

  useEffect(() => {
    if (selectedTextBoxId) {
      updateTextBoxColor(selectedTextBoxId, textColor);
    }
  }, [textColor, selectedTextBoxId, updateTextBoxColor]);

  const downloadMeme = () => {
    if (!image || textBoxes.length === 0) {
      alert(
        "Please add an image and at least one text box before downloading!",
      );
      return;
    }

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = image.width;
    tempCanvas.height = image.height;

    tempCtx.drawImage(image, 0, 0);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;

    textBoxes.forEach((textBox) => {
      tempCtx.font = `bold ${textBox.fontSize * scaleX}px Arial`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      const scaledFontSize = textBox.fontSize * scaleX;
      const textMetrics = tempCtx.measureText(textBox.text);
      const textWidth = textMetrics.width;
      const textHeight = scaledFontSize;
      const padding = Math.max(6, Math.round(scaledFontSize * 0.3));
      tempCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
      tempCtx.fillRect(
        textBox.x * scaleX - textWidth / 2 - padding,
        textBox.y * scaleY - textHeight / 2 - padding,
        textWidth + padding * 2,
        textHeight + padding * 2,
      );

      const strokeWidth = Math.max(
        2,
        Math.round((textBox.fontSize * scaleX) / 6),
      );
      tempCtx.shadowColor = "rgba(0, 0, 0, 0.35)";
      tempCtx.shadowBlur = Math.max(
        2,
        Math.round((textBox.fontSize * scaleX) / 12),
      );
      tempCtx.shadowOffsetY = 1;
      tempCtx.strokeStyle = "black";
      tempCtx.lineWidth = strokeWidth;
      tempCtx.lineJoin = "round";
      tempCtx.miterLimit = 2;
      tempCtx.strokeText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);

      tempCtx.fillStyle = textBox.color || "#ffffff";
      tempCtx.fillText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);
      tempCtx.shadowColor = "transparent";
      tempCtx.shadowBlur = 0;
      tempCtx.shadowOffsetY = 0;
    });

    tempCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const createMemeImageUrl = () => {
    if (!image || textBoxes.length === 0) {
      alert("Please add an image and at least one text box before posting!");
      return null;
    }

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return null;

    tempCanvas.width = image.width;
    tempCanvas.height = image.height;

    tempCtx.drawImage(image, 0, 0);

    const scaleX = image.width / canvas.width;
    const scaleY = image.height / canvas.height;

    textBoxes.forEach((textBox) => {
      tempCtx.font = `bold ${textBox.fontSize * scaleX}px Arial`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      const scaledFontSize = textBox.fontSize * scaleX;
      const textMetrics = tempCtx.measureText(textBox.text);
      const textWidth = textMetrics.width;
      const textHeight = scaledFontSize;
      const padding = Math.max(6, Math.round(scaledFontSize * 0.3));
      tempCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
      tempCtx.fillRect(
        textBox.x * scaleX - textWidth / 2 - padding,
        textBox.y * scaleY - textHeight / 2 - padding,
        textWidth + padding * 2,
        textHeight + padding * 2,
      );

      const strokeWidth = Math.max(
        2,
        Math.round((textBox.fontSize * scaleX) / 6),
      );
      tempCtx.shadowColor = "rgba(0, 0, 0, 0.35)";
      tempCtx.shadowBlur = Math.max(
        2,
        Math.round((textBox.fontSize * scaleX) / 12),
      );
      tempCtx.shadowOffsetY = 1;
      tempCtx.strokeStyle = "black";
      tempCtx.lineWidth = strokeWidth;
      tempCtx.lineJoin = "round";
      tempCtx.miterLimit = 2;
      tempCtx.strokeText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);

      tempCtx.fillStyle = textBox.color || "#ffffff";
      tempCtx.fillText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);
      tempCtx.shadowColor = "transparent";
      tempCtx.shadowBlur = 0;
      tempCtx.shadowOffsetY = 0;
    });

    const imageUrl = tempCanvas.toDataURL("image/png");
    return imageUrl;
  };

  const postMeme = () => {
    if (!ensureSignedIn()) return;
    const imageUrl = createMemeImageUrl();
    if (!imageUrl) return;
    if (onPostMeme && image) {
      onPostMeme(imageUrl, textBoxes, image.src);
    }
  };

  const updateMeme = () => {
    const imageUrl = createMemeImageUrl();
    if (!imageUrl) return;
    if (onUpdateMeme && image) {
      onUpdateMeme(imageUrl, textBoxes, image.src);
    }
  };

  return (
    <div className="container">
      <div className="main-content">
        <div className="controls-panel">
          <div className="control-section">
            <h3>Image</h3>
            <label htmlFor="imageUpload" className="file-upload-btn">
              Upload Your Own
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                hidden
                onChange={handleImageUpload}
              />
            </label>
            <div className="template-gallery">
              <p className="gallery-label">Or choose a template:</p>
              <div className="templates">
                {TEMPLATES.map((template, idx) => (
                  <img
                    key={idx}
                    src={template}
                    alt={`Template ${idx + 1}`}
                    className="template-thumb"
                    onClick={() => loadTemplate(template)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Text</h3>
            <button onClick={addTextBox} className="btn">
              Add Text Box
            </button>
            <div className="font-size-control">
              <label htmlFor="fontSize">Font Size:</label>
              <input
                type="range"
                id="fontSize"
                min="20"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
              />
              <span id="fontSizeValue">{fontSize}</span>
            </div>
            <div className="text-color-control">
              <label htmlFor="textColor">Text Color:</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  id="textColor"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                />
                <span id="textColorValue">{textColor.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Text Boxes</h3>
            <div id="textBoxesList" className="text-boxes-list">
              {textBoxes.length === 0 ? (
                <p className="empty-message">
                  No text boxes yet. Click &quot;Add Text Box&quot; to create
                  one.
                </p>
              ) : (
                textBoxes.map((textBox) => (
                  <div
                    key={textBox.id}
                    className={`text-box-item ${
                      textBox.id === selectedTextBoxId ? "selected" : ""
                    }`}
                  >
                    <input
                      type="text"
                      value={textBox.text}
                      placeholder="Enter text..."
                      onChange={(e) =>
                        updateTextBoxText(textBox.id, e.target.value)
                      }
                    />
                    <div className="text-box-actions">
                      <button
                        className="select-btn"
                        onClick={() => selectTextBox(textBox.id)}
                      >
                        Select
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTextBox(textBox.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="control-section">
            <button
              onClick={downloadMeme}
              className="btn btn-primary"
              disabled={!image || textBoxes.length === 0}
            >
              Download Meme
            </button>
            {onPostMeme && !isEditing && (
              <button
                onClick={postMeme}
                className="btn btn-primary"
                style={{ marginTop: "12px" }}
                disabled={!image || textBoxes.length === 0}
              >
                Post Meme
              </button>
            )}
            {onUpdateMeme && (
              <button
                onClick={updateMeme}
                className="btn btn-primary"
                style={{ marginTop: "12px" }}
                disabled={!image || textBoxes.length === 0}
              >
                Update Meme
              </button>
            )}
          </div>
        </div>

        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            id="memeCanvas"
            className={image ? "has-image" : ""}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            style={{ cursor: "move", display: image ? "block" : "none" }}
          />
          {!image && (
            <div id="canvasPlaceholder" className="canvas-placeholder">
              <p>Upload an image to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
