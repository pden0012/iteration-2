package com.example.main_tp40.pojo.dustResponse;

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
public class SiteRecord {
    @JsonProperty("siteID")
    private String siteID;

    @JsonProperty("siteName")
    private String siteName;

    @JsonProperty("siteType")
    private String siteType;

    @JsonProperty("geometry")
    private Geometry geometry;

    @JsonProperty("siteHealthAdvices")
    private List<SiteHealthAdvice> siteHealthAdvices;
}
