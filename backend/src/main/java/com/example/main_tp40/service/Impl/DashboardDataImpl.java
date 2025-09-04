package com.example.main_tp40.service.Impl;

import com.example.main_tp40.mapper.DashboardMapper;
import com.example.main_tp40.pojo.DustTable;
import com.example.main_tp40.pojo.dustResponse.DustResponse;
import com.example.main_tp40.pojo.dustResponse.SiteHealthAdvice;
import com.example.main_tp40.service.DashboardDataService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;


@Service
@Slf4j
public class DashboardDataImpl implements DashboardDataService {

    private static LocalDateTime lastFetchDustTime;

    @Autowired
    private DashboardMapper dashboardMapper;

    @Scheduled(cron = "0 0 14 * * *") // every day at 14:00
    public void fetchPollenData() {
        String url = "https://pollen.googleapis.com/v1/forecast:lookup?key=AIzaSyCwjjPNJskf7MBFvbdoboRVvQM-tbiH6YE&days=1&location.latitude=-37.924484&location.longitude=145.128025";
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);
        System.out.println("Fetching pollen data...");

    }

    @Scheduled(cron = "0 0 14 * * *")
    public void fetchDustData() throws JsonProcessingException {

        String url = "https://gateway.api.epa.vic.gov.au/environmentMonitoring/v1/sites?environmentalSegment=air&X-API-key=aaea0f7d7ae44b82b7f7a8a2c4f7dc19";
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        RestTemplate restTemplate = new RestTemplate();
        String response = restTemplate.getForObject(url, String.class);
        DustResponse dustResponse = mapper.readValue(response, DustResponse.class);
        List<DustTable> dustTables = dustResponse.getRecords().stream()
                .filter(record -> record != null)  // Check record itself
                .filter(record -> record.getSiteHealthAdvices() != null)  // Check list exists
                .filter(record -> !record.getSiteHealthAdvices().isEmpty())  // Check list not empty
                .filter(record -> record.getSiteHealthAdvices().get(0) != null)  // Check first advice exists
                .map(record -> {
                    SiteHealthAdvice advice = record.getSiteHealthAdvices().get(0);
                    return DustTable.builder()
                            .siteName(record.getSiteName())
                            .createTime(advice.getUntil() != null ? advice.getUntil().toLocalDateTime() : LocalDateTime.now())
                            .healthParameter(advice.getHealthParameter())
                            .healthAdvice(advice.getHealthAdvice())
                            .averageValue(advice.getAverageValue())
                            .build();
                })
                .toList();
        if(dustTables.getFirst().getCreateTime().equals(lastFetchDustTime)) {
            log.info("No new dust data to fetch.");
            return;
        }
        lastFetchDustTime = dustTables.getFirst().getCreateTime();
        dashboardMapper.insertBatchDustTables(dustTables);
    }
}
