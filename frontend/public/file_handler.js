// Wait for everything to load before we start
document.addEventListener('DOMContentLoaded', () => {
    // Grab all the elements we'll need
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const status = document.getElementById('status');
    const fileList = document.getElementById('fileList');

    // Need these to make drag and drop work properly
    // Prevents the browser from doing its default file opening behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Add that nice blue highlight when dragging files over the drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-over');
        });
    });

    // Remove the highlight when dragging out or after dropping
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-over');
        });
    });

    // Hook up our drag & drop and click handlers
    dropZone.addEventListener('drop', handleDrop);
    // Let users click anywhere in the zone to trigger file selection
    dropZone.addEventListener('click', () => fileInput.click());

    // Handle the actual file drop
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            // Update the hidden file input with the dropped file
            fileInput.files = dt.files;
            uploadFile(file);
        }
    }

    // Handle the regular file upload form submission
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Don't actually submit the form
        const file = fileInput.files[0];
        if (file) {
            uploadFile(file);
        }
    });

    // The main upload function that handles both drag&drop and regular uploads
    async function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Create a nice visual element to show upload progress
        // This gets inserted at the top of the list
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div style="flex-grow: 1;">
                <div>${file.name}</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill"></div>
                </div>
            </div>
        `;
        fileList.insertBefore(fileItem, fileList.firstChild);
        
        // Grab the progress bar and add the pulsing animation
        const progressBar = fileItem.querySelector('.progress-bar-fill');
        fileItem.classList.add('uploading');

        try {
            // Send it to our backend
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
                onUploadProgress: (progressEvent) => {
                    // Update the progress bar as we upload
                    const percentCompleted = (progressEvent.loaded * 100) / progressEvent.total;
                    progressBar.style.width = percentCompleted + '%';
                }
            });

            if (response.ok) {
                const result = await response.json();
                showStatus('File uploaded successfully!', 'success');
                progressBar.style.width = '100%'; // Make sure it's full
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            // Show any errors that happened
            showStatus('Error uploading file: ' + error.message, 'error');
        } finally {
            // Clean up: remove the pulsing animation and reset the file input
            fileItem.classList.remove('uploading');
            fileInput.value = '';
        }
    }

    // Shows a status message that fades out after 3 seconds
    function showStatus(message, type) {
        status.textContent = message;
        status.className = type; // 'success' or 'error'
        setTimeout(() => {
            // Clean up the status after 3 seconds
            status.textContent = '';
            status.className = '';
        }, 3000);
    }
});