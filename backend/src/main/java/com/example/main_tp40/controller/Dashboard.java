package com.example.main_tp40.controller;

import com.example.main_tp40.pojo.DashboardInfo;
import com.example.main_tp40.result.Result;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class Dashboard {



    @GetMapping("/dashboard")
    public Result<DashboardInfo> getDashboardInfo() {

        return Result.success();
    }
}
