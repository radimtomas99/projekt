package cz.osu.pesa.swi125.model.repository;

import cz.osu.pesa.swi125.model.entity.AppUser;
import org.springframework.data.repository.CrudRepository;

public interface AppUserRepository extends CrudRepository<AppUser, Integer> {
    AppUser findByUsername(String username);
    boolean existsByUsernameIgnoreCase(String username);
}
