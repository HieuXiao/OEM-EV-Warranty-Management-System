package com.mega.warrantymanagementsystem.model.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor   // cần cho Jackson
@AllArgsConstructor
public class SearchCustomerRequest {
    @NotEmpty(message = "Customer name must not be empty")
    private String customerPhone;
}
