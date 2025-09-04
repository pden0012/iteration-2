package com.example.main_tp40.pojo.dustResponse;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DustResponse {
    @JsonProperty("totalRecords")
    private int totalRecords;

    @JsonProperty("records")
    private List<SiteRecord> records;
}
