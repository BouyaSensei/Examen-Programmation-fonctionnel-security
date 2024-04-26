-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
-- Host: 127.0.0.1
-- Generated: Sat, 27 Apr 2024 at 00:53
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET
    SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET
    time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- Database: `store`

-- --------------------------------------------------------

-- Table structure for `product`

CREATE TABLE `product`
(
    `ID`          int(11)      NOT NULL,
    `Label`       varchar(255) NOT NULL,
    `Description` varchar(255) NOT NULL,
    `Images`      varchar(255) NOT NULL,
    `Price`       int(11)      NOT NULL,
    `Category`    varchar(255) NOT NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = latin1
  COLLATE = latin1_swedish_ci;

-- Indexes for dumped tables

-- Indexes for table `product`
ALTER TABLE `product`
    ADD PRIMARY KEY (`ID`);

-- AUTO_INCREMENT for dumped tables

-- AUTO_INCREMENT for table `product`
ALTER TABLE `product`
    MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;