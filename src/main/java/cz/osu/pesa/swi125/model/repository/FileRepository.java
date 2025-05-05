package cz.osu.pesa.swi125.model.repository;

import cz.osu.pesa.swi125.model.entity.FileEntity;
import cz.osu.pesa.swi125.model.entity.Folder;
import cz.osu.pesa.swi125.model.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Integer> {

    List<FileEntity> findByFolderOrderByFileNameAsc(Folder folder);

    // Optional: Find by user directly if needed later
    // List<FileEntity> findByUserOrderByFileNameAsc(AppUser user);
} 