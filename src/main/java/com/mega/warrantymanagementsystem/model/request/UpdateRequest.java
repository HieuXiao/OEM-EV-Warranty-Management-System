package com.mega.warrantymanagementsystem.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor   // cần cho Jackson
@AllArgsConstructor
public class UpdateRequest {
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
