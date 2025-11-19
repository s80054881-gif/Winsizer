package com.winsizer.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type;
    private Long id;
    private String username;
    private String message;
    
    public LoginResponse(String token, String type, Long id, String username) {
        this.token = token;
        this.type = type;
        this.id = id;
        this.username = username;
    }
}
