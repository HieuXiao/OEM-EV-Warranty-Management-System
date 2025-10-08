package com.mega.warrantymanagementsystem.repository;

import com.mega.warrantymanagementsystem.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Account findByUsername(String username);//find by username
    Account findByEmail(String email);//find by email
    Account findByAccountId(String accountId);//find by accountId
}
