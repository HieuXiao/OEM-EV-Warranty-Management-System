package com.mega.warrantymanagementsystem.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.List;

@Entity//đánh dấu là 1 thực thể
@Data//tự động sinh getter setter
@Table(name = "customers") //tên bảng trong DB
@AllArgsConstructor//tự động sinh constructor có tham số
@NoArgsConstructor
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id", nullable = false, unique = true)
    private int customerId;

    @Column(name = "customer_name", nullable = false, length = 100)
    @NotEmpty(message = "Customer name cannot be empty!")
    private String customerName;

    @Pattern(
            regexp = "^(0|\\+84)(3[2-9]|5[2|6-9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$",
            message = "Phone invalid!"
    )
    @Column(name = "customer_phone", nullable = false, length = 20)
    @NotEmpty(message = "phone cannot be empty!")
    private String customerPhone;

    @Email
    @Column(name = "customer_email", nullable = false, length = 100)
    @NotEmpty(message = "Email cannot be empty!")
    private String customerEmail;

    @Column(name = "customer_address", nullable = false, length = 200)
    @NotEmpty(message = "Address cannot be empty!")
    private String customerAddress;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Vehicle> vehicles = new ArrayList<>();
}
