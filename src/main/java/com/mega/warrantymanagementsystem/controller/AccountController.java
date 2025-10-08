package com.mega.warrantymanagementsystem.controller;

import com.mega.warrantymanagementsystem.entity.Account;
import com.mega.warrantymanagementsystem.exception.exception.ResourceNotFoundException;
import com.mega.warrantymanagementsystem.model.request.UpdateRequest;
import com.mega.warrantymanagementsystem.service.AccountService;
import com.mega.warrantymanagementsystem.service.TokenService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController//biểu thị đây là controller
@RequestMapping("/api/accounts")//đường dẫn chung
@CrossOrigin//cho phép mọi nguồn truy cập
@SecurityRequirement(name = "api")//yêu cầu bảo mật cho tất cả các endpoint trong controller này
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/")//khi có request get đến đường dẫn /api/accounts/ thì hàm này sẽ được gọi
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAccounts());
    }

    @GetMapping("/{accountId}")//dấu {} biểu thị đây là biến
    public ResponseEntity<Account> getAccountById(@PathVariable("accountId") String accountId) {
        Account account = accountService.findByAccountId(accountId);
        if (account == null) {
            throw new ResourceNotFoundException("Account not found with ID: " + accountId);
        }
        return ResponseEntity.ok(account);
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Void> deleteAccount(@PathVariable("accountId") String accountId) {
        Account existingAccount = accountService.findByAccountId(accountId);
        if (existingAccount == null) {
            throw new ResourceNotFoundException("Account not found with ID: " + accountId);
        }
        accountService.deleteAccount(accountId);
        return ResponseEntity.noContent().build();
    }

//    @PutMapping("/{accountId}")
//    public ResponseEntity<Account> updateAccount(
//            @PathVariable("accountId") String accountId,
//            @RequestBody Account account) {
//        Account existingAccount = accountService.findByAccountId(accountId);
//        if (existingAccount == null) {
//            throw new ResourceNotFoundException("Account not found with ID: " + accountId);
//        }
//        account.setAccountId(accountId);
//        Account updatedAccount = accountService.updateAccount(account);
//        return ResponseEntity.ok(updatedAccount);
//    }

    @PutMapping("/{accountId}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable("accountId") String accountId,
            @RequestBody UpdateRequest updateRequest) {

        Account updatedAccount = accountService.updateAccount(accountId, updateRequest);
        return ResponseEntity.ok(updatedAccount);
    }

    @GetMapping("/current")//khi có request get đến đường dẫn /api/accounts/current thì hàm này sẽ được gọi
    public ResponseEntity getCurrentAccounts() {
        return ResponseEntity.ok(accountService.getCurrentAccount());
    }

}
