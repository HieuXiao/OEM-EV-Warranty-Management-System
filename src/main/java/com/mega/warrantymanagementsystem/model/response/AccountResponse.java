package com.mega.warrantymanagementsystem.model.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor//tự động sinh constructor có tham số
@NoArgsConstructor//tự động sinh constructor không tham số
public class AccountResponse {
    String accountId;
    String username;
    String fullName;
    Boolean gender;
    String email;
    String phone;
    String token;

    String roleName;
}
