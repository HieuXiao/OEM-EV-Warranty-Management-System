package com.mega.warrantymanagementsystem.model.request;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor   // cần cho Jackson
@AllArgsConstructor
public class CustomerRequest {

    private int customerId;

    @NotEmpty(message = "Customer name cannot be empty!")
    private String customerName;

    @Pattern(
            regexp = "^(0|\\+84)(3[2-9]|5[2|6-9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$",
            message = "Phone invalid!"
    )
    @NotEmpty(message = "phone cannot be empty!")
    private String customerPhone;

    @Email
    @NotEmpty(message = "Email cannot be empty!")
    private String customerEmail;

    @NotEmpty(message = "Address cannot be empty!")
    private String customerAddress;
}
