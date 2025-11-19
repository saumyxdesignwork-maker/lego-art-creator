// ================================
// LEGO Art Creator - Main JavaScript
// ================================

// ================================
// Global State Variables
// ================================
let currentColor = '#FF0000'; // Currently selected color (default: red)
let canvasSize = 32; // Grid size (32x32 by default)
let legoGrid = []; // 2D array to store brick colors
let undoStack = []; // Array to store previous states for undo
let isEraserMode = false; // Track if eraser tool is active
let referenceImageData = null; // Store reference image for color picking

// ================================
// LEGO Color Palette
// Based on actual LEGO brick colors
// ================================
const legoColors = [
    { name: 'Bright Red', hex: '#C91A09' },
    { name: 'Bright Blue', hex: '#0055BF' },
    { name: 'Bright Yellow', hex: '#F2CD37' },
    { name: 'Dark Green', hex: '#287F46' },
    { name: 'Bright Orange', hex: '#FE8A18' },
    { name: 'Medium Lavender', hex: '#AC78BA' },
    { name: 'White', hex: '#F2F3F2' },
    { name: 'Black', hex: '#05131D' },
    { name: 'Dark Tan', hex: '#958A73' },
    { name: 'Medium Blue', hex: '#5A93DB' },
    { name: 'Bright Green', hex: '#4B9F4A' },
    { name: 'Dark Orange', hex: '#A95500' },
    { name: 'Light Purple', hex: '#E4ADC8' },
    { name: 'Sand Blue', hex: '#6074A1' },
    { name: 'Dark Red', hex: '#720E0F' },
    { name: 'Lime', hex: '#BBE90B' },
    { name: 'Medium Azur', hex: '#36AEBF' },
    { name: 'Dark Brown', hex: '#352100' },
    { name: 'Light Bluish Gray', hex: '#A0A5A9' },
    { name: 'Dark Bluish Gray', hex: '#6C6E68' },
];

// ================================
// Initialize App When Page Loads
// ================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧱 LEGO Art Creator Initialized!');
    
    // Set up all initial components
    initializeColorPalette();
    initializeCanvas();
    setupEventListeners();
    
    // Select first color by default
    selectColor(legoColors[0].hex);
});

// ================================
// 1. COLOR PALETTE FUNCTIONS
// ================================

/**
 * Creates color swatches in the toolbar
 * Each swatch represents a LEGO brick color
 */
function initializeColorPalette() {
    const palette = document.getElementById('colorPalette');
    
    // Loop through each LEGO color and create a swatch
    legoColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color.hex;
        swatch.title = color.name; // Tooltip showing color name
        
        // When clicked, select this color
        swatch.addEventListener('click', () => {
            selectColor(color.hex);
            isEraserMode = false; // Turn off eraser when selecting color
            updateToolButtons();
        });
        
        palette.appendChild(swatch);
    });
}

/**
 * Sets the currently selected color
 * @param {string} colorHex - Hexadecimal color code
 */
function selectColor(colorHex) {
    currentColor = colorHex;
    
    // Update visual indicator showing which color is selected
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        if (swatch.style.backgroundColor === rgbToHex(swatch.style.backgroundColor)) {
            swatch.classList.remove('selected');
        }
        if (rgbToHex(swatch.style.backgroundColor) === colorHex.toUpperCase()) {
            swatch.classList.add('selected');
        }
    });
}

/**
 * Converts RGB color to Hex format
 * Helper function for color comparison
 */
function rgbToHex(rgb) {
    // Extract rgb values
    const result = rgb.match(/\d+/g);
    if (!result) return rgb;
    
    // Convert to hex
    const r = parseInt(result[0]).toString(16).padStart(2, '0');
    const g = parseInt(result[1]).toString(16).padStart(2, '0');
    const b = parseInt(result[2]).toString(16).padStart(2, '0');
    
    return `#${r}${g}${b}`.toUpperCase();
}

// ================================
// 2. CANVAS/GRID FUNCTIONS
// ================================

/**
 * Creates the LEGO building grid
 * Grid size is determined by canvasSize variable
 */
function initializeCanvas() {
    const canvas = document.getElementById('legoCanvas');
    canvas.innerHTML = ''; // Clear existing grid
    
    // Initialize 2D array to track brick colors
    legoGrid = Array(canvasSize).fill(null).map(() => 
        Array(canvasSize).fill(null)
    );
    
    // Set CSS grid layout
    canvas.style.gridTemplateColumns = `repeat(${canvasSize}, 1fr)`;
    
    // Create individual brick cells
    for (let row = 0; row < canvasSize; row++) {
        for (let col = 0; col < canvasSize; col++) {
            const brick = createBrick(row, col);
            canvas.appendChild(brick);
        }
    }
    
    updateProgress();
}

/**
 * Creates a single LEGO brick element
 * @param {number} row - Row position in grid
 * @param {number} col - Column position in grid
 * @returns {HTMLElement} The brick element
 */
function createBrick(row, col) {
    const brick = document.createElement('div');
    brick.className = 'brick';
    brick.dataset.row = row; // Store position data
    brick.dataset.col = col;
    
    // Handle brick click - place color or erase
    brick.addEventListener('click', () => {
        placeBrick(row, col, brick);
    });
    
    return brick;
}

/**
 * Places or removes a colored brick
 * @param {number} row - Row position
 * @param {number} col - Column position
 * @param {HTMLElement} brickElement - The brick DOM element
 */
function placeBrick(row, col, brickElement) {
    // Save current state for undo functionality
    saveState();
    
    if (isEraserMode) {
        // Eraser mode: remove color
        legoGrid[row][col] = null;
        brickElement.style.backgroundColor = '#1a1a1a';
        brickElement.classList.remove('placed');
    } else {
        // Place mode: add color
        legoGrid[row][col] = currentColor;
        brickElement.style.backgroundColor = currentColor;
        brickElement.classList.add('placed');
        
        // Play satisfying "snap" effect
        playSnapEffect(brickElement);
    }
    
    updateProgress();
}

/**
 * Visual feedback when placing a brick
 * @param {HTMLElement} element - The brick element
 */
function playSnapEffect(element) {
    // Add a quick scale animation
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 100);
}

// ================================
// 3. PROGRESS TRACKING
// ================================

/**
 * Updates the progress bar based on placed bricks
 */
function updateProgress() {
    const totalCells = canvasSize * canvasSize;
    let filledCells = 0;
    
    // Count how many cells have colors
    legoGrid.forEach(row => {
        row.forEach(cell => {
            if (cell !== null) filledCells++;
        });
    });
    
    // Calculate percentage
    const percentage = Math.round((filledCells / totalCells) * 100);
    
    // Update UI
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressText').textContent = percentage + '%';
}

// ================================
// 4. TOOL FUNCTIONS
// ================================

/**
 * Clears the entire canvas
 */
function clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas?')) {
        saveState();
        initializeCanvas(); // Recreate empty grid
    }
}

/**
 * Toggles eraser mode
 */
function toggleEraser() {
    isEraserMode = !isEraserMode;
    updateToolButtons();
}

/**
 * Updates visual state of tool buttons
 */
function updateToolButtons() {
    const eraserBtn = document.getElementById('eraserBtn');
    
    if (isEraserMode) {
        eraserBtn.classList.add('active');
    } else {
        eraserBtn.classList.remove('active');
    }
}

/**
 * Undoes the last action
 */
function undo() {
    if (undoStack.length === 0) {
        alert('Nothing to undo!');
        return;
    }
    
    // Restore previous state
    const previousState = undoStack.pop();
    legoGrid = previousState;
    
    // Redraw canvas
    redrawCanvas();
}

/**
 * Saves current state to undo stack
 */
function saveState() {
    // Deep copy of current grid state
    const stateCopy = legoGrid.map(row => [...row]);
    undoStack.push(stateCopy);
    
    // Limit undo stack size to prevent memory issues
    if (undoStack.length > 20) {
        undoStack.shift(); // Remove oldest state
    }
}

/**
 * Redraws canvas based on current legoGrid data
 */
function redrawCanvas() {
    const bricks = document.querySelectorAll('.brick');
    console.log(`🖌️ Redrawing ${bricks.length} bricks...`);
    
    let coloredCount = 0;
    bricks.forEach(brick => {
        const row = parseInt(brick.dataset.row);
        const col = parseInt(brick.dataset.col);
        const color = legoGrid[row][col];
        
        if (color) {
            brick.style.backgroundColor = color;
            brick.classList.add('placed');
            coloredCount++;
        } else {
            brick.style.backgroundColor = '#1a1a1a';
            brick.classList.remove('placed');
        }
    });
    
    console.log(`✅ Redrawn! ${coloredCount} colored bricks, ${bricks.length - coloredCount} empty`);
    updateProgress();
}

// ================================
// 5. IMAGE UPLOAD & REFERENCE
// ================================

/**
 * Handles reference image upload
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = document.getElementById('referenceImage');
        img.src = e.target.result;
        img.classList.add('visible');
        
        // Hide upload prompt
        document.querySelector('.image-upload').style.display = 'none';
        
        // Show generate and change image buttons
        document.getElementById('generateBtn').style.display = 'block';
        document.getElementById('changeImageBtn').style.display = 'block';
        
        // Store image data for color picking and auto-generation
        loadImageData(img);
        
        console.log('📸 New image uploaded successfully!');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Handles changing/replacing the reference image
 */
function changeImage() {
    // Ask for confirmation if canvas has content
    const hasContent = legoGrid.some(row => row.some(cell => cell !== null));
    
    if (hasContent) {
        const confirmed = confirm(
            '⚠️ Changing the image will not clear your current LEGO art. ' +
            'Do you want to continue with a new reference image?'
        );
        if (!confirmed) return;
    }
    
    // Reset the file input and trigger it
    const fileInput = document.getElementById('imageUpload');
    fileInput.value = ''; // Clear previous selection
    fileInput.click(); // Open file picker
    
    console.log('🔄 Opening file picker to change image...');
}

/**
 * Loads image data for color picking functionality
 * @param {HTMLImageElement} img - The reference image
 */
function loadImageData(img) {
    // Create hidden canvas to extract pixel data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        referenceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        console.log('✅ Image loaded! Ready to generate LEGO art.');
    };
}

// ================================
// 6. AUTO-GENERATE LEGO ART
// ================================

/**
 * Automatically generates LEGO art from the reference image
 * This is the MAGIC function that converts your photo to LEGO!
 */
function generateLegoArt() {
    const img = document.getElementById('referenceImage');
    
    console.log('🎨 Generate button clicked!');
    console.log('Image src:', img.src);
    console.log('Image complete:', img.complete);
    console.log('Image naturalWidth:', img.naturalWidth);
    
    // Check if image is loaded
    if (!img.src || img.src === '') {
        alert('Please upload an image first!');
        return;
    }
    
    // Disable button during generation
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.textContent = '⚙️ Generating...';
    
    // Give visual feedback
    console.log('🎨 Starting LEGO art generation...');
    
    // Wait for image to be fully loaded
    if (img.complete && img.naturalWidth > 0) {
        console.log('✅ Image already loaded, processing now...');
        processImageToLego(img);
    } else {
        console.log('⏳ Waiting for image to load...');
        img.onload = function() {
            console.log('✅ Image loaded via onload event');
            processImageToLego(img);
        };
        // Add error handler
        img.onerror = function() {
            console.error('❌ Error loading image');
            alert('Error loading image. Please try again.');
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Generate LEGO Art';
        };
    }
}

/**
 * Processes the image and converts it to LEGO bricks
 * @param {HTMLImageElement} img - The reference image
 */
function processImageToLego(img) {
    console.log('🔧 processImageToLego called');
    console.log('Image dimensions:', img.width, 'x', img.height);
    console.log('Canvas size:', canvasSize);
    
    // Save state for undo
    saveState();
    
    // Create a temporary canvas to analyze the image
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    
    // Resize image to match our LEGO grid size
    tempCanvas.width = canvasSize;
    tempCanvas.height = canvasSize;
    
    console.log('Temp canvas created:', tempCanvas.width, 'x', tempCanvas.height);
    
    // Draw the image scaled down to grid size
    // This automatically "pixelates" the image!
    try {
        ctx.drawImage(img, 0, 0, canvasSize, canvasSize);
        console.log('✅ Image drawn to temp canvas');
    } catch (error) {
        console.error('❌ Error drawing image:', error);
        alert('Error processing image: ' + error.message);
        return;
    }
    
    // Get pixel data from the scaled image
    const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    const pixels = imageData.data; // Array of RGBA values
    
    console.log(`📊 Processing ${canvasSize}x${canvasSize} = ${canvasSize * canvasSize} bricks...`);
    console.log(`Pixel data length: ${pixels.length}`);
    
    // Process each pixel in the grid
    let processedCount = 0;
    for (let row = 0; row < canvasSize; row++) {
        for (let col = 0; col < canvasSize; col++) {
            // Calculate position in the pixel data array
            // Each pixel has 4 values: Red, Green, Blue, Alpha
            const pixelIndex = (row * canvasSize + col) * 4;
            
            // Extract RGB color values (0-255 for each)
            const r = pixels[pixelIndex];     // Red
            const g = pixels[pixelIndex + 1]; // Green
            const b = pixels[pixelIndex + 2]; // Blue
            // pixels[pixelIndex + 3] is Alpha (transparency) - we ignore it
            
            // Find the closest LEGO color to this pixel's color
            const closestLegoColor = findClosestLegoColor(r, g, b);
            
            // Update our grid data
            legoGrid[row][col] = closestLegoColor;
            processedCount++;
        }
    }
    
    console.log(`✅ Processed ${processedCount} bricks`);
    console.log('Sample colors from grid:', legoGrid[0].slice(0, 5));
    
    // Redraw the entire canvas with new colors
    console.log('🎨 Calling redrawCanvas...');
    redrawCanvas();
    
    // Re-enable button
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = false;
    generateBtn.textContent = '✨ Generate LEGO Art';
    
    console.log('✅ LEGO art generated successfully!');
    
    // Check first few bricks to verify colors are applied
    const firstBricks = document.querySelectorAll('.brick');
    console.log('First 5 brick colors:', 
        Array.from(firstBricks).slice(0, 5).map(b => b.style.backgroundColor)
    );
    
    alert('🎉 Your LEGO art has been generated! You can now manually adjust any bricks you want.');
}

/**
 * Finds the closest LEGO color to a given RGB color
 * Uses Euclidean distance in RGB color space
 * 
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code of closest LEGO color
 */
function findClosestLegoColor(r, g, b) {
    let closestColor = legoColors[0].hex;
    let smallestDistance = Infinity; // Start with a very large number
    
    // Check each LEGO color to find the closest match
    legoColors.forEach(legoColor => {
        // Convert hex to RGB for comparison
        const legoRGB = hexToRgb(legoColor.hex);
        
        // Calculate "distance" between colors using Euclidean distance formula
        // Think of it like measuring distance in 3D space (R, G, B are the axes)
        // Formula: distance = √[(r1-r2)² + (g1-g2)² + (b1-b2)²]
        const distance = Math.sqrt(
            Math.pow(r - legoRGB.r, 2) +
            Math.pow(g - legoRGB.g, 2) +
            Math.pow(b - legoRGB.b, 2)
        );
        
        // If this color is closer than previous best, save it
        if (distance < smallestDistance) {
            smallestDistance = distance;
            closestColor = legoColor.hex;
        }
    });
    
    return closestColor;
}

/**
 * Converts hex color to RGB object
 * @param {string} hex - Hex color code (e.g., '#FF0000')
 * @returns {object} Object with r, g, b properties
 */
function hexToRgb(hex) {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Parse hex string to integers
    // For #FF0000: FF (255), 00 (0), 00 (0)
    return {
        r: parseInt(hex.substring(0, 2), 16), // First 2 characters
        g: parseInt(hex.substring(2, 4), 16), // Middle 2 characters
        b: parseInt(hex.substring(4, 6), 16)  // Last 2 characters
    };
}

// ================================
// 7. SAVE FUNCTIONALITY
// ================================

/**
 * Saves the creation as an image
 */
function saveCreation() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size (each brick = 20px)
    const brickSize = 20;
    canvas.width = canvasSize * brickSize;
    canvas.height = canvasSize * brickSize;
    
    // Draw each brick
    for (let row = 0; row < canvasSize; row++) {
        for (let col = 0; col < canvasSize; col++) {
            const color = legoGrid[row][col] || '#e0e0e0';
            
            // Draw brick
            ctx.fillStyle = color;
            ctx.fillRect(col * brickSize, row * brickSize, brickSize, brickSize);
            
            // Draw brick border
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 1;
            ctx.strokeRect(col * brickSize, row * brickSize, brickSize, brickSize);
            
            // Draw stud (circle on top)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(
                col * brickSize + brickSize / 2,
                row * brickSize + brickSize / 2,
                brickSize / 4,
                0,
                2 * Math.PI
            );
            ctx.fill();
        }
    }
    
    // Download image
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lego-art-creation.png';
        a.click();
        URL.revokeObjectURL(url);
    });
}

// ================================
// 8. EVENT LISTENERS SETUP
// ================================

/**
 * Sets up all button and control event listeners
 */
function setupEventListeners() {
    // Clear button
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    
    // Save button
    document.getElementById('saveBtn').addEventListener('click', saveCreation);
    
    // Eraser tool
    document.getElementById('eraserBtn').addEventListener('click', toggleEraser);
    
    // Undo button
    document.getElementById('undoBtn').addEventListener('click', undo);
    
    // Canvas size selector
    document.getElementById('canvasSize').addEventListener('change', function(e) {
        canvasSize = parseInt(e.target.value);
        if (confirm('Changing canvas size will clear your current work. Continue?')) {
            initializeCanvas();
        } else {
            // Revert selection
            e.target.value = canvasSize;
        }
    });
    
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    // Generate LEGO Art button
    document.getElementById('generateBtn').addEventListener('click', generateLegoArt);
    
    // Change Image button
    document.getElementById('changeImageBtn').addEventListener('click', changeImage);
    
    // Grid overlay toggle
    document.getElementById('gridOverlay').addEventListener('change', function(e) {
        const img = document.getElementById('referenceImage');
        if (e.target.checked) {
            img.style.backgroundImage = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 1px, transparent 1px, transparent 20px)';
            img.style.backgroundSize = '20px 20px';
        } else {
            img.style.backgroundImage = 'none';
        }
    });
}

// ================================
// 9. HELPFUL CONSOLE MESSAGE
// ================================
console.log('%c🧱 Welcome to LEGO Art Creator! ', 'background: #cc0000; color: white; font-size: 16px; padding: 10px;');
console.log('Tips:');
console.log('1. Upload a reference image to recreate');
console.log('2. Click "Generate LEGO Art" for automatic conversion!');
console.log('3. Or manually select colors and place bricks');
console.log('4. Use the eraser to remove or adjust bricks');
console.log('5. Save your creation when done!');

