package com.mega.warrantymanagementsystem.service;

import com.mega.warrantymanagementsystem.entity.Customer;
import com.mega.warrantymanagementsystem.model.request.CustomerRequest;
import com.mega.warrantymanagementsystem.model.request.SearchCustomerRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface CustomerService {
    Customer findByPhone(String phone);

    Customer createCustomer(CustomerRequest customerRequest);

    Customer getCustomer(SearchCustomerRequest searchCustomerRequest);

    public List<Customer> getAllCustomer();
}
