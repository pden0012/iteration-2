package com.example.main_tp40.pojo.pollenDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class DailyInfo {
    @JsonProperty("date")
    private DateDto date;
    @JsonProperty("pollenTypeInfo")
    private List<PollenTypeInfoDto> pollenTypeInfo;
}
