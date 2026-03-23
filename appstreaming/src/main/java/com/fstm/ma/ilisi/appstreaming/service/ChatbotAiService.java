package com.fstm.ma.ilisi.appstreaming.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatbotCompletionRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatbotCompletionResponseDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.ChatbotCompletionResponseDTO.UsageDTO;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ChatbotAiService {

    private static final String OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
    private static final String ANTHROPIC_ENDPOINT = "https://api.anthropic.com/v1/messages";
    private static final String GEMINI_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${chatbot.providers.openai.api-key:}")
    private String openAiApiKey;

    @Value("${chatbot.providers.anthropic.api-key:}")
    private String anthropicApiKey;

    @Value("${chatbot.providers.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${chatbot.providers.openai.default-model:gpt-4o-mini}")
    private String openAiDefaultModel;

    @Value("${chatbot.providers.anthropic.default-model:claude-3-5-sonnet-latest}")
    private String anthropicDefaultModel;

    @Value("${chatbot.providers.gemini.default-model:gemini-2.5-flash}")
    private String geminiDefaultModel;

    public ChatbotCompletionResponseDTO complete(ChatbotCompletionRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Chatbot request is required.");
        }

        List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages = sanitizeMessages(request.getMessages());
        if (messages.isEmpty()) {
            throw new IllegalArgumentException("At least one message is required.");
        }

        String provider = normalizeProvider(request.getProvider());
        return switch (provider) {
            case "openai" -> callOpenAi(request, messages);
            case "anthropic" -> callAnthropic(request, messages);
            case "gemini" -> callGemini(request, messages);
            default -> throw new IllegalArgumentException("Unsupported provider: " + provider);
        };
    }

    private ChatbotCompletionResponseDTO callOpenAi(
            ChatbotCompletionRequestDTO request,
            List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        if (!StringUtils.hasText(openAiApiKey)) {
            throw new IllegalStateException("OpenAI provider is not configured on backend.");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", resolveModel(request.getModel(), openAiDefaultModel));
        payload.put("temperature", resolveTemperature(request.getTemperature()));
        payload.put("max_tokens", resolveMaxTokens(request.getMaxTokens()));
        payload.put("stream", false);
        payload.set("messages", toOpenAiMessages(messages));

        HttpHeaders headers = jsonHeaders();
        headers.setBearerAuth(openAiApiKey);

        JsonNode data = executeJsonPost(OPENAI_ENDPOINT, headers, payload, "OpenAI");

        JsonNode choice = data.path("choices").isArray() && data.path("choices").size() > 0
                ? data.path("choices").get(0)
                : null;
        if (choice == null) {
            throw new IllegalStateException("OpenAI returned no choices.");
        }

        String content = choice.path("message").path("content").asText("").trim();
        if (!StringUtils.hasText(content)) {
            throw new IllegalStateException("OpenAI returned an empty message.");
        }

        String finishReason = "stop".equalsIgnoreCase(choice.path("finish_reason").asText())
                ? "stop"
                : "length";
        JsonNode usageNode = data.path("usage");
        UsageDTO usage = new UsageDTO(
                usageNode.path("prompt_tokens").asInt(0),
                usageNode.path("completion_tokens").asInt(0),
                usageNode.path("total_tokens").asInt(0));

        return new ChatbotCompletionResponseDTO(content, finishReason, "openai", usage);
    }

    private ChatbotCompletionResponseDTO callAnthropic(
            ChatbotCompletionRequestDTO request,
            List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        if (!StringUtils.hasText(anthropicApiKey)) {
            throw new IllegalStateException("Anthropic provider is not configured on backend.");
        }

        String systemPrompt = extractSystemPrompt(messages);
        ArrayNode anthropicMessages = toAnthropicMessages(messages);
        if (anthropicMessages.isEmpty()) {
            throw new IllegalStateException("Anthropic request has no user/assistant messages.");
        }

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("model", resolveModel(request.getModel(), anthropicDefaultModel));
        payload.put("temperature", resolveTemperature(request.getTemperature()));
        payload.put("max_tokens", resolveMaxTokens(request.getMaxTokens()));
        payload.set("messages", anthropicMessages);
        if (StringUtils.hasText(systemPrompt)) {
            payload.put("system", systemPrompt);
        }

        HttpHeaders headers = jsonHeaders();
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");

        JsonNode data = executeJsonPost(ANTHROPIC_ENDPOINT, headers, payload, "Anthropic");
        JsonNode firstContent = data.path("content").isArray() && data.path("content").size() > 0
                ? data.path("content").get(0)
                : null;
        if (firstContent == null) {
            throw new IllegalStateException("Anthropic returned no content.");
        }

        String content = firstContent.path("text").asText("").trim();
        if (!StringUtils.hasText(content)) {
            throw new IllegalStateException("Anthropic returned an empty message.");
        }

        String finishReason = "end_turn".equalsIgnoreCase(data.path("stop_reason").asText())
                ? "stop"
                : "length";
        JsonNode usageNode = data.path("usage");
        int promptTokens = usageNode.path("input_tokens").asInt(0);
        int completionTokens = usageNode.path("output_tokens").asInt(0);
        UsageDTO usage = new UsageDTO(promptTokens, completionTokens, promptTokens + completionTokens);

        return new ChatbotCompletionResponseDTO(content, finishReason, "anthropic", usage);
    }

    private ChatbotCompletionResponseDTO callGemini(
            ChatbotCompletionRequestDTO request,
            List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        if (!StringUtils.hasText(geminiApiKey)) {
            throw new IllegalStateException("Gemini provider is not configured on backend.");
        }

        String model = resolveModel(request.getModel(), geminiDefaultModel);
        String endpoint = GEMINI_ENDPOINT_BASE + "/" + model + ":generateContent?key=" + geminiApiKey;

        ObjectNode payload = objectMapper.createObjectNode();
        payload.set("contents", toGeminiMessages(messages));
        ObjectNode generationConfig = objectMapper.createObjectNode();
        generationConfig.put("temperature", resolveTemperature(request.getTemperature()));
        generationConfig.put("maxOutputTokens", resolveMaxTokens(request.getMaxTokens()));
        payload.set("generationConfig", generationConfig);

        JsonNode data = executeJsonPost(endpoint, jsonHeaders(), payload, "Gemini");
        JsonNode firstCandidate = data.path("candidates").isArray() && data.path("candidates").size() > 0
                ? data.path("candidates").get(0)
                : null;
        if (firstCandidate == null) {
            throw new IllegalStateException("Gemini returned no candidates.");
        }

        JsonNode firstPart =
                firstCandidate.path("content").path("parts").isArray()
                                && firstCandidate.path("content").path("parts").size() > 0
                        ? firstCandidate.path("content").path("parts").get(0)
                        : null;
        if (firstPart == null) {
            throw new IllegalStateException("Gemini returned no content.");
        }

        String content = firstPart.path("text").asText("").trim();
        if (!StringUtils.hasText(content)) {
            throw new IllegalStateException("Gemini returned an empty message.");
        }

        String finishReason = "STOP".equalsIgnoreCase(firstCandidate.path("finishReason").asText())
                ? "stop"
                : "length";
        JsonNode usageNode = data.path("usageMetadata");
        UsageDTO usage = new UsageDTO(
                usageNode.path("promptTokenCount").asInt(0),
                usageNode.path("candidatesTokenCount").asInt(0),
                usageNode.path("totalTokenCount").asInt(0));

        return new ChatbotCompletionResponseDTO(content, finishReason, "gemini", usage);
    }

    private JsonNode executeJsonPost(String url, HttpHeaders headers, Object payload, String providerLabel) {
        try {
            String requestBody = objectMapper.writeValueAsString(payload);
            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(requestBody, headers), String.class);
            String body = response.getBody();
            if (!StringUtils.hasText(body)) {
                throw new IllegalStateException(providerLabel + " response body is empty.");
            }
            return objectMapper.readTree(body);
        } catch (HttpStatusCodeException ex) {
            String details = extractProviderError(ex.getResponseBodyAsString());
            throw new IllegalStateException(
                    providerLabel + " API error " + ex.getStatusCode().value() + ": " + details);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException(providerLabel + " API call failed: " + ex.getMessage(), ex);
        }
    }

    private ArrayNode toOpenAiMessages(List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        ArrayNode result = objectMapper.createArrayNode();
        for (ChatbotCompletionRequestDTO.ChatbotMessageDTO message : messages) {
            ObjectNode item = objectMapper.createObjectNode();
            item.put("role", normalizeRole(message.getRole()));
            item.put("content", message.getContent());
            result.add(item);
        }
        return result;
    }

    private ArrayNode toAnthropicMessages(List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        ArrayNode result = objectMapper.createArrayNode();
        for (ChatbotCompletionRequestDTO.ChatbotMessageDTO message : messages) {
            String role = normalizeRole(message.getRole());
            if ("system".equals(role)) {
                continue;
            }

            ObjectNode item = objectMapper.createObjectNode();
            item.put("role", role);
            ArrayNode content = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("type", "text");
            part.put("text", message.getContent());
            content.add(part);
            item.set("content", content);
            result.add(item);
        }
        return result;
    }

    private ArrayNode toGeminiMessages(List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        ArrayNode result = objectMapper.createArrayNode();
        for (ChatbotCompletionRequestDTO.ChatbotMessageDTO message : messages) {
            String role = normalizeRole(message.getRole());
            String geminiRole = "assistant".equals(role) ? "model" : "user";
            String content = "system".equals(role) ? "[system] " + message.getContent() : message.getContent();

            ObjectNode item = objectMapper.createObjectNode();
            item.put("role", geminiRole);
            ArrayNode parts = objectMapper.createArrayNode();
            ObjectNode part = objectMapper.createObjectNode();
            part.put("text", content);
            parts.add(part);
            item.set("parts", parts);
            result.add(item);
        }
        return result;
    }

    private List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> sanitizeMessages(
            List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> result = new ArrayList<>();
        if (messages == null) {
            return result;
        }

        for (ChatbotCompletionRequestDTO.ChatbotMessageDTO message : messages) {
            if (message == null || !StringUtils.hasText(message.getContent())) {
                continue;
            }

            result.add(new ChatbotCompletionRequestDTO.ChatbotMessageDTO(
                    normalizeRole(message.getRole()), message.getContent().trim()));
        }

        return result;
    }

    private String extractSystemPrompt(List<ChatbotCompletionRequestDTO.ChatbotMessageDTO> messages) {
        StringBuilder prompt = new StringBuilder();
        for (ChatbotCompletionRequestDTO.ChatbotMessageDTO message : messages) {
            if ("system".equals(normalizeRole(message.getRole()))) {
                if (!prompt.isEmpty()) {
                    prompt.append('\n');
                }
                prompt.append(message.getContent());
            }
        }
        return prompt.toString();
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        return headers;
    }

    private String normalizeProvider(String provider) {
        if (!StringUtils.hasText(provider)) {
            return "gemini";
        }
        return provider.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRole(String role) {
        if (!StringUtils.hasText(role)) {
            return "user";
        }
        String normalized = role.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "assistant", "system", "user" -> normalized;
            default -> "user";
        };
    }

    private String resolveModel(String requestedModel, String defaultModel) {
        if (StringUtils.hasText(requestedModel)) {
            return requestedModel.trim();
        }
        return defaultModel;
    }

    private double resolveTemperature(Double temperature) {
        if (temperature == null) {
            return 0.7d;
        }
        return Math.max(0d, Math.min(2d, temperature));
    }

    private int resolveMaxTokens(Integer maxTokens) {
        if (maxTokens == null || maxTokens <= 0) {
            return 500;
        }
        return Math.min(maxTokens, 4000);
    }

    private String extractProviderError(String body) {
        if (!StringUtils.hasText(body)) {
            return "no error details";
        }

        try {
            JsonNode node = objectMapper.readTree(body);
            String message = node.path("error").path("message").asText("");
            if (!StringUtils.hasText(message)) {
                message = node.path("message").asText("");
            }
            if (!StringUtils.hasText(message)) {
                message = node.path("error").path("details").asText("");
            }
            if (StringUtils.hasText(message)) {
                return message;
            }
        } catch (Exception ignored) {
            // Ignore parsing error and fallback to raw body.
        }

        return body.length() > 300 ? body.substring(0, 300) : body;
    }
}
