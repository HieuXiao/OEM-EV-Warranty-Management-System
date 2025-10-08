package com.mega.warrantymanagementsystem.repository;

import com.mega.warrantymanagementsystem.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Customer findByCustomerPhone(String phone);
}
