package com.mega.warrantymanagementsystem.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity//đánh dấu là 1 thực thể
@Data//tự động sinh getter setter
@Table  (name = "accounts") //tên bảng trong DB
@AllArgsConstructor//tự động sinh constructor có tham số
@NoArgsConstructor//tự động sinh constructor không tham số
public class Account implements UserDetails {
    //------------------Id của accout------------------------
    @Id
    @Pattern(
            regexp = "^(AD|ST|SS|ES)[0-9]{6}$",
            message = "ID must follow the format ADxxxxxx, STxxxxxx, SSxxxxxx, or ESxxxxxx, where xxxxxx are digits."
    )//AD000001, ST000001, SS000001, ES000001
    @Column(name = "accountId", nullable = false, length = 10, unique = true)//unique: không được trùng
    @NotEmpty(message = "ID cannot be empty!")//không được để trống
    private String accountId;

    //-------------------Username------------------------
    @Column(name = "username", nullable = false, length = 100)
    @NotEmpty(message = "Username cannot be empty!")
    private String username;

    //-------------------password------------------------
    @Column(name = "password", nullable = false, length = 100)
    @NotEmpty(message = "Password cannot be empty!")
    private String password;

    //-------------------full name------------------------
    @Column(name = "full_name", nullable = false, length = 100)
    @NotEmpty(message = "Full name cannot be empty!")
    private String fullName;

    //-------------------Giới tính------------------------
    @Column(name = "gender", nullable = false)//true = Male, false = Female
    private Boolean gender;

    //-------------------Email------------------------
    @Email
    private String email;

    //-------------------Phone------------------------
    @Pattern(
            regexp = "^(0|\\+84)(3[2-9]|5[2|6-9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$",
            message = "Phone invalid!"
    )
    @Column(name = "phone", nullable = false)
    @NotEmpty(message = "phone cannot be empty!")
    private String phone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_name", nullable = false)
    private Role role;

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        //lấy danh sách quyền của user
        List<GrantedAuthority> authorities = new ArrayList<>();//danh sách quyền
        if (role != null) {
            // Thêm prefix "ROLE_" để Spring Security nhận diện đúng
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getRoleName().name()));
            //ROLE_Admin, ROLE_SC_Staff, ROLE_SC_Technician, ROLE_EVM_Staff
        }
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }//tài khoản không hết hạn

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }//tài khoản không bị khóa

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }//mật khẩu không hết hạn

    @Override
    public boolean isEnabled() {
        return true;
    }//tài khoản được kích hoạt
}
