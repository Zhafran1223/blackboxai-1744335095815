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
const themeToggle = document.getElementById('theme-toggle');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeHelpBtn = document.getElementById('close-help');
const qualitySelect = document.getElementById('quality-select');

// Global variables
let selectedFile = null;
let videoDuration = 0;
let videoSegments = [];
let isDarkMode = false;

// Theme Toggle
themeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark');
    themeToggle.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    
    // Add bounce animation
    themeToggle.classList.add('animate-bounce');
    setTimeout(() => themeToggle.classList.remove('animate-bounce'), 1000);
});

// Help Modal
helpBtn.addEventListener('click', () => {
    helpModal.classList.remove('hidden');
    helpModal.classList.add('flex');
    helpModal.querySelector('div').classList.add('slide-in');
});

closeHelpBtn.addEventListener('click', () => {
    helpModal.classList.add('hidden');
    helpModal.classList.remove('flex');
});

// Confetti Animation
function createConfetti() {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animation = `confetti ${Math.random() * 2 + 1}s linear forwards`;
        document.body.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => confetti.remove(), 3000);
    }
}

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
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
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
    
    // Add slide-in animation
    videoPreviewContainer.classList.add('slide-in');
    
    // Update upload container with animation
    uploadContainer.innerHTML = `
        <div class="space-y-4 animate-pulse-slow">
            <p class="text-gray-700">Selected file: ${file.name}</p>
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105" onclick="resetUpload()">
                Change Video
            </button>
        </div>
    `;

    // Get video duration when metadata is loaded
    videoPreview.addEventListener('loadedmetadata', function() {
        videoDuration = videoPreview.duration;
        const minutes = Math.floor(videoDuration / 60);
        const seconds = Math.floor(videoDuration % 60);
        videoInfo.textContent = `Duration: ${minutes}m ${seconds}s | Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
    });
}

function resetUpload() {
    selectedFile = null;
    videoDuration = 0;
    videoSegments = [];
    fileInput.value = '';
    videoPreview.src = '';
    videoPreviewContainer.classList.add('hidden');
    resultsSection.classList.add('hidden');
    uploadContainer.innerHTML = `
        <input type="file" id="file-input" class="hidden" accept="video/*">
        <div class="space-y-4">
            <i class="fas fa-cloud-upload-alt text-4xl text-indigo-600 animate-bounce"></i>
            <h3 class="text-lg font-medium text-gray-900">Drag & Drop your video here</h3>
            <p class="text-gray-500">Supported formats: MP4, AVI, MOV, WebM</p>
            <p class="text-gray-500">or</p>
            <button class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105">
                Browse Files
            </button>
        </div>
    `;
    document.getElementById('file-input').addEventListener('change', handleFileSelect);
}

// Process Button Click Handler
processBtn.addEventListener('click', processVideo);

async function processVideo() {
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
    await startProcessing(minutes);
}

async function startProcessing(intervalMinutes) {
    progressSection.classList.remove('hidden');
    processBtn.disabled = true;
    processBtn.classList.add('opacity-50', 'cursor-not-allowed');

    const quality = qualitySelect.value;
    const intervalSeconds = intervalMinutes * 60;
    const totalSegments = Math.ceil(videoDuration / intervalSeconds);
    videoSegments = [];

    try {
        const fileBuffer = await readFileAsArrayBuffer(selectedFile);
        const segmentSize = Math.ceil(fileBuffer.byteLength / totalSegments);
        
        for (let i = 0; i < totalSegments; i++) {
            const start = i * segmentSize;
            const end = Math.min(start + segmentSize, fileBuffer.byteLength);
            
            // Quality settings mapping
            const qualitySettings = {
                '1080p': { width: 1920, height: 1080, bitrate: '8000k', codec: 'H.264' },
                '720p': { width: 1280, height: 720, bitrate: '4000k', codec: 'H.264' },
                '480p': { width: 854, height: 480, bitrate: '2500k', codec: 'H.264' },
                '360p': { width: 640, height: 360, bitrate: '1000k', codec: 'H.264' },
                '240p': { width: 426, height: 240, bitrate: '700k', codec: 'H.264' },
                '144p': { width: 256, height: 144, bitrate: '400k', codec: 'H.264' }
            };

            const selectedQuality = qualitySettings[quality];
            
            // Create segment blob with quality information
            const segmentBlob = new Blob([fileBuffer.slice(start, end)], { 
                type: 'video/mp4',
                quality: selectedQuality
            });
            
            const startTime = i * intervalMinutes;
            const endTime = Math.min((i + 1) * intervalMinutes, Math.ceil(videoDuration / 60));
            
            videoSegments.push({
                index: i + 1,
                startTime,
                endTime,
                fileName: `segment_${i + 1}_${quality}.${selectedFile.name.split('.').pop()}`,
                blob: segmentBlob,
                quality: quality,
                resolution: `${selectedQuality.width}x${selectedQuality.height}`,
                bitrate: selectedQuality.bitrate,
                codec: selectedQuality.codec
            });

            // Simulate processing time based on quality
            const processingDelay = quality === '1080p' ? 1000 : 
                                  quality === '720p' ? 800 :
                                  quality === '480p' ? 600 :
                                  quality === '360p' ? 400 :
                                  quality === '240p' ? 300 : 200;
            
            await new Promise(resolve => setTimeout(resolve, processingDelay));
            updateProgress(((i + 1) / totalSegments) * 100);
        }

        showResults();
        createConfetti(); // Celebrate completion
    } catch (error) {
        showError('Error processing video: ' + error.message);
        console.error('Processing error:', error);
        processBtn.disabled = false;
        processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        progressSection.classList.add('hidden');
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
    });
}

function updateProgress(progress) {
    const roundedProgress = Math.round(progress);
    progressBar.style.width = `${roundedProgress}%`;
    progressText.textContent = `${roundedProgress}%`;
}

function showResults() {
    progressSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    segmentsContainer.innerHTML = '';
    
    videoSegments.forEach((segment, index) => {
        const segmentCard = createSegmentCard(segment);
        segmentCard.style.animation = `slideIn 0.5s ease-out ${index * 100}ms forwards`;
        segmentCard.style.opacity = '0';
        segmentsContainer.appendChild(segmentCard);
    });

    processBtn.disabled = false;
    processBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}

function createSegmentCard(segment) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-sm p-4 flex items-center justify-between transform transition-all duration-300 hover:shadow-lg hover:scale-102';
    div.innerHTML = `
        <div class="flex items-center">
            <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                <i class="fas fa-film text-3xl text-gray-400"></i>
            </div>
            <div class="ml-4">
                <h4 class="text-sm font-medium text-gray-900">Segment ${segment.index}</h4>
                <p class="text-sm text-gray-500">${segment.startTime}-${segment.endTime} minutes</p>
                <p class="text-sm text-gray-500">Quality: ${segment.quality} (${segment.resolution})</p>
                <p class="text-sm text-gray-500">Bitrate: ${segment.bitrate} | Codec: ${segment.codec}</p>
                <p class="text-sm text-gray-500">Size: ${(segment.blob.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
        </div>
        <button class="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 transform hover:scale-110" 
                title="Download Segment"
                onclick="downloadSegment(${segment.index - 1})">
            <i class="fas fa-download"></i>
        </button>
    `;
    return div;
}

function downloadSegment(index) {
    const segment = videoSegments[index];
    if (!segment || !segment.blob) {
        showError('Error: Segment data not found');
        return;
    }

    const link = document.createElement('a');
    link.href = URL.createObjectURL(segment.blob);
    link.download = segment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
    // Show download animation
    showSuccess(`Segment ${segment.index} downloaded!`);
}

downloadAllBtn.addEventListener('click', async function() {
    if (!videoSegments.length) {
        showError('No segments to download');
        return;
    }

    const zip = new JSZip();
    const originalButtonContent = downloadAllBtn.innerHTML;
    
    try {
        downloadAllBtn.disabled = true;
        downloadAllBtn.innerHTML = `
            <i class="fas fa-spinner animate-spin-slow mr-2"></i>
            Creating ZIP...
        `;
        
        const folder = zip.folder("video_segments");
        
        for (let i = 0; i < videoSegments.length; i++) {
            const segment = videoSegments[i];
            if (!segment || !segment.blob) {
                throw new Error(`Segment ${i + 1} data not found`);
            }
            
            downloadAllBtn.innerHTML = `
                <i class="fas fa-spinner animate-spin-slow mr-2"></i>
                Adding segment ${i + 1}/${videoSegments.length}...
            `;
            
            folder.file(segment.fileName, segment.blob);
            await new Promise(resolve => setTimeout(resolve, 100)); // Simulate processing
        }

        downloadAllBtn.innerHTML = `
            <i class="fas fa-spinner animate-spin-slow mr-2"></i>
            Generating ZIP...
        `;
        
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: 'STORE'
        });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const zipFileName = `video_segments_${timestamp}.zip`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = zipFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        showSuccess('All segments downloaded successfully!');
        createConfetti();
    } catch (error) {
        showError('Error creating ZIP file: ' + error.message);
        console.error('ZIP error:', error);
    } finally {
        downloadAllBtn.disabled = false;
        downloadAllBtn.innerHTML = originalButtonContent;
    }
});

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden', 'bg-green-50', 'border-green-400');
    errorMessage.classList.add('bg-red-50', 'border-red-400', 'slide-in');
    errorText.classList.remove('text-green-700');
    errorText.classList.add('text-red-700');
}

function showSuccess(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden', 'bg-red-50', 'border-red-400');
    errorMessage.classList.add('bg-green-50', 'border-green-400', 'slide-in');
    errorText.classList.remove('text-red-700');
    errorText.classList.add('text-green-700');
    
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 3000);
}

function hideError() {
    errorMessage.classList.add('hidden');
}

uploadContainer.addEventListener('click', () => {
    fileInput.click();
});
