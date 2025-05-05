import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Row, Col, Card, Button, 
    Form, InputGroup, Alert, Spinner, Breadcrumb, ListGroup
} from 'react-bootstrap';

// Import icons (using react-bootstrap-icons for example)
// You might need to install it: npm install react-bootstrap-icons
import { FolderFill, FileEarmarkText, FileEarmarkImage, FileEarmarkPdf, QuestionCircle, Trash } from 'react-bootstrap-icons';

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

    const API_BASE = '/api/filesystem'; // Base API path

    // Fetch Folders
    const fetchFolders = async () => {
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
    };

    // Fetch Files for selected folder
    const fetchFiles = async (folderId) => {
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
    };

    // Fetch folders on component mount
    useEffect(() => {
        fetchFolders();
    }, [userId]); // Re-fetch if userId changes (though it shouldn't in this setup)

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
                                        <Card className="text-center h-100 position-relative">
                                            <Card.Body className="d-flex flex-column justify-content-center align-items-center p-2 pt-3">
                                                <GetFileIcon fileType={file.fileType} />
                                                <small className="text-break mb-2">{file.fileName}</small>
                                                 {/* Add download/view buttons later */}
                                            </Card.Body>
                                            {/* Delete Button */} 
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                className="position-absolute top-0 end-0 m-1 delete-button" 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFile(file.fileId, file.fileName); }}
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

export default FileSystemPage; 