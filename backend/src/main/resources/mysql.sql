CREATE TABLE pollen_forecast (
                                 id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                                 region_code VARCHAR(10) NOT NULL,
                                 forecast_date DATE NOT NULL,
                                 type VARCHAR(20) NOT NULL,
                                 index_name VARCHAR(100),
                                 index_value INT,
                                 index_category VARCHAR(50)
);

CREATE TABLE dust_records (

    -- Unique identifier for each record.
                              id INT NOT NULL AUTO_INCREMENT,

    -- The name of the air quality monitoring site.
                              site_name VARCHAR(255),

    -- The timestamp when the data record is valid until.
    -- TIMESTAMP is used to store date and time in a timezone-agnostic format (UTC).
                              create_time TIMESTAMP ,

    -- The type of health parameter being measured (e.g., PM2.5, NO2).
                              health_parameter VARCHAR(50),

    -- The average value of the health parameter. FLOAT is suitable for decimal values.
                              average_value FLOAT,

    -- The health advice corresponding to the measured value (e.g., 'Good', 'Moderate').
                              health_advice VARCHAR(50) ,

    -- Defines the primary key constraint on the `id` column.
                              PRIMARY KEY (`id`),

    -- Creates an index on the site_name and create_time for faster data retrieval.
                              INDEX `idx_site_time` (`site_name`, `create_time`)
);