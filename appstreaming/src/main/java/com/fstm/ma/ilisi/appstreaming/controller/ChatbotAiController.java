package com.fstm.ma.ilisi.appstreaming.controller;

import com.fstm.ma.ilisi.appstreaming.model.dto.ChatbotCompletionRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatbotCompletionResponseDTO;
import com.fstm.ma.ilisi.appstreaming.service.ChatbotAiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotAiController {

    private final ChatbotAiService chatbotAiService;

    @PostMapping("/completions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ChatbotCompletionResponseDTO> complete(
            @RequestBody ChatbotCompletionRequestDTO request) {
        return ResponseEntity.ok(chatbotAiService.complete(request));
    }
}

