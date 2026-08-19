package com.collegebook.collegebookbackend.auth;

import com.collegebook.collegebookbackend.auth.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final UUID collegeId;
    private final String email;
    private final String passwordHash;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, UUID collegeId, String email, String passwordHash, List<String> roles) {
        this.id = id;
        this.collegeId = collegeId;
        this.email = email;
        this.passwordHash = passwordHash;
        this.authorities = roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toList());
    }

    public static UserPrincipal create(User user, List<String> roles) {
        return new UserPrincipal(
                user.getId(),
                user.getCollege() != null ? user.getCollege().getId() : null,
                user.getEmail(),
                user.getPasswordHash(),
                roles
        );
    }

    public UUID getId() {
        return id;
    }

    public UUID getCollegeId() {
        return collegeId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
