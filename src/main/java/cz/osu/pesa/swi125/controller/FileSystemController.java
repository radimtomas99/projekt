package cz.osu.pesa.swi125.controller;

import cz.osu.pesa.swi125.model.dto.ErrorResponse;
import cz.osu.pesa.swi125.model.dto.FileDto;
import cz.osu.pesa.swi125.model.dto.FolderDto;
import cz.osu.pesa.swi125.service.FileSystemService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/filesystem")
public class FileSystemController {

    private static final Logger log = LoggerFactory.getLogger(FileSystemController.class);
    private final FileSystemService fileSystemService;

    public FileSystemController(FileSystemService fileSystemService) {
        this.fileSystemService = fileSystemService;
    }

    // Get Folders for User
    @GetMapping("/folders")
    public ResponseEntity<?> getFolders(@RequestParam Integer userId) {
        log.info("Request to get folders for userId: {}", userId);
        if (userId == null) {
            return new ResponseEntity<>(new ErrorResponse("userId parameter is required"), HttpStatus.BAD_REQUEST);
        }
        try {
            List<FolderDto> folders = fileSystemService.getFolders(userId);
            return ResponseEntity.ok(folders);
        } catch (IllegalArgumentException e) {
             log.warn("Bad request getting folders: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
             log.error("Error getting folders for userId {}: {}", userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to retrieve folders"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Create Folder for User
    @PostMapping("/folders")
    public ResponseEntity<?> createFolder(@RequestBody Map<String, Object> payload) {
        // Extract folderName and userId from payload
        String folderName = (String) payload.get("folderName");
        Integer userId = null;
        Object userIdObj = payload.get("userId");
         if (userIdObj instanceof Integer) {
             userId = (Integer) userIdObj;
         } else if (userIdObj instanceof String) {
             try {
                 userId = Integer.parseInt((String) userIdObj);
             } catch (NumberFormatException e) {
                 log.warn("Invalid userId format in create folder request: {}", userIdObj);
                 return new ResponseEntity<>(new ErrorResponse("Invalid userId format"), HttpStatus.BAD_REQUEST);
             }
         }

        log.info("Request to create folder '{}' for userId: {}", folderName, userId);
        if (userId == null || folderName == null || folderName.trim().isEmpty()) {
             return new ResponseEntity<>(new ErrorResponse("userId and folderName are required"), HttpStatus.BAD_REQUEST);
        }
        try {
            FolderDto newFolder = fileSystemService.createFolder(folderName, userId);
            return new ResponseEntity<>(newFolder, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request creating folder: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error creating folder '{}' for userId {}: {}", folderName, userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to create folder"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get Files in Folder for User
    @GetMapping("/folders/{folderId}/files")
    public ResponseEntity<?> getFiles(  @PathVariable Integer folderId, 
                                          @RequestParam Integer userId) {
        log.info("Request to get files in folderId: {} for userId: {}", folderId, userId);
        if (userId == null || folderId == null) {
             return new ResponseEntity<>(new ErrorResponse("userId and folderId parameters are required"), HttpStatus.BAD_REQUEST);
        }
        try {
            List<FileDto> files = fileSystemService.getFilesInFolder(folderId, userId);
            return ResponseEntity.ok(files);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request getting files: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error getting files in folder {} for userId {}: {}", folderId, userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to retrieve files"), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Upload File to Folder for User
    @PostMapping("/folders/{folderId}/files")
    public ResponseEntity<?> uploadFile(@PathVariable Integer folderId,
                                        @RequestParam("userId") Integer userId, 
                                        @RequestParam("file") MultipartFile file) {
        log.info("Request to upload file '{}' to folderId: {} for userId: {}", file.getOriginalFilename(), folderId, userId);
         if (userId == null || folderId == null || file.isEmpty()) {
             return new ResponseEntity<>(new ErrorResponse("userId, folderId, and file are required"), HttpStatus.BAD_REQUEST);
         }
        try {
            FileDto savedFile = fileSystemService.storeFile(file, folderId, userId);
            return new ResponseEntity<>(savedFile, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Bad request uploading file: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (IOException e) { 
            log.error("IOException uploading file '{}' for userId {}: {}", file.getOriginalFilename(), userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to store file: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Unexpected error uploading file '{}' for userId {}: {}", file.getOriginalFilename(), userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to upload file due to an unexpected error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Delete Folder Endpoint ---
    @DeleteMapping("/folders/{folderId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Integer folderId, @RequestParam Integer userId) {
        log.warn("Request to DELETE folderId: {} for userId: {}", folderId, userId);
         if (userId == null || folderId == null) {
             return new ResponseEntity<>(new ErrorResponse("userId and folderId parameters are required"), HttpStatus.BAD_REQUEST);
         }
        try {
            fileSystemService.deleteFolder(folderId, userId);
            return ResponseEntity.ok().body(Map.of("message", "Folder deleted successfully")); // Return 200 OK with message
        } catch (IllegalArgumentException e) {
            log.warn("Bad request deleting folder: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST); // Or NotFound? User choice.
        } catch (IOException e) {
            log.error("IOException deleting folder {} for userId {}: {}", folderId, userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to delete folder contents from disk: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Unexpected error deleting folder {} for userId {}: {}", folderId, userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to delete folder due to an unexpected error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Delete File Endpoint ---
    // Note: Path uses /files/{fileId} for simplicity, adjust if needed
    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<?> deleteFile(@PathVariable Integer fileId, @RequestParam Integer userId) {
         log.warn("Request to DELETE fileId: {} for userId: {}", fileId, userId);
          if (userId == null || fileId == null) {
              return new ResponseEntity<>(new ErrorResponse("userId and fileId parameters are required"), HttpStatus.BAD_REQUEST);
          }
         try {
             fileSystemService.deleteFile(fileId, userId);
             return ResponseEntity.ok().body(Map.of("message", "File deleted successfully")); // Return 200 OK with message
         } catch (IllegalArgumentException e) {
            log.warn("Bad request deleting file: {}", e.getMessage());
             return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST); // Or NotFound?
         } catch (IOException e) {
            log.error("IOException deleting file {} for userId {}: {}", fileId, userId, e.getMessage(), e);
             return new ResponseEntity<>(new ErrorResponse("Failed to delete file from disk: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
         } catch (Exception e) {
            log.error("Unexpected error deleting file {} for userId {}: {}", fileId, userId, e.getMessage(), e);
             return new ResponseEntity<>(new ErrorResponse("Failed to delete file due to an unexpected error."), HttpStatus.INTERNAL_SERVER_ERROR);
         }
    }

    // --- Get File Content Endpoint ---
    @GetMapping("/files/{fileId}/content")
    public ResponseEntity<?> getFileContent(@PathVariable Integer fileId,
                                            @RequestParam Integer userId,
                                            HttpServletRequest request) { // Inject request to determine content type
        log.info("Request to get content for fileId: {} for userId: {}", fileId, userId);
         if (userId == null || fileId == null) {
             return new ResponseEntity<>(new ErrorResponse("userId and fileId parameters are required"), HttpStatus.BAD_REQUEST);
         }
        try {
            Resource resource = fileSystemService.loadFileAsResource(fileId, userId);

            // Try to determine file's content type
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                log.warn("Could not determine file type for resource: {}", resource.getFilename());
            }

            // Fallback to the default content type if type could not be determined
            if(contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    // Optional: Add header to suggest filename for download
                    // .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"") // Suggest inline display
                    .body(resource);
                    
        } catch (IllegalArgumentException e) {
            log.warn("Bad request getting file content: {}", e.getMessage());
            return new ResponseEntity<>(new ErrorResponse(e.getMessage()), HttpStatus.BAD_REQUEST); // Could be 404 Not Found
        } catch (RuntimeException | MalformedURLException e) { // Catch RuntimeException from service (file not readable)
             log.error("Error reading file resource {} for userId {}: {}", fileId, userId, e.getMessage(), e);
             return new ResponseEntity<>(new ErrorResponse("Could not read file: " + e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (Exception e) {
            log.error("Unexpected error getting file content {} for userId {}: {}", fileId, userId, e.getMessage(), e);
            return new ResponseEntity<>(new ErrorResponse("Failed to get file content due to an unexpected error."), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

} 