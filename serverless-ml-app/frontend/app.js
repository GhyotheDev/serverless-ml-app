// Configuration - Replace with your actual API Gateway URL and S3 bucket name after deployment
const API_ENDPOINT = 'YOUR_API_GATEWAY_URL'; // Will be updated after deployment
const S3_BUCKET = 'YOUR_S3_BUCKET_NAME';     // Will be updated after deployment
const REGION = 'us-east-1';                  // Change to your AWS region

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const previewContainer = document.getElementById('preview-container');
const previewImage = document.getElementById('preview-image');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsContainer = document.getElementById('results-container');
const loadingSpinner = document.getElementById('loading-spinner');

// Event Listeners
dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzeImage);

// Drag and drop functionality
['dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

dropArea.addEventListener('dragover', () => {
    dropArea.classList.add('active');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('active');
});

dropArea.addEventListener('drop', (e) => {
    dropArea.classList.remove('active');
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFile(file);
});

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    handleFile(file);
}

function handleFile(file) {
    if (!file || !file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }
    
    // Display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewContainer.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Store file for later use
    previewImage.file = file;
}

// Analyze image using direct API call
async function analyzeImage() {
    const file = previewImage.file;
    if (!file) return;
    
    loadingSpinner.style.display = 'block';
    analyzeBtn.disabled = true;
    resultsContainer.innerHTML = '';
    
    try {
        // Convert image to base64
        const base64Image = await fileToBase64(file);
        const base64Data = base64Image.split(',')[1];
        
        // Call API Gateway endpoint
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: base64Data
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        displayResults(data);
    } catch (error) {
        console.error('Error:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger mt-3">
                Error analyzing image: ${error.message}
            </div>
        `;
    } finally {
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Display analysis results
function displayResults(data) {
    let resultsHTML = '';
    
    // Display detected labels
    if (data.labels && data.labels.length > 0) {
        resultsHTML += `
            <div class="card result-card">
                <div class="card-header">
                    <h5>Detected Objects</h5>
                </div>
                <div class="card-body">
                    <div class="row">
        `;
        
        data.labels.forEach(label => {
            const confidence = Math.round(label.Confidence);
            resultsHTML += `
                <div class="col-md-6 mb-3">
                    <p class="mb-1"><strong>${label.Name}</strong> (${confidence}%)</p>
                    <div class="progress confidence-bar">
                        <div class="progress-bar" role="progressbar" style="width: ${confidence}%" 
                            aria-valuenow="${confidence}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                </div>
            `;
        });
        
        resultsHTML += `
                    </div>
                </div>
            </div>
        `;
    }
    
    // Display detected faces
    if (data.faces && data.faces.length > 0) {
        resultsHTML += `
            <div class="card result-card">
                <div class="card-header">
                    <h5>Detected Faces</h5>
                </div>
                <div class="card-body">
        `;
        
        data.faces.forEach((face, index) => {
            const confidence = Math.round(face.Confidence);
            let faceDetails = `<p><strong>Face ${index + 1}</strong> (${confidence}% confidence)</p>`;
            
            // Age range
            if (face.AgeRange) {
                faceDetails += `<p>Age range: ${face.AgeRange.Low} - ${face.AgeRange.High} years</p>`;
            }
            
            // Gender
            if (face.Gender) {
                faceDetails += `<p>Gender: ${face.Gender.Value} (${Math.round(face.Gender.Confidence)}% confidence)</p>`;
            }
            
            // Emotions - show top emotion
            if (face.Emotions && face.Emotions.length > 0) {
                const topEmotion = face.Emotions.sort((a, b) => b.Confidence - a.Confidence)[0];
                faceDetails += `<p>Emotion: ${topEmotion.Type} (${Math.round(topEmotion.Confidence)}% confidence)</p>`;
            }
            
            resultsHTML += `
                <div class="mb-4">
                    ${faceDetails}
                    <hr>
                </div>
            `;
        });
        
        resultsHTML += `
                </div>
            </div>
        `;
    }
    
    // If no results found
    if (!resultsHTML) {
        resultsHTML = `
            <div class="alert alert-info mt-3">
                No objects or faces detected in this image.
            </div>
        `;
    }
    
    resultsContainer.innerHTML = resultsHTML;
}