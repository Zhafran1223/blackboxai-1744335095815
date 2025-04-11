
Built by https://www.blackbox.ai

---

```markdown
# VideoSplitter

## Project Overview

VideoSplitter is a web application that allows users to upload videos and split them into segments based on custom time intervals. The application utilizes a user-friendly interface designed with Tailwind CSS for an appealing design. Users can easily drag and drop their video files, set time intervals, and preview segments before downloading, making it perfect for content creators who need to produce shorter clips from longer recordings.

## Installation

To get started with VideoSplitter, clone the repository to your local machine:

```bash
git clone <repository-url>
cd VideoSplitter
```

You can use a simple local server to run the HTML files. You can use any web server that serves static files, such as:

- Python's built-in HTTP server:
    ```bash
    python -m http.server
    ```

- Or use the `live-server` package from npm (if you have Node.js installed):
    ```bash
    npm install -g live-server
    live-server
    ```

## Usage

1. Open `index.html` in your web browser to access the main page.
2. Click on the "Split Videos" button to navigate to the split video page.
3. Drag and drop your video files into the designated area or click the "Browse Files" button.
4. Set your desired time interval for splitting the video segments.
5. Click the "Split Video" button to process the video.
6. Preview the segments generated and download them as needed.

## Features

- **Drag & Drop Upload:** Easily upload video files using drag and drop functionality. Supports popular formats like MP4, AVI, and MOV.
- **Custom Time Intervals:** Set your preferred time intervals for splitting videos into equal segments of any duration.
- **Preview Segments:** Check the generated segments before downloading to ensure they meet your requirements.

## Dependencies

The following dependencies are included in the project:

- **Tailwind CSS**: For styling the application.
- **Font Awesome**: Used for icons in the user interface.
- **JSZip**: Required for creating ZIP files for downloading split video segments.

### CDN Links in the Project

- Tailwind CSS:
    ```html
    <script src="https://cdn.tailwindcss.com"></script>
    ```

- Font Awesome:
    ```html
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    ```

- JSZip:
    ```html
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    ```

## Project Structure

```plaintext
├── index.html        # Main landing page for VideoSplitter
├── split.html        # Page where the video splitting functionality is implemented
├── js/
│   └── script.js     # JavaScript containing the logic for video processing
└── css/              # Folder for any additional styles if needed (currently not used)
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or features, feel free to submit an issue or a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Thanks to the developers of the frameworks and libraries used in this project, including Tailwind CSS, Font Awesome, and JSZip.
```