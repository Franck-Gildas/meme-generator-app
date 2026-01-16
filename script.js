// Meme Generator Application
class MemeGenerator {
  constructor() {
    this.canvas = document.getElementById("memeCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.image = null;
    this.textBoxes = [];
    this.selectedTextBoxId = null;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    this.imageUpload = document.getElementById("imageUpload");
    this.addTextBtn = document.getElementById("addTextBtn");
    this.fontSizeSlider = document.getElementById("fontSize");
    this.fontSizeValue = document.getElementById("fontSizeValue");
    this.textColorPicker = document.getElementById("textColor");
    this.textColorValue = document.getElementById("textColorValue");
    this.downloadBtn = document.getElementById("downloadBtn");
    this.textBoxesList = document.getElementById("textBoxesList");
    this.canvasPlaceholder = document.getElementById("canvasPlaceholder");
  }

  setupEventListeners() {
    // Image upload
    this.imageUpload.addEventListener("change", (e) =>
      this.handleImageUpload(e)
    );

    // Template selection
    document.querySelectorAll(".template-thumb").forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        this.loadTemplate(e.target.dataset.template);
      });
    });

    // Add text box
    this.addTextBtn.addEventListener("click", () => this.addTextBox());

    // Font size slider
    this.fontSizeSlider.addEventListener("input", (e) => {
      this.fontSizeValue.textContent = e.target.value;
      if (this.selectedTextBoxId !== null) {
        this.updateTextBoxFontSize(
          this.selectedTextBoxId,
          parseInt(e.target.value)
        );
      }
    });

    // Text color picker
    this.textColorPicker.addEventListener("input", (e) => {
      this.textColorValue.textContent = e.target.value.toUpperCase();
      if (this.selectedTextBoxId !== null) {
        this.updateTextBoxColor(this.selectedTextBoxId, e.target.value);
      }
    });

    // Download button
    this.downloadBtn.addEventListener("click", () => this.downloadMeme());

    // Canvas mouse events for dragging
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.handleMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.handleMouseUp());

    // Touch events for mobile
    this.canvas.addEventListener("touchstart", (e) => this.handleTouchStart(e));
    this.canvas.addEventListener("touchmove", (e) => this.handleTouchMove(e));
    this.canvas.addEventListener("touchend", () => this.handleMouseUp());
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.image = img;
        this.setupCanvas();
        this.canvasPlaceholder.classList.add("hidden");
        this.canvas.classList.add("has-image");
        this.downloadBtn.disabled = false;
        this.render();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  loadTemplate(src) {
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.setupCanvas();
      this.canvasPlaceholder.classList.add("hidden");
      this.canvas.classList.add("has-image");
      this.downloadBtn.disabled = false;
      this.render();
    };
    img.src = src;
  }

  setupCanvas() {
    if (!this.image) return;

    // Set canvas dimensions to match image, with max constraints
    const maxWidth = 800;
    const maxHeight = 600;

    let width = this.image.width;
    let height = this.image.height;

    // Scale down if too large
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      width = width * scale;
      height = height * scale;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }

  addTextBox() {
    if (!this.image) {
      alert("Please upload an image first!");
      return;
    }

    const id = Date.now().toString();
    const textBox = {
      id: id,
      text: "Your text here",
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      fontSize: parseInt(this.fontSizeSlider.value),
      color: this.textColorPicker.value,
      width: 200,
      height: 40,
    };

    this.textBoxes.push(textBox);
    this.selectedTextBoxId = id;
    this.updateTextBoxList();
    this.render();

    // Focus on the new text box input
    setTimeout(() => {
      const input = document.querySelector(`[data-textbox-id="${id}"] input`);
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  deleteTextBox(id) {
    this.textBoxes = this.textBoxes.filter((tb) => tb.id !== id);
    if (this.selectedTextBoxId === id) {
      this.selectedTextBoxId = null;
      this.fontSizeSlider.value = 40;
      this.fontSizeValue.textContent = "40";
      this.textColorPicker.value = "#ffffff";
      this.textColorValue.textContent = "#ffffff";
    }
    this.updateTextBoxList();
    this.render();
  }

  selectTextBox(id) {
    this.selectedTextBoxId = id;
    const textBox = this.textBoxes.find((tb) => tb.id === id);
    if (textBox) {
      this.fontSizeSlider.value = textBox.fontSize;
      this.fontSizeValue.textContent = textBox.fontSize;
      this.textColorPicker.value = textBox.color || "#ffffff";
      this.textColorValue.textContent = (
        textBox.color || "#ffffff"
      ).toUpperCase();
    }
    this.updateTextBoxList();
    this.render();
  }

  updateTextBoxFontSize(id, fontSize) {
    const textBox = this.textBoxes.find((tb) => tb.id === id);
    if (textBox) {
      textBox.fontSize = fontSize;
      this.render();
    }
  }

  updateTextBoxColor(id, color) {
    const textBox = this.textBoxes.find((tb) => tb.id === id);
    if (textBox) {
      textBox.color = color;
      this.render();
    }
  }

  updateTextBoxText(id, text) {
    const textBox = this.textBoxes.find((tb) => tb.id === id);
    if (textBox) {
      textBox.text = text;
      this.render();
    }
  }

  updateTextBoxList() {
    if (this.textBoxes.length === 0) {
      this.textBoxesList.innerHTML =
        '<p class="empty-message">No text boxes yet. Click "Add Text Box" to create one.</p>';
      return;
    }

    this.textBoxesList.innerHTML = this.textBoxes
      .map((textBox) => {
        const isSelected =
          textBox.id === this.selectedTextBoxId ? "selected" : "";
        return `
                <div class="text-box-item ${isSelected}" data-textbox-id="${
          textBox.id
        }">
                    <input 
                        type="text" 
                        value="${this.escapeHtml(textBox.text)}" 
                        placeholder="Enter text..."
                        data-id="${textBox.id}"
                    >
                    <div class="text-box-actions">
                        <button class="select-btn" data-id="${
                          textBox.id
                        }">Select</button>
                        <button class="delete-btn" data-id="${
                          textBox.id
                        }">Delete</button>
                    </div>
                </div>
            `;
      })
      .join("");

    // Add event listeners to inputs and buttons
    this.textBoxes.forEach((textBox) => {
      const input = document.querySelector(`input[data-id="${textBox.id}"]`);
      const selectBtn = document.querySelector(
        `.select-btn[data-id="${textBox.id}"]`
      );
      const deleteBtn = document.querySelector(
        `.delete-btn[data-id="${textBox.id}"]`
      );

      if (input) {
        input.addEventListener("input", (e) => {
          this.updateTextBoxText(textBox.id, e.target.value);
        });
      }

      if (selectBtn) {
        selectBtn.addEventListener("click", () => {
          this.selectTextBox(textBox.id);
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
          this.deleteTextBox(textBox.id);
        });
      }
    });
  }

  getTextBoxAtPoint(x, y) {
    // Check text boxes in reverse order (top to bottom)
    for (let i = this.textBoxes.length - 1; i >= 0; i--) {
      const textBox = this.textBoxes[i];

      // Calculate text bounds
      this.ctx.font = `${textBox.fontSize}px Arial`;
      const textMetrics = this.ctx.measureText(textBox.text);
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
  }

  handleMouseDown(event) {
    if (!this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    const textBox = this.getTextBoxAtPoint(canvasX, canvasY);
    if (textBox) {
      this.isDragging = true;
      this.selectedTextBoxId = textBox.id;
      this.dragOffset.x = canvasX - textBox.x;
      this.dragOffset.y = canvasY - textBox.y;
      this.canvas.style.cursor = "grabbing";
      // Update controls to match selected text box
      this.fontSizeSlider.value = textBox.fontSize;
      this.fontSizeValue.textContent = textBox.fontSize;
      this.textColorPicker.value = textBox.color || "#ffffff";
      this.textColorValue.textContent = (
        textBox.color || "#ffffff"
      ).toUpperCase();
      this.updateTextBoxList();
      this.render();
    }
  }

  handleMouseMove(event) {
    if (!this.image) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scale coordinates to canvas size
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;

    if (this.isDragging && this.selectedTextBoxId !== null) {
      const textBox = this.textBoxes.find(
        (tb) => tb.id === this.selectedTextBoxId
      );
      if (textBox) {
        textBox.x = canvasX - this.dragOffset.x;
        textBox.y = canvasY - this.dragOffset.y;

        // Keep text within canvas bounds
        textBox.x = Math.max(0, Math.min(textBox.x, this.canvas.width));
        textBox.y = Math.max(0, Math.min(textBox.y, this.canvas.height));

        this.render();
      }
    } else {
      // Check if hovering over a text box
      const textBox = this.getTextBoxAtPoint(canvasX, canvasY);
      this.canvas.style.cursor = textBox ? "grab" : "default";
    }
  }

  handleMouseUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = "move";
    }
  }

  handleTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent("mousedown", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  handleTouchMove(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
    this.canvas.dispatchEvent(mouseEvent);
  }

  render() {
    if (!this.image) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw image
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

    // Draw text boxes
    this.textBoxes.forEach((textBox) => {
      this.drawText(textBox);
    });
  }

  drawText(textBox) {
    this.ctx.font = `bold ${textBox.fontSize}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Draw black border (stroke)
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = 6;
    this.ctx.lineJoin = "round";
    this.ctx.miterLimit = 2;
    this.ctx.strokeText(textBox.text, textBox.x, textBox.y);

    // Draw text with selected color (fill)
    this.ctx.fillStyle = textBox.color || "#ffffff";
    this.ctx.fillText(textBox.text, textBox.x, textBox.y);

    // Draw selection indicator
    if (textBox.id === this.selectedTextBoxId) {
      const textMetrics = this.ctx.measureText(textBox.text);
      const textWidth = textMetrics.width;
      const textHeight = textBox.fontSize;

      this.ctx.strokeStyle = "#667eea";
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(
        textBox.x - textWidth / 2 - 5,
        textBox.y - textHeight / 2 - 5,
        textWidth + 10,
        textHeight + 10
      );
      this.ctx.setLineDash([]);
    }
  }

  downloadMeme() {
    if (!this.image || this.textBoxes.length === 0) {
      alert(
        "Please add an image and at least one text box before downloading!"
      );
      return;
    }

    // Create a temporary canvas with original image dimensions for high quality
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = this.image.width;
    tempCanvas.height = this.image.height;

    // Draw image at full size
    tempCtx.drawImage(this.image, 0, 0);

    // Calculate scale factor
    const scaleX = this.image.width / this.canvas.width;
    const scaleY = this.image.height / this.canvas.height;

    // Draw text boxes scaled to original image size
    this.textBoxes.forEach((textBox) => {
      tempCtx.font = `bold ${textBox.fontSize * scaleX}px Arial`;
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";

      // Draw black border
      tempCtx.strokeStyle = "black";
      tempCtx.lineWidth = 6 * scaleX;
      tempCtx.lineJoin = "round";
      tempCtx.miterLimit = 2;
      tempCtx.strokeText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);

      // Draw text with selected color
      tempCtx.fillStyle = textBox.color || "#ffffff";
      tempCtx.fillText(textBox.text, textBox.x * scaleX, textBox.y * scaleY);
    });

    // Convert to blob and download
    tempCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meme-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the meme generator when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new MemeGenerator();
});
