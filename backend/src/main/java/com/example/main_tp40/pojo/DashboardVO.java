package com.example.main_tp40.pojo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardVO {
    public String tree;
    public String grass;
    public String ragweed;
    public String dust;
}
