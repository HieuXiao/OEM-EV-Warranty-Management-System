package com.mega.warrantymanagementsystem.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mega.warrantymanagementsystem.entity.entity.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity// đánh dấu đây là 1 thực thể (entity)
@Table(name = "roles")// tên bảng trong DB
@Data// tự động sinh getter setter
@NoArgsConstructor// tự động sinh constructor không tham số
@AllArgsConstructor// tự động sinh constructor có tham số
public class Role {

//    @Id// đánh dấu đây là khóa chính
//    @Column(name = "role_id", nullable = false, length = 10)
//    private String roleId;

    @Id// đánh dấu đây là khóa chính
    @Enumerated(EnumType.STRING)// lưu enum dưới dạng chuỗi
    @Column(name = "role_name", nullable = false, unique = true, length = 50)
    private RoleName roleName;

    @OneToMany(mappedBy = "role")// 1 role có nhiều account
    @JsonIgnore
    private List<Account> accounts;

}
