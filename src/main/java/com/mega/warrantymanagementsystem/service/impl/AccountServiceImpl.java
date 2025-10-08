package com.mega.warrantymanagementsystem.service.impl;


import com.mega.warrantymanagementsystem.entity.Account;
import com.mega.warrantymanagementsystem.entity.Role;
import com.mega.warrantymanagementsystem.entity.entity.RoleName;
import com.mega.warrantymanagementsystem.model.request.AccoutRequest;
import com.mega.warrantymanagementsystem.model.request.LoginRequest;
import com.mega.warrantymanagementsystem.model.request.UpdateRequest;
import com.mega.warrantymanagementsystem.model.response.AccountResponse;
import com.mega.warrantymanagementsystem.repository.AccountRepository;
import com.mega.warrantymanagementsystem.repository.RoleRepository;
import com.mega.warrantymanagementsystem.service.AccountService;
import com.mega.warrantymanagementsystem.service.TokenService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AccountServiceImpl implements AccountService, UserDetailsService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    TokenService tokenService;

    @Override
    public Account findByUsername(String username) {

        return accountRepository.findByUsername(username);
    }

    @Override
    public Account findByEmail(String email) {

        return accountRepository.findByEmail(email);
    }

    @Override
    public Account findByAccountId(String accountId) {

        return accountRepository.findByAccountId(accountId);
    }

    @Override
    public Account createAccount(AccoutRequest accoutRequest) {
        // Xử lý logic cho createAccount
        Account account = modelMapper.map(accoutRequest, Account.class);
        //mã hóa password

        // uppercase accountId
        account.setAccountId(account.getAccountId().toUpperCase());

        account.setPassword(passwordEncoder.encode(account.getPassword()));

        // Lấy prefix (AD, SS, ST, ES)
        String prefix = account.getAccountId().substring(0, 2);

        if (prefix == null) {
            throw new IllegalArgumentException("Role not found in database: " + prefix);
        }
        RoleName roleName;
        switch (prefix) {
            case "AD":
                roleName = RoleName.ADMIN;
                break;
            case "ST":
                roleName = RoleName.SC_STAFF;
                break;
            case "SS":
                roleName = RoleName.SC_TECHNICIAN;
                break;
            case "ES":
                roleName = RoleName.EVM_STAFF;
                break;
            default:
                throw new IllegalArgumentException("Invalid account prefix: " + prefix);
        }

        // Lấy Role từ DB dựa trên roleName
        // Dùng Optional để tránh lỗi null
        Optional<Role> optionalRole = roleRepository.findById(roleName);
        Role role;
        if (optionalRole.isPresent()) {
            role = optionalRole.get();
        } else {
            throw new IllegalArgumentException("Role not found in DB: " + roleName);
        }

        account.setRole(role);

        return accountRepository.save(account);
    }

//    @Override
//    public Account updateAccount(UpdateRequest UpdateRequest) {
//        Account account = modelMapper.map(UpdateRequest, Account.class);
//        Account existingAccount = accountRepository.findById(account.getAccountId()).orElse(null);
//        if (existingAccount != null) {
//            existingAccount.setUsername(account.getUsername());
//            existingAccount.setEmail(account.getEmail());
//            existingAccount.setGender(account.getGender());
//            existingAccount.setFullName(account.getFullName());
//            existingAccount.setPhone(account.getPhone());
//            return accountRepository.save(existingAccount);
//        }
//        return existingAccount;
//    }

    @Override
    public Account updateAccount(String accountId, UpdateRequest updateRequest) {
        Account existingAccount = accountRepository.findById(accountId).orElse(null);

        if (existingAccount != null) {
            // Cập nhật thông tin
            existingAccount.setUsername(updateRequest.getUsername());

            if (updateRequest.getPassword() != null && !updateRequest.getPassword().isEmpty()) {
                existingAccount.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
            }

            existingAccount.setFullName(updateRequest.getFullName());
            existingAccount.setGender(updateRequest.getGender());
            existingAccount.setEmail(updateRequest.getEmail());
            existingAccount.setPhone(updateRequest.getPhone());

            return accountRepository.save(existingAccount);
        } else {
            throw new IllegalArgumentException("Account not found with id: " + accountId);
        }
    }


    @Override
    public void deleteAccount(String accountId) {

        accountRepository.deleteById(accountId);
    }

    @Override
    public AccountResponse login(LoginRequest loginRequest) {
        //xử lý logic
        //xác thực tài khoản
        String inputAccountId = loginRequest.getAccountId().toUpperCase();
        Account account = accountRepository.findByAccountId(inputAccountId);
        if (account == null) {
            throw new BadCredentialsException("Invalid accountId or password");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), account.getPassword())) {
            throw new BadCredentialsException("Invalid accountId or password");
        }

        String token = tokenService.generateToken(account);//tạo token

        AccountResponse accountResponse = modelMapper.map(account, AccountResponse.class);//map
        accountResponse.setToken(token);//gán token vào response

        Role role = account.getRole();
        if (role != null) {
            // roleName là enum, lấy name() của enum
            accountResponse.setRoleName(role.getRoleName().name());
        }

        return accountResponse;
    }

    @Override
    public Account getCurrentAccount() {

        return (Account) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    @Override

    public List<Account> getAccounts() {
        List<Account> accounts = accountRepository.findAll();
        return accounts;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return accountRepository.findByUsername(username);
    }


    //cơ chế
    //B1: lấy username người dùng nhập
    //B2: tìm trong DB xem có account nào trùng với username đó không (LoadUserByUsername)
    //B3: authenticationManager => compare tk password dưới db <=> password người dùng nhập
}
