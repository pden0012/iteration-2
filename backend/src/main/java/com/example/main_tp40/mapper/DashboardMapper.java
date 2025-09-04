package com.example.main_tp40.mapper;

import com.example.main_tp40.pojo.DustTable;

import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface DashboardMapper {

    void insertBatchDustTables(List<DustTable> dustTables);
}
