// DOM Elements
const uploadContainer = document.getElementById('upload-container');
const fileInput = document.getElementById('file-input');
const timeInterval = document.getElementById('time-interval');
const processBtn = document.getElementById('process-btn');
const progressSection = document.getElementById('progress-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const resultsSection = document.getElementById('results-section');
const segmentsContainer = document.getElementById('segments-container');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const videoPreviewContainer = document.getElementById('video-preview-container');
const videoPreview = document.getElementById('video-preview');
const videoInfo = document.getElementById('video-info');
const downloadAllBtn = document.getElementById('download-all-btn');

// Global variables
let selectedFile = null;
let videoDuration = 0;
let videoSegments = [];

// Drag and Drop Events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, preventDefaults);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, highlight);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadContainer.addEventListener(eventName, unhighlight);
});

function highlight() {
    uploadContainer.classList.add('dragover');
}

function unhighlight() {
    uploadContainer.classList.remove('dragover');
}

// Handle file drop
uploadContainer.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
            selectedFile = file;
            showVideoPreview(file);
            hideError();
        }
    }
}

function validateFile(file) {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
        showError('Please upload a valid video file (MP4, WebM, AVI, MOV)');
        return false;
    }
    if (file.size > 500 * 1024 * 1024) { // 500MB limit
        showError('File size should be less than 500MB');
        return false;
    }
    return true;
}

function showVideoPreview(file) {
    const videoURL = URL.createObjectURL(file);
    videoPreview.src = videoURL;
    videoPreviewContainer.classList.remove('hidden');
    
    // Update upload container
    uploadContainer.innerHTML = `
        <div class="space-y-4">
            <p class="text-gray-700">Selected file: ${file.name}</p>
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300" onclick="resetUpload()">
                Change Video
            </button>
        </div>
    `;

    // Get video duration when metadata is loaded
    videoPreview.addEventListener('loadedmetadata', function() {
        videoDuration = videoPreview.duration;
        const minutes = Math.floor(videoDuration / 60);
        const seconds = Math.floor(videoDuration % 60);
        videoInfo.textContent = `Duration: ${minutes}m ${seconds}s`;
    });
}

function resetUpload() {
    selectedFile = null;
    videoDuration = 0;
    videoSegments = [];
    fileInput.value = '';
    videoPreview.src = '';
    videoPreviewContainer.classList.add('hidden');
    uploadContainer.innerHTML = `
        <input type="file" id="file-input" class="hidden" accept="video/*">
        <div class="space-y-4">
            <i class="fas fa-cloud-upload-alt text-4xl text-indigo-600"></i>
            <h3 class="text-lg font-medium text-gray-900">Drag & Drop your video here</h3>
            <p class="text-gray-500">Supported formats: MP4, AVI, MOV, WebM</p>
            <p class="text-gray-500">or</p>
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300">
                Browse Files
            </button>
        </div>
    `;
    // Reattach event listener to new file input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
}

// Process Button Click Handler
processBtn.addEventListener('click', processVideo);

function processVideo() {
    if (!selectedFile) {
        showError('Please select a video first');
        return;
    }

    const minutes = parseInt(timeInterval.value);
    if (isNaN(minutes) || minutes < 1) {
        showError('Please enter a valid time interval (minimum 1 minute)');
        return;
    }

    if (videoDuration === 0) {
        showError('Please wait for the video to load completely');
        return;
    }

    hideError();
    startProcessing(minutes);
}

function startProcessing(intervalMinutes) {
    // Show progress section
    progressSection.classList.remove('hidden');
    processBtn.disabled = true;
    processBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const intervalSeconds = intervalMinutes * 60;
    const totalSegments = Math.ceil(videoDuration / intervalSeconds);
    videoSegments = [];
    let currentSegment = 0;

    // Simulate processing with progress updates
    const interval = setInterval(() => {
        currentSegment++;
        const progress = (currentSegment / totalSegments) * 100;
        updateProgress(progress);

        if (currentSegment >= totalSegments) {
            clearInterval(interval);
            setTimeout(() => {
                showResults(totalSegments, intervalMinutes);
            }, 500);
        }
    }, 1000);
}

function updateProgress(progress) {
    const roundedProgress = Math.round(progress);
    progressBar.style.width = `${roundedProgress}%`;
    progressText.textContent = `${roundedProgress}%`;
}

function showResults(totalSegments, intervalMinutes) {
    // Hide progress section
    progressSection.classList.add('hidden');
    
    // Show results section
    resultsSection.classList.remove('hidden');
    
    // Clear previous results
    segmentsContainer.innerHTML = '';
    videoSegments = [];
    
    // Add segment cards with animation delay
    for (let i = 0; i < totalSegments; i++) {
        const startTime = i * intervalMinutes;
        const endTime = Math.min((i + 1) * intervalMinutes, Math.ceil(videoDuration / 60));
        
        // Create segment data
        const segmentData = {
            index: i + 1,
            startTime,
            endTime,
            fileName: `segment_${i + 1}.mp4`,
            blob: new Blob([selectedFile], { type: selectedFile.type }) // Simulate segment data
        };
        videoSegments.push(segmentData);
        
        const segmentCard = createSegmentCard(segmentData);
        segmentCard.style.animation = `slideIn 0.5s ease-out ${i * 100}ms forwards`;
        segmentCard.style.opacity = '0';
        segmentsContainer.appendChild(segmentCard);
    }

    // Reset process button
    processBtn.disabled = false;
    processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

function createSegmentCard(segment) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-sm p-4 flex items-center justify-between';
    div.innerHTML = `
        <div class="flex items-center">
            <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                <i class="fas fa-film text-3xl text-gray-400"></i>
            </div>
            <div class="ml-4">
                <h4 class="text-sm font-medium text-gray-900">Segment ${segment.index}</h4>
                <p class="text-sm text-gray-500">${segment.startTime}-${segment.endTime} minutes</p>
            </div>
        </div>
        <button class="text-indigo-600 hover:text-indigo-800 transition-colors duration-300" 
                title="Download Segment"
                onclick="downloadSegment(${segment.index - 1})">
            <i class="fas fa-download"></i>
        </button>
    `;
    return div;
}

// Download individual segment
function downloadSegment(index) {
    const segment = videoSegments[index];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(segment.blob);
    link.download = segment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Download all segments as ZIP
downloadAllBtn.addEventListener('click', async function() {
    const zip = new JSZip();
    
    // Add loading state to button
    downloadAllBtn.disabled = true;
    downloadAllBtn.innerHTML = `
        <i class="fas fa-spinner animate-spin-slow mr-2"></i>
        Creating ZIP...
    `;

    try {
        // Add each segment to the ZIP
        videoSegments.forEach(segment => {
            zip.file(segment.fileName, segment.blob);
        });

        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = 'video_segments.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        showError('Error creating ZIP file');
        console.error('Error:', error);
    } finally {
        // Reset button state
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = `
            <i class="fas fa-download mr-2"></i>
            Download All (ZIP)
        `;
    }
});

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

// Click handler for the upload container
uploadContainer.addEventListener('click', () => {
    fileInput.click();
});
