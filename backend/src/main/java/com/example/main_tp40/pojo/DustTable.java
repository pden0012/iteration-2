package com.example.main_tp40.pojo;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DustTable {
    private int id;

    private String siteName;

    private LocalDateTime createTime;

    private String healthParameter;

    private Double averageValue;

    private String healthAdvice;
}
