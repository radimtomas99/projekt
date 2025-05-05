import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Container, Row, Col, Card, Button, 
    Form, InputGroup, Alert, Spinner, Breadcrumb, ListGroup, Modal
} from 'react-bootstrap';

// Import icons (using react-bootstrap-icons for example)
// You might need to install it: npm install react-bootstrap-icons
import { FolderFill, FileEarmarkText, FileEarmarkImage, FileEarmarkPdf, QuestionCircle, Trash, BoxArrowUp, ArrowLeft } from 'react-bootstrap-icons';

const FileSystemPage = ({ userId }) => {
    const [folders, setFolders] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(null); // null means root folder view
    const [currentFolderName, setCurrentFolderName] = useState('My Folders');
    const [files, setFiles] = useState([]);
    const [newFolderName, setNewFolderName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isLoadingFolders, setIsLoadingFolders] = useState(false);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null); // Track which item is being deleted (folderId or fileId)
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null); // Ref for file input

    const [viewingFile, setViewingFile] = useState(null); // { fileId: ..., fileName: ..., fileType: ... }
    const [fileContent, setFileContent] = useState(null);
    const [fileContentLoading, setFileContentLoading] = useState(false);
    const [fileContentError, setFileContentError] = useState(null);

    const API_BASE = '/api/filesystem'; // Base API path

    // Fetch Folders
    const fetchFolders = useCallback(async () => {
        setIsLoadingFolders(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/folders?userId=${userId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load folders');
            setFolders(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoadingFolders(false);
        }
    }, [userId]);

    // Fetch Files for selected folder
    const fetchFiles = useCallback(async (folderId) => {
        setIsLoadingFiles(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/folders/${folderId}/files?userId=${userId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to load files');
            setFiles(data);
        } catch (err) {
            setError(err.message);
            setFiles([]); // Clear files on error
        } finally {
            setIsLoadingFiles(false);
        }
    }, [userId]);

    // Fetch folders on component mount
    useEffect(() => {
        fetchFolders();
    }, [fetchFolders]); // Re-fetch if userId changes (though it shouldn't in this setup)

    // Handle selecting a folder
    const handleFolderSelect = (folderId, folderName) => {
        setCurrentFolderId(folderId);
        setCurrentFolderName(folderName);
        setFiles([]); // Clear previous files
        fetchFiles(folderId);
    };

    // Handle going back to root folder view
    const handleGoToRoot = () => {
        setCurrentFolderId(null);
        setCurrentFolderName('My Folders');
        setFiles([]);
        // Optionally re-fetch folders if needed: fetchFolders(); 
    };

    // Handle Creating a Folder
    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        setIsCreatingFolder(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE}/folders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ folderName: newFolderName, userId: userId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create folder');
            setFolders([...folders, data]); // Add new folder to list
            setNewFolderName(''); // Clear input
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreatingFolder(false);
        }
    };

    // Handle File Selection for Upload
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    // Handle Uploading a File
    const handleUploadFile = async () => {
        if (!selectedFile || !currentFolderId) return; // Must have file and be in a folder
        setIsUploadingFile(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('userId', userId);

        try {
            const response = await fetch(`${API_BASE}/folders/${currentFolderId}/files`, {
                method: 'POST',
                body: formData, // Use FormData for multipart upload
                // Content-Type is set automatically by browser for FormData
            });
             // Check content type before parsing JSON
            const contentType = response.headers.get("content-type");
            let data;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                 data = await response.json();
            } else {
                 const textData = await response.text();
                 throw new Error(textData || `Upload failed with status: ${response.status}`);
            }

            if (!response.ok) throw new Error(data.message || 'File upload failed');
            
            setFiles([...files, data]); // Add uploaded file to list
            setSelectedFile(null); // Clear selection
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input field
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploadingFile(false);
        }
    };
    
    // Get File Icon Component using react-bootstrap-icons
    const GetFileIcon = ({ fileType }) => {
        const iconSize = 30; // Adjust size as needed
        if (fileType.startsWith('image/')) return <FileEarmarkImage size={iconSize} className="mb-2" />;
        if (fileType === 'application/pdf') return <FileEarmarkPdf size={iconSize} className="mb-2" />;
        if (fileType === 'text/plain') return <FileEarmarkText size={iconSize} className="mb-2" />;
        return <QuestionCircle size={iconSize} className="mb-2" />;
    };

    // --- Delete Folder Handler ---
    const handleDeleteFolder = async (folderIdToDelete, folderNameToDelete) => {
        if (isDeleting === folderIdToDelete) return; // Prevent double clicks

        if (window.confirm(`Are you sure you want to delete the folder "${folderNameToDelete}" and all its contents? This cannot be undone.`)) {
            setIsDeleting(folderIdToDelete);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/folders/${folderIdToDelete}?userId=${userId}`, {
                    method: 'DELETE'
                });
                const data = await response.json(); // Assume backend sends JSON even on error
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to delete folder');
                }
                // Remove folder from state
                setFolders(folders.filter(f => f.folderId !== folderIdToDelete));
                alert(`Folder "${folderNameToDelete}" deleted successfully.`); // Simple feedback
            } catch (err) {
                setError(err.message);
            } finally {
                setIsDeleting(null); // Reset deleting state
            }
        }
    };

    // --- Delete File Handler ---
    const handleDeleteFile = async (fileIdToDelete, fileNameToDelete) => {
        if (isDeleting === fileIdToDelete) return; // Prevent double clicks

        if (window.confirm(`Are you sure you want to delete the file "${fileNameToDelete}"? This cannot be undone.`)) {
            setIsDeleting(fileIdToDelete);
            setError(null);
            try {
                const response = await fetch(`${API_BASE}/files/${fileIdToDelete}?userId=${userId}`, {
                    method: 'DELETE'
                });
                 const data = await response.json(); // Assume backend sends JSON even on error
                if (!response.ok) {
                     throw new Error(data.message || 'Failed to delete file');
                }
                // Remove file from state
                setFiles(files.filter(f => f.fileId !== fileIdToDelete));
                 alert(`File "${fileNameToDelete}" deleted successfully.`); // Simple feedback
            } catch (err) {
                setError(err.message);
            } finally {
                setIsDeleting(null); // Reset deleting state
            }
        }
    };

    // --- File Viewer Functions ---
    const handleFileClick = (file) => {
        console.log("Opening file viewer for:", file);
        setViewingFile(file);
        // Reset previous content state
        setFileContent(null);
        setFileContentLoading(false);
        setFileContentError(null);

        // Fetch content immediately if it's a text file
        if (file.fileType === 'text/plain') {
            fetchTextFileContent(file.fileId);
        }
    };

    const handleCloseViewer = () => {
        console.log("Closing file viewer");
        setViewingFile(null);
         // Reset content state on close
        setFileContent(null);
        setFileContentLoading(false);
        setFileContentError(null);
    };

    const fetchTextFileContent = async (fileId) => {
        setFileContentLoading(true);
        setFileContentError(null);
        console.log(`Fetching text content for fileId: ${fileId}, userId: ${userId}`);
        try {
            const response = await fetch(`/api/filesystem/files/${fileId}/content?userId=${userId}`, {
                 headers: {
                     'Accept': 'text/plain', // Explicitly request text
                 }
             });
            if (!response.ok) {
                const errorData = await response.text(); // Get text error for debugging
                console.error("Error fetching text content:", response.status, errorData);
                throw new Error(`Failed to fetch file content: ${response.status}`);
            }
            const textContent = await response.text();
            setFileContent(textContent);
        } catch (err) {
            console.error("Error fetching text content:", err);
            setFileContentError(err.message || 'Could not load file content.');
        } finally {
            setFileContentLoading(false);
        }
    };
    // --- End File Viewer Functions ---

    // Construct file URL for viewer (images, pdf)
    const getFileViewerUrl = (fileId) => {
        if (!fileId || !userId) return null;
        return `/api/filesystem/files/${fileId}/content?userId=${userId}`;
    };

    // Render Full Screen Viewer if a file is being viewed
    if (viewingFile) {
        const fileUrl = getFileViewerUrl(viewingFile.fileId);
        return (
            <div className="file-viewer-fullscreen">
                <div className="file-viewer-top-bar">
                    <Button variant="light" onClick={handleCloseViewer} className="me-3">
                        <ArrowLeft size={20} /> Back
                    </Button>
                    <span className="file-viewer-filename text-truncate">{viewingFile.fileName}</span>
                </div>
                <div className="file-viewer-content">
                    {(() => {
                        switch (viewingFile.fileType) {
                            case 'image/jpeg':
                            case 'image/png':
                                return <img src={fileUrl} alt={viewingFile.fileName} className="file-viewer-image" />;
                            case 'application/pdf':
                                // Use iframe for potentially better browser compatibility and controls
                                return <iframe src={fileUrl} className="file-viewer-iframe" title={viewingFile.fileName} />;
                            case 'text/plain':
                                if (fileContentLoading) {
                                    return <div className="text-center p-5"><Spinner animation="border" /></div>;
                                }
                                if (fileContentError) {
                                    return <Alert variant="danger" className="m-3">Error loading content: {fileContentError}</Alert>;
                                }
                                return <pre className="file-viewer-text">{fileContent}</pre>;
                            default:
                                return <Alert variant="info" className="m-3">Preview not available for this file type ({viewingFile.fileType}).</Alert>;
                        }
                    })()}
                </div>
            </div>
        );
    }

    // Render Folder/File Grid View if no file is being viewed
    return (
        <Container className="py-4 mt-3">
            <Row className="justify-content-center">
                <Col xs={12} md={11} lg={10}> {/* Slightly wider column */}
                    <h2 className="text-center mb-4">My Files</h2>
                    {error && <Alert variant="danger">{error}</Alert>}

                    {/* Breadcrumb Navigation */} 
                    <Breadcrumb className="mb-4">
                        <Breadcrumb.Item onClick={handleGoToRoot} active={currentFolderId === null} style={{cursor: 'pointer'}}>
                            My Folders
                        </Breadcrumb.Item>
                        {currentFolderId !== null && (
                            <Breadcrumb.Item active>
                                {currentFolderName}
                            </Breadcrumb.Item>
                        )}
                    </Breadcrumb>

                    {/* View: Display Folders or Files in Grid */}
                    <Card className="shadow-sm border mb-4">
                        <Card.Header>{currentFolderId === null ? 'Folders' : `Files in ${currentFolderName}`}</Card.Header>
                        <Card.Body>
                            {currentFolderId === null && isLoadingFolders && (
                                <div className="text-center"><Spinner animation="border" size="sm" /> Loading Folders...</div>
                            )}
                            {currentFolderId !== null && isLoadingFiles && (
                                <div className="text-center"><Spinner animation="border" size="sm" /> Loading Files...</div>
                            )}

                            <Row xs={2} md={3} lg={4} xl={5} className="g-3"> {/* Grid Row: Adjust cols per size */} 
                                
                                {/* Display Folders */} 
                                {currentFolderId === null && !isLoadingFolders && folders.map(folder => (
                                    <Col key={folder.folderId}>
                                        <Card className="text-center h-100 folder-card position-relative">
                                             <Card.Body 
                                                className="d-flex flex-column justify-content-center align-items-center p-2 pt-3" 
                                                onClick={() => handleFolderSelect(folder.folderId, folder.folderName)} 
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <FolderFill size={40} className="mb-2 text-primary" /> 
                                                <small className="text-break mb-2">{folder.folderName}</small>
                                            </Card.Body>
                                            {/* Delete Button - absolutely positioned */}
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="position-absolute top-0 end-0 m-1 delete-button" 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.folderId, folder.folderName); }} // Stop propagation to prevent card click
                                                disabled={isDeleting === folder.folderId}
                                            >
                                                {isDeleting === folder.folderId ? <Spinner size="sm" animation="border"/> : <Trash size={14} />}
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}

                                {/* Display Files */} 
                                {currentFolderId !== null && !isLoadingFiles && files.map(file => (
                                    <Col key={file.fileId}>
                                        {/* Make the whole card clickable */}
                                        <Card 
                                            className="text-center h-100 position-relative clickable-card" // Add clickable class
                                            onClick={() => handleFileClick(file)} // Add onClick handler
                                        > 
                                            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2 pt-3">
                                                <GetFileIcon fileType={file.fileType} />
                                                <small className="text-break mb-2">{file.fileName}</small>
                                                 {/* Removed view button - whole card is clickable now */}
                                            </Card.Body>
                                            {/* Delete Button */} 
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="position-absolute top-0 end-0 m-1 delete-button" 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.fileId, file.fileName); }} // Stop propagation to prevent card click triggering modal
                                                disabled={isDeleting === file.fileId}
                                            >
                                                 {isDeleting === file.fileId ? <Spinner size="sm" animation="border"/> : <Trash size={14}/>}
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            
                            {/* Empty State Messages */}
                            {currentFolderId === null && !isLoadingFolders && folders.length === 0 && (
                                <div className="text-muted text-center p-3">No folders created yet.</div>
                            )}
                             {currentFolderId !== null && !isLoadingFiles && files.length === 0 && (
                                <div className="text-muted text-center p-3">This folder is empty.</div>
                            )}
                        </Card.Body>
                    </Card>

                    {/* Create Folder / Upload File Section */} 
                    {currentFolderId === null ? ( 
                        // --- Create Folder UI (Root View) ---
                        <Card className="shadow-sm border">
                            <Card.Header>Create New Folder</Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleCreateFolder}>
                                    <InputGroup>
                                        <Form.Control type="text" placeholder="Enter folder name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} required />
                                        <Button variant="outline-secondary" type="submit" disabled={isCreatingFolder}>
                                            {isCreatingFolder ? <Spinner as="span" animation="border" size="sm" /> : 'Create'}
                                        </Button>
                                    </InputGroup>
                                </Form>
                            </Card.Body>
                        </Card>
                    ) : (
                        // --- Upload File UI (Folder View) ---
                        <Card className="shadow-sm border">
                            <Card.Header>Upload File to {currentFolderName}</Card.Header>
                            <Card.Body>
                                <InputGroup>
                                    <Form.Control type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.txt,.jpg,.jpeg,.png" />
                                    <Button variant="outline-secondary" onClick={handleUploadFile} disabled={!selectedFile || isUploadingFile}>
                                        {isUploadingFile ? <Spinner as="span" animation="border" size="sm" /> : 'Upload'}
                                    </Button>
                                </InputGroup>
                                {selectedFile && <div className="mt-2 text-muted small">Selected: {selectedFile.name}</div>}
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

// Add CSS for clickable card
const style = document.createElement('style');
style.textContent = `
    .clickable-card {
        cursor: pointer;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    }
    .clickable-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .delete-button {
        /* Ensure delete button is clickable even with card hover effect */
        z-index: 2; 
    }
    .folder-card .delete-button, .file-card .delete-button {
         opacity: 0.7; /* Make delete less prominent initially */
         transition: opacity 0.2s ease-in-out;
    }
     .folder-card:hover .delete-button, .file-card:hover .delete-button {
         opacity: 1; /* Show delete button clearly on hover */
    }

    /* Full Screen Viewer Styles */
    .file-viewer-fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: #f8f9fa; /* Light background */
        z-index: 1050; /* Ensure it's above other content */
        display: flex;
        flex-direction: column;
    }
    .file-viewer-top-bar {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        background-color: #e9ecef; /* Slightly darker bar */
        border-bottom: 1px solid #dee2e6;
        flex-shrink: 0; /* Prevent bar from shrinking */
    }
    .file-viewer-filename {
        font-weight: 500;
        font-size: 1.1rem;
        margin-left: 1rem;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .file-viewer-content {
        flex-grow: 1; /* Allow content to fill remaining space */
        overflow: auto; /* Add scrollbars if content overflows */
        text-align: center; /* Center images/iframes initially */
        padding: 1rem; /* Add padding around content */
        display: flex; /* Use flex for centering */
        justify-content: center;
        align-items: center;
    }
    .file-viewer-image {
        max-width: 100%;
        max-height: calc(100vh - 80px); /* Adjust based on top bar height + padding */
        object-fit: contain;
        display: block; /* Remove extra space below image */
        margin: auto; /* Center image if smaller than container */
    }
    .file-viewer-iframe {
        width: 95%; /* Take most of the width */
        height: calc(100vh - 80px); /* Adjust height */
        border: none;
        display: block; /* Remove extra space */
        margin: auto; /* Center iframe */
    }
    .file-viewer-text {
        white-space: pre-wrap;
        word-break: break-all;
        text-align: left;
        max-width: 100%;
        height: 100%; /* Fill the content area */
        overflow-y: auto;
        background-color: #fff; /* White background for text */
        padding: 1rem;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
        margin: 0 auto; /* Center the pre block */
        width: 90%; /* Constrain width slightly */
    }

`;
document.head.append(style);

export default FileSystemPage; 