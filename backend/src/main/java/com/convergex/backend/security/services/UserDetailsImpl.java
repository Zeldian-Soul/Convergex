package com.convergex.backend.security.services;
import com.convergex.backend.model.User; import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority; import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails; import java.util.*; import java.util.stream.Collectors;
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L; private Long id; private String name; private String email;
    @JsonIgnore private String password; private Collection<? extends GrantedAuthority> authorities;
    public UserDetailsImpl(Long i, String n, String e, String p, Collection<? extends GrantedAuthority> a) { id=i; name=n; email=e; password=p; authorities=a; }
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> auths = user.getRoles().stream().map(r -> new SimpleGrantedAuthority(r.getName().name())).collect(Collectors.toList());
        return new UserDetailsImpl(user.getId(), user.getName(), user.getEmail(), user.getPassword(), auths); }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    public Long getId() { return id; } public String getName() { return name; } public String getEmail() { return email; }
    @Override public String getPassword() { return password; }
    @Override public String getUsername() { return email; } // Use email as username
    @Override public boolean isAccountNonExpired() { return true; } @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; } @Override public boolean isEnabled() { return true; }
    @Override public boolean equals(Object o) { if(this==o) return true; if(o==null||getClass()!=o.getClass()) return false; UserDetailsImpl u=(UserDetailsImpl) o; return Objects.equals(id, u.id); }
}