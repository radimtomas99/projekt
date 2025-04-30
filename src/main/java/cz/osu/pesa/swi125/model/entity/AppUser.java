package cz.osu.pesa.swi125.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@RequiredArgsConstructor
@Entity
public class AppUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;
    @NonNull
    @Column(nullable = false)
    private String username;
    @NonNull
    @Column(nullable = false)
    private String password;
    @NonNull
    @Column(nullable = false)
    @Enumerated(EnumType.ORDINAL)
    private Role role;
}
