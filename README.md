# 🧱 Digital LEGO Art Creator

An interactive web application that automatically converts images into LEGO brick art!

## ✨ New Feature: Auto-Generate LEGO Art

Upload any image and watch it transform into pixelated LEGO masterpieces automatically!

## 🎯 How to Use

### Method 1: Auto-Generate (Recommended!)
1. **Upload** a reference image (your Mona Lisa, Van Gogh, or any photo)
2. Wait for the image to load
3. Click the **"✨ Generate LEGO Art"** button
4. Watch your image convert to LEGO bricks automatically!
5. **Manually adjust** any bricks you want to change
6. **Save** your creation

### Method 2: Manual Creation
1. Upload a reference image
2. Select colors from the palette
3. Click individual bricks to place colors
4. Build your art piece by piece

## 🧠 How the Auto-Generation Works

### Step 1: Image Scaling
- Your image is resized to match the grid size (e.g., 32×32 pixels)
- This creates automatic "pixelation"

### Step 2: Color Analysis
- Each pixel's RGB color is extracted
- Formula: Each pixel has Red (0-255), Green (0-255), Blue (0-255)

### Step 3: Color Matching
- The algorithm finds the closest LEGO color for each pixel
- Uses **Euclidean distance** in RGB color space
- Formula: `distance = √[(r₁-r₂)² + (g₁-g₂)² + (b₁-b₂)²]`

### Step 4: Brick Placement
- Automatically places matching LEGO bricks on the canvas
- You can still edit after generation!

## 🎨 Features

- ✅ **Auto-generation** from any image
- ✅ **20 authentic LEGO colors**
- ✅ **3 canvas sizes** (16×16, 32×32, 48×48)
- ✅ **Manual editing** after generation
- ✅ **Undo/Redo** functionality
- ✅ **Save as PNG** with LEGO stud details
- ✅ **Progress tracker**
- ✅ **Responsive design**

## 🚀 Quick Start

1. Open `index.html` in your web browser
2. Upload an image
3. Click "Generate LEGO Art"
4. Enjoy! 🎉

## 📚 Learning Concepts

This project teaches:
- HTML Canvas API
- Image processing
- Color theory (RGB color space)
- Distance algorithms
- DOM manipulation
- Event handling
- File handling

## 🎓 Code Highlights

### Color Matching Algorithm
```javascript
function findClosestLegoColor(r, g, b) {
    let closestColor = legoColors[0].hex;
    let smallestDistance = Infinity;
    
    legoColors.forEach(legoColor => {
        const legoRGB = hexToRgb(legoColor.hex);
        const distance = Math.sqrt(
            Math.pow(r - legoRGB.r, 2) +
            Math.pow(g - legoRGB.g, 2) +
            Math.pow(b - legoRGB.b, 2)
        );
        
        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = legoColor.hex;
        }
    });
    
    return closestColor;
}
```

## 🎯 Tips for Best Results

1. **Use high-contrast images** for better LEGO conversions
2. **Try 16×16** for quick tests, **48×48** for detailed art
3. **Portraits work great** (like Mona Lisa!)
4. **Use the grid overlay** to match reference pixels
5. **Save frequently** to preserve your work

## 🛠️ Technologies Used

- Pure HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript
- Canvas API

## 📖 Browser Support

Works on all modern browsers:
- Chrome ✅
- Safari ✅
- Firefox ✅
- Edge ✅

---

**Made with 🧱 and ❤️ for learning web development!**

