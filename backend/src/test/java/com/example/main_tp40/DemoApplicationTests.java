package com.example.main_tp40;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {

    @Autowired
    private com.example.main_tp40.service.DashboardDataService service;

    @Test
    void contextLoads() {
    }

    @Test
    public void runDustFetch() throws Exception {
        service.fetchDustData();
    }

    @Test
    public void runPollenFetch() throws Exception {
        service.fetchPollenData();
    }
}
