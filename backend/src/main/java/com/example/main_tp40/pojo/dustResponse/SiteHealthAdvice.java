package com.example.main_tp40.pojo.dustResponse;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SiteHealthAdvice {
    @JsonProperty("since")
    private ZonedDateTime since;

    @JsonProperty("until")
    private ZonedDateTime until;

    @JsonProperty("healthParameter")
    private String healthParameter;

    @JsonProperty("averageValue")
    private Double averageValue;

    @JsonProperty("unit")
    private String unit;

    @JsonProperty("healthAdvice")
    private String healthAdvice;

    @JsonProperty("healthAdviceColor")
    private String healthAdviceColor;

    @JsonProperty("healthCode")
    private String healthCode;
}
