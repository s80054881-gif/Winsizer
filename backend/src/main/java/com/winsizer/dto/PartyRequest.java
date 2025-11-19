package com.winsizer.dto;
import lombok.Data;

@Data
    public class PartyRequest {
    private String partyName;
    private String contactNumber;
    private String partyType;
    private String gstNumber;
    private String panNumber;
    private String billingAddress;
    private String city;
    private String state;
}
