package com.example.main_tp40.controller;

import com.example.main_tp40.pojo.DashboardVO;
import com.example.main_tp40.pojo.DustTable;
import com.example.main_tp40.result.Result;
import com.example.main_tp40.service.DashboardDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @Autowired
    private DashboardDataService dashboardDataService;

    @GetMapping("/dashboard")
    public Result<DashboardVO> getDashboardInfo(String suburb) {

        return Result.success(dashboardDataService.getDashboardByLocation(suburb));
    }



}
