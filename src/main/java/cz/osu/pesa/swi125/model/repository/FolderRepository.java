package cz.osu.pesa.swi125.model.repository;

import cz.osu.pesa.swi125.model.entity.Folder;
import cz.osu.pesa.swi125.model.entity.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Integer> {
    
    List<Folder> findByUserOrderByFolderNameAsc(AppUser user);

    Optional<Folder> findByFolderIdAndUser(Integer folderId, AppUser user);
} 