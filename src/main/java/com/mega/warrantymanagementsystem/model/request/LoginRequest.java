package com.mega.warrantymanagementsystem.model.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor   // cần cho Jackson
@AllArgsConstructor  // để tiện tạo object
public class LoginRequest {
    @NotEmpty
    private String accountId; // có thể là email hoặc username
    @NotEmpty
    private String password;
}
