package com.mega.warrantymanagementsystem.controller;

import com.mega.warrantymanagementsystem.entity.Account;
import com.mega.warrantymanagementsystem.exception.exception.DuplicateResourceException;
import com.mega.warrantymanagementsystem.model.request.AccoutRequest;
import com.mega.warrantymanagementsystem.model.request.LoginRequest;
import com.mega.warrantymanagementsystem.model.response.AccountResponse;
import com.mega.warrantymanagementsystem.service.AccountService;
import com.mega.warrantymanagementsystem.service.TokenService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController//biểu thị đây là controller
@RequestMapping("/api/auth")//đường dẫn chung
@CrossOrigin//cho phép mọi nguồn truy cập
@SecurityRequirement(name = "api")//yêu cầu bảo mật cho tất cả các endpoint trong controller này
public class AuthController {
    @Autowired
    private AccountService accountService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<Account> register(@RequestBody AccoutRequest accoutRequest) {
        // kiểm tra trùng accountId
        if (accountService.findByAccountId(accoutRequest.getAccountId()) != null) {
            throw new DuplicateResourceException("Account ID " + accoutRequest.getAccountId() + " already exists");
        }
        // kiểm tra trùng username
        if (accountService.findByUsername(accoutRequest.getUsername()) != null) {
            throw new DuplicateResourceException("Username " + accoutRequest.getUsername() + " already exists");
        }
        // kiểm tra trùng email
        if (accountService.findByEmail(accoutRequest.getEmail()) != null) {
            throw new DuplicateResourceException("Email " + accoutRequest.getEmail() + " already exists");
        }
        Account createdAccount = accountService.createAccount(accoutRequest);
        return ResponseEntity.ok(createdAccount);
    }

    @PostMapping("/login")
    public ResponseEntity<AccountResponse> login(@RequestBody LoginRequest loginRequest) {
        AccountResponse account = accountService.login(loginRequest);
        return ResponseEntity.ok(account);
    }
}
