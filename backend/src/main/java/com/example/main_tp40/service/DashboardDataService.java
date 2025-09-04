package com.example.main_tp40.service;

import com.example.main_tp40.pojo.DashboardVO;
import com.fasterxml.jackson.core.JsonProcessingException;

public interface DashboardDataService {
    void fetchPollenData() throws JsonProcessingException;
    void fetchDustData() throws JsonProcessingException;

    DashboardVO getDashboardByLocation(String suburb);
}
