package cz.osu.pesa.swi125.service;

import cz.osu.pesa.swi125.model.dto.FileDto;
import cz.osu.pesa.swi125.model.dto.FolderDto;
import cz.osu.pesa.swi125.model.entity.AppUser;
import cz.osu.pesa.swi125.model.entity.FileEntity;
import cz.osu.pesa.swi125.model.entity.Folder;
import cz.osu.pesa.swi125.model.repository.AppUserRepository;
import cz.osu.pesa.swi125.model.repository.FileRepository;
import cz.osu.pesa.swi125.model.repository.FolderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.file.DirectoryNotEmptyException;
import java.nio.file.NoSuchFileException;
import java.util.Comparator;
import java.util.Optional;

@Service
public class FileSystemService {

    private static final Logger log = LoggerFactory.getLogger(FileSystemService.class);
    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final AppUserRepository userRepository;
    private final Path rootFileStorageLocation;
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "application/pdf", "text/plain", "image/jpeg", "image/png"
    );

    // Inject repositories and potentially a root storage path from properties
    public FileSystemService(FolderRepository folderRepository, 
                             FileRepository fileRepository, 
                             AppUserRepository userRepository,
                             @Value("${app.file.storage.location:userData}") String storageLocation) { // Default to userData
        this.folderRepository = folderRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.rootFileStorageLocation = Paths.get(storageLocation).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootFileStorageLocation);
            log.info("Created file storage directory: {}", this.rootFileStorageLocation);
        } catch (IOException e) {
            log.error("Could not create file storage directory: {}", this.rootFileStorageLocation, e);
            throw new RuntimeException("Could not create file storage directory.", e);
        }
    }

    private AppUser getUserByUserId(Integer userId) {
        if (userId == null) throw new IllegalArgumentException("User ID cannot be null");
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
    }

    private Folder getFolderByFolderIdAndUser(Integer folderId, AppUser user) {
        if (folderId == null) throw new IllegalArgumentException("Folder ID cannot be null");
        return folderRepository.findByFolderIdAndUser(folderId, user)
                .orElseThrow(() -> new IllegalArgumentException("Folder not found with ID: " + folderId + " for user " + user.getUserId()));
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getFolders(Integer userId) {
        AppUser user = getUserByUserId(userId);
        return folderRepository.findByUserOrderByFolderNameAsc(user)
                               .stream()
                               .map(this::convertToFolderDto)
                               .collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(String folderName, Integer userId) {
        AppUser user = getUserByUserId(userId);
        if (folderName == null || folderName.trim().isEmpty()) {
            throw new IllegalArgumentException("Folder name cannot be empty");
        }
        // Add more validation for folder name if needed (e.g., allowed characters)
        
        Folder folder = new Folder();
        folder.setFolderName(folderName.trim());
        folder.setUser(user);
        Folder savedFolder = folderRepository.save(folder);
        log.info("Created folder '{}' with ID {} for user {}", savedFolder.getFolderName(), savedFolder.getFolderId(), userId);
        return convertToFolderDto(savedFolder);
    }

    @Transactional(readOnly = true)
    public List<FileDto> getFilesInFolder(Integer folderId, Integer userId) {
        AppUser user = getUserByUserId(userId);
        Folder folder = getFolderByFolderIdAndUser(folderId, user);
        return fileRepository.findByFolderOrderByFileNameAsc(folder)
                             .stream()
                             .map(this::convertToFileDto)
                             .collect(Collectors.toList());
    }

    @Transactional
    public FileDto storeFile(MultipartFile file, Integer folderId, Integer userId) throws IOException {
        AppUser user = getUserByUserId(userId);
        Folder folder = getFolderByFolderIdAndUser(folderId, user);
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String contentType = file.getContentType();

        log.info("Attempting to store file: {}, Type: {}, Size: {}, FolderID: {}, UserID: {}", 
                 originalFilename, contentType, file.getSize(), folderId, userId);

        // Basic Validations
        if (originalFilename.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty.");
        }
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType)) {
             log.warn("Disallowed file type uploaded: {}", contentType);
            throw new IllegalArgumentException("Invalid file type: " + contentType + ". Allowed types: PDF, TXT, JPG, PNG.");
        }
         // Add file size validation if needed

        // Save metadata first to get the file ID
        FileEntity fileEntity = new FileEntity();
        fileEntity.setFileName(originalFilename);
        fileEntity.setFileType(contentType);
        fileEntity.setUser(user);
        fileEntity.setFolder(folder);
        FileEntity savedEntity = fileRepository.save(fileEntity);
        Integer fileId = savedEntity.getFileId();
        
        // Construct the final path: userData / userId / folderId / fileId.original_extension
        String fileExtension = StringUtils.getFilenameExtension(originalFilename);
        String finalFilename = fileId + (fileExtension != null ? "." + fileExtension : "");

        Path userFolder = this.rootFileStorageLocation.resolve(String.valueOf(userId));
        Path targetFolder = userFolder.resolve(String.valueOf(folderId));
        try {
            Files.createDirectories(targetFolder); // Ensure directories exist
        } catch (IOException e) {
             log.error("Could not create target directory: {}", targetFolder, e);
            // Consider rolling back the DB transaction if directory creation fails
            throw new IOException("Could not create directory structure for file storage.", e);
        }
        
        Path targetLocation = targetFolder.resolve(finalFilename);
        
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
             log.info("Successfully stored file {} to {}", finalFilename, targetLocation);
        } catch (IOException ex) {
             log.error("Could not store file {}: {}", finalFilename, ex.getMessage(), ex);
             // Consider rolling back the DB transaction if file copy fails
            throw new IOException("Could not store file " + originalFilename + ". Please try again!", ex);
        }

        return convertToFileDto(savedEntity);
    }

    // --- Delete Folder --- 
    @Transactional
    public void deleteFolder(Integer folderId, Integer userId) throws IOException {
        AppUser user = getUserByUserId(userId);
        Folder folder = getFolderByFolderIdAndUser(folderId, user);

        // Construct physical path
        Path userFolder = this.rootFileStorageLocation.resolve(String.valueOf(userId));
        Path targetFolder = userFolder.resolve(String.valueOf(folderId));

        log.warn("Attempting to delete folder: {} for user: {}", targetFolder, userId);

        // Delete physical folder recursively
        if (Files.exists(targetFolder)) {
            try {
                Files.walk(targetFolder)
                    .sorted(Comparator.reverseOrder()) // Delete files before directories
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                            log.info("Deleted physical path: {}", path);
                        } catch (IOException e) {
                            log.error("Failed to delete path: {}", path, e);
                            // Wrap in unchecked exception to stop the stream and propagate
                            throw new RuntimeException("Failed to delete path: " + path, e);
                        }
                    });
                log.info("Successfully deleted physical folder: {}", targetFolder);
            } catch (RuntimeException | IOException e) { // Catch exception from walk/delete
                 log.error("Could not delete physical folder: {}", targetFolder, e);
                throw new IOException("Could not delete folder contents on disk.", e);
            }
        }

        // Delete folder record from DB (cascades to FileEntity records)
        folderRepository.delete(folder);
         log.info("Successfully deleted folder record ID: {} for user: {}", folderId, userId);
    }

    // --- Delete File --- 
    @Transactional
    public void deleteFile(Integer fileId, Integer userId) throws IOException {
        AppUser user = getUserByUserId(userId);
        FileEntity fileEntity = getFileByIdAndUser(fileId, user);

        // Construct physical path
        Path userFolder = this.rootFileStorageLocation.resolve(String.valueOf(user.getUserId()));
        Path targetFolder = userFolder.resolve(String.valueOf(fileEntity.getFolder().getFolderId()));
        String fileExtension = StringUtils.getFilenameExtension(fileEntity.getFileName());
        String physicalFilename = fileId + (fileExtension != null ? "." + fileExtension : "");
        Path targetPath = targetFolder.resolve(physicalFilename);

         log.warn("Attempting to delete file: {} for user: {}", targetPath, userId);

        // Delete physical file
        try {
            if (Files.deleteIfExists(targetPath)) {
                 log.info("Successfully deleted physical file: {}", targetPath);
            } else {
                log.warn("Physical file not found, deleting DB record anyway: {}", targetPath);
            }
        } catch (IOException e) {
             log.error("Could not delete physical file {}: {}", targetPath, e.getMessage(), e);
            throw new IOException("Could not delete file from disk.", e);
        }

        // Delete file record from DB
        fileRepository.delete(fileEntity);
        log.info("Successfully deleted file record ID: {} for user: {}", fileId, userId);
    }

    // --- Add findFileByIdAndUser --- 
    private FileEntity getFileByIdAndUser(Integer fileId, AppUser user) {
        if (fileId == null) throw new IllegalArgumentException("File ID cannot be null");
        FileEntity file = fileRepository.findById(fileId)
             .orElseThrow(() -> new IllegalArgumentException("File not found with ID: " + fileId));
        // Verify the user owns the file (through the folder or directly if relation added)
        if (!file.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("User does not have permission to access file ID: " + fileId);
        }
        return file;
    }

    // --- Load File as Resource --- 
    public Resource loadFileAsResource(Integer fileId, Integer userId) throws MalformedURLException {
        AppUser user = getUserByUserId(userId);
        FileEntity fileEntity = getFileByIdAndUser(fileId, user);

        // Construct physical path
        Path userFolder = this.rootFileStorageLocation.resolve(String.valueOf(user.getUserId()));
        Path targetFolder = userFolder.resolve(String.valueOf(fileEntity.getFolder().getFolderId()));
        String fileExtension = StringUtils.getFilenameExtension(fileEntity.getFileName());
        String physicalFilename = fileId + (fileExtension != null ? "." + fileExtension : "");
        Path filePath = targetFolder.resolve(physicalFilename).normalize();

        log.info("Attempting to load file resource: {}", filePath);

        Resource resource = new UrlResource(filePath.toUri());
        if(resource.exists() && resource.isReadable()) {
            return resource;
        } else {
             log.error("File resource not found or not readable: {}", filePath);
            throw new RuntimeException("Could not read file: " + fileEntity.getFileName());
        }
    }

    // --- DTO Converters ---
    private FolderDto convertToFolderDto(Folder folder) {
        return new FolderDto(folder.getFolderId(), folder.getFolderName());
    }

    private FileDto convertToFileDto(FileEntity fileEntity) {
        return new FileDto(fileEntity.getFileId(), fileEntity.getFileName(), fileEntity.getFileType());
    }
} 