package com.fstm.ma.ilisi.appstreaming.model.dto;

import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotCompletionRequestDTO {

    private String provider;
    private String model;
    private Double temperature;
    private Integer maxTokens;
    private Boolean stream;
    private List<ChatbotMessageDTO> messages = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatbotMessageDTO {
        private String role;
        private String content;
    }
}

