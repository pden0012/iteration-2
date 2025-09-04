package com.example.main_tp40.mapper;

import com.example.main_tp40.pojo.DustTable;

import com.example.main_tp40.pojo.PollenForecast;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DashboardMapper {

    void insertBatchDustTables(List<DustTable> dustTables);

    void insertBatchPollenForecasts(List<PollenForecast> pollenForecasts);

    @Select("SELECT index_category FROM pollen_forecast WHERE forecast_date = #{date} AND type = #{type}")
    String getCategory(LocalDate date, String type);

    @Select("SELECT health_advice FROM dust_records WHERE create_time = #{lastFetchDustTime} AND site_name = #{suburb} limit 1")
    String getAdviceFromDust(LocalDateTime lastFetchDustTime, String suburb);
}
