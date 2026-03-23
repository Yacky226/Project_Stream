package com.fstm.ma.ilisi.appstreaming.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotCompletionResponseDTO {

    private String content;
    private String finishReason;
    private String provider;
    private UsageDTO usage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsageDTO {
        private int promptTokens;
        private int completionTokens;
        private int totalTokens;
    }
}

