package com.winsizer.dto;

import lombok.Data;

@Data
public class AddOrderResponse {
    private Long id;
    private String partyName;
    private String windowType;
    private double height;
    private double width;
    private int quantity;
    private int tracks;
    private double rate;
    private String aluminumColor;
    private String glassMaterial;
    private double areaPerWindow;
    private double totalArea;
    private double totalCost;
    private double trackTopHeight;
    private double trackTopWidth;
    private double trackBottom;
    private double handlePatti;
    private double interlock;
    private double bearingBottom;
    private double glassWidth;
    private double glassHeight;
    private int glassQuantity;
}