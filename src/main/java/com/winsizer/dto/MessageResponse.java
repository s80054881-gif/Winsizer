package com.winsizer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String message;
    private Boolean success;
    
    public MessageResponse(String message) {
        this.message = message;
        this.success = true;
    }
}
