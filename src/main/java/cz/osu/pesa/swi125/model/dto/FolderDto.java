package cz.osu.pesa.swi125.model.dto;

public class FolderDto {
    private Integer folderId;
    private String folderName;

    public FolderDto() {}

    public FolderDto(Integer folderId, String folderName) {
        this.folderId = folderId;
        this.folderName = folderName;
    }

    // Getters and Setters
    public Integer getFolderId() { return folderId; }
    public void setFolderId(Integer folderId) { this.folderId = folderId; }
    public String getFolderName() { return folderName; }
    public void setFolderName(String folderName) { this.folderName = folderName; }
} 