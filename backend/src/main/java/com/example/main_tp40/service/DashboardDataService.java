package com.example.main_tp40.service;

import com.fasterxml.jackson.core.JsonProcessingException;

public interface DashboardDataService {
    void fetchPollenData();
    void fetchDustData() throws JsonProcessingException;
}
