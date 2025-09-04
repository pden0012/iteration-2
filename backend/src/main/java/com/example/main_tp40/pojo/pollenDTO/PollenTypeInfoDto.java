package com.example.main_tp40.pojo.pollenDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PollenTypeInfoDto {
    @JsonProperty("code")
    private String code;
    @JsonProperty("indexInfo")
    private IndexInfoDto indexInfo;
}
