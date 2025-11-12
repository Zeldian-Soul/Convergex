package com.convergex.backend.payload;
import java.util.List;
public class AuthResponse {
    private String token; private String type = "Bearer"; private Long id;
    private String email; private String name; private List<String> roles;
    public AuthResponse(String t, Long i, String e, String n, List<String> r) { token=t; id=i; email=e; name=n; roles=r; }
    public String getToken(){return token;} public void setToken(String t){token=t;}
    public String getType(){return type;} public void setType(String t){type=t;}
    public Long getId(){return id;} public void setId(Long i){id=i;}
    public String getEmail(){return email;} public void setEmail(String e){email=e;}
    public String getName(){return name;} public void setName(String n){name=n;}
    public List<String> getRoles(){return roles;} public void setRoles(List<String> r){roles=r;}
}