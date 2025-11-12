package com.convergex.backend.payload;
import jakarta.validation.constraints.*;
public class SignUpRequest {
    @NotBlank @Size(min = 3, max = 50) private String name;
    @NotBlank @Size(max = 100) @Email private String email;
    @NotBlank @Size(min = 6, max = 120) private String password;
    private String phoneNumber;
    private String department;
    private String yearOfStudy;
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(String yearOfStudy) { this.yearOfStudy = yearOfStudy; }
}