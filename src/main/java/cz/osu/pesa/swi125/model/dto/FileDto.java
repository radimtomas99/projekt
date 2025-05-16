package cz.osu.pesa.swi125.model.dto;

public class FileDto {
    private Integer fileId;
    private String fileName;
    private String fileType;

    public FileDto() {}

    public FileDto(Integer fileId, String fileName, String fileType) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileType = fileType;
    }

    // Getters and Setters
    public Integer getFileId() { return fileId; }
    public void setFileId(Integer fileId) { this.fileId = fileId; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
} 