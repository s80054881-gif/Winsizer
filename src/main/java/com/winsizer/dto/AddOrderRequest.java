package com.winsizer.dto;

public class AddOrderRequest {
    private String partyName;
    private Long partyId;
    private String windowType;
    private double height;
    private double width;
    private int quantity;
    private int tracks;
    private double rate;
    private String aluminumColor;
    private String glassMaterial;
    private double handlePattiInterlockReduction;
    private double bearingReduction;
    private double glassHeightReduction;
    private double glassWidthReduction;

    // Getters and Setters
    public String getPartyName() { return partyName; }
    public void setPartyName(String partyName) { this.partyName = partyName; }

    public Long getPartyId() { return partyId; }
    public void setPartyId(Long partyId) { this.partyId = partyId; }

    public String getWindowType() { return windowType; }
    public void setWindowType(String windowType) { this.windowType = windowType; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getTracks() { return tracks; }
    public void setTracks(int tracks) { this.tracks = tracks; }

    public double getRate() { return rate; }
    public void setRate(double rate) { this.rate = rate; }

    public String getAluminumColor() { return aluminumColor; }
    public void setAluminumColor(String aluminumColor) { this.aluminumColor = aluminumColor; }

    public String getGlassMaterial() { return glassMaterial; }
    public void setGlassMaterial(String glassMaterial) { this.glassMaterial = glassMaterial; }

    public double getHandlePattiInterlockReduction() { return handlePattiInterlockReduction; }
    public void setHandlePattiInterlockReduction(double handlePattiInterlockReduction) { 
        this.handlePattiInterlockReduction = handlePattiInterlockReduction; 
    }

    public double getBearingReduction() { return bearingReduction; }
    public void setBearingReduction(double bearingReduction) { this.bearingReduction = bearingReduction; }

    public double getGlassHeightReduction() { return glassHeightReduction; }
    public void setGlassHeightReduction(double glassHeightReduction) { this.glassHeightReduction = glassHeightReduction; }

    public double getGlassWidthReduction() { return glassWidthReduction; }
    public void setGlassWidthReduction(double glassWidthReduction) { this.glassWidthReduction = glassWidthReduction; }
}