package com.mega.warrantymanagementsystem.service;

import com.mega.warrantymanagementsystem.entity.Account;
import com.mega.warrantymanagementsystem.model.request.AccoutRequest;
import com.mega.warrantymanagementsystem.model.request.LoginRequest;
import com.mega.warrantymanagementsystem.model.request.UpdateRequest;
import com.mega.warrantymanagementsystem.model.response.AccountResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface AccountService {
    Account findByUsername(String username);
    Account findByEmail(String email);
    Account findByAccountId(String accountId);

    Account createAccount(AccoutRequest accountRequest);
    Account updateAccount(String id,UpdateRequest updateRequest);
    void deleteAccount(String accountId);

    AccountResponse login(LoginRequest loginRequest);
    Account getCurrentAccount();

    public List<Account> getAccounts();
}
