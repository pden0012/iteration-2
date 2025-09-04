package com.example.main_tp40.pojo;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PollenForecast {
    private int id;
    private String regionCode;
    private LocalDate forecastDate;
    private String type;
    private String indexName;
    private Integer indexValue;
    private String indexCategory;
}
