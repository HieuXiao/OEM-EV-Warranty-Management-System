package com.mega.warrantymanagementsystem.model.request;

import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor   // cần cho Jackson
@AllArgsConstructor  // để tiện tạo object
public class AccoutRequest {
    @NotEmpty(message = "ID cannot be empty!")//không được để trống
    private String accountId;

    @NotEmpty(message = "Username cannot be empty!")
    private String username;

    @NotEmpty(message = "Password cannot be empty!")
    private String password;

    @NotEmpty(message = "Full name cannot be empty!")
    private String fullName;

    //true = Male, false = Female
    private Boolean gender;

    @Email
    private String email;

    @NotEmpty(message = "phone cannot be empty!")
    private String phone;
}
