package com.winsizer.dto;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PartyResponse {
     private Long id;
    private String partyName;
    private String contactNumber;
    private String partyType;
    private String gstNumber;
    private String panNumber;
    private String billingAddress;
    private String city;
    private String state;
}
