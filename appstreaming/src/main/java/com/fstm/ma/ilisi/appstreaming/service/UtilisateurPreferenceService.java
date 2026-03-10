package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.exception.ResourceNotFoundException;
import com.fstm.ma.ilisi.appstreaming.model.bo.Utilisateur;
import com.fstm.ma.ilisi.appstreaming.model.bo.UtilisateurPreference;
import com.fstm.ma.ilisi.appstreaming.model.dto.UpdateUserPreferencesRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserPreferencesDTO;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurPreferenceRepository;
import com.fstm.ma.ilisi.appstreaming.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UtilisateurPreferenceService implements UtilisateurPreferenceServiceInterface {

    private final UtilisateurPreferenceRepository preferenceRepository;
    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurPreferenceService(UtilisateurPreferenceRepository preferenceRepository,
                                        UtilisateurRepository utilisateurRepository) {
        this.preferenceRepository = preferenceRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserPreferencesDTO getPreferences(Long utilisateurId) {
        UtilisateurPreference preference = getOrCreatePreference(utilisateurId);
        return toDTO(preference);
    }

    @Override
    public UserPreferencesDTO updatePreferences(Long utilisateurId, UpdateUserPreferencesRequestDTO request) {
        UtilisateurPreference preference = getOrCreatePreference(utilisateurId);

        if (request.getLanguage() != null) {
            preference.setLanguage(request.getLanguage().trim());
        }
        if (request.getTimezone() != null) {
            preference.setTimezone(request.getTimezone().trim());
        }
        if (request.getTheme() != null) {
            preference.setTheme(request.getTheme().trim());
        }
        if (request.getEmailNotifications() != null) {
            preference.setEmailNotifications(request.getEmailNotifications());
        }
        if (request.getPushNotifications() != null) {
            preference.setPushNotifications(request.getPushNotifications());
        }
        if (request.getMarketingEmails() != null) {
            preference.setMarketingEmails(request.getMarketingEmails());
        }
        if (request.getCourseReminders() != null) {
            preference.setCourseReminders(request.getCourseReminders());
        }
        if (request.getWeeklyDigest() != null) {
            preference.setWeeklyDigest(request.getWeeklyDigest());
        }
        if (request.getAutoplay() != null) {
            preference.setAutoplay(request.getAutoplay());
        }
        if (request.getPlaybackSpeed() != null) {
            preference.setPlaybackSpeed(request.getPlaybackSpeed());
        }
        if (request.getSubtitles() != null) {
            preference.setSubtitles(request.getSubtitles());
        }
        if (request.getQuality() != null) {
            preference.setQuality(request.getQuality().trim());
        }
        if (request.getDownloadQuality() != null) {
            preference.setDownloadQuality(request.getDownloadQuality().trim());
        }
        if (request.getShowOnlineStatus() != null) {
            preference.setShowOnlineStatus(request.getShowOnlineStatus());
        }
        if (request.getAllowProfileViews() != null) {
            preference.setAllowProfileViews(request.getAllowProfileViews());
        }
        if (request.getAllowCourseRecommendations() != null) {
            preference.setAllowCourseRecommendations(request.getAllowCourseRecommendations());
        }

        UtilisateurPreference saved = preferenceRepository.save(preference);
        return toDTO(saved);
    }

    private UtilisateurPreference getOrCreatePreference(Long utilisateurId) {
        return preferenceRepository.findByUtilisateurId(utilisateurId)
                .orElseGet(() -> createDefaultPreference(utilisateurId));
    }

    private UtilisateurPreference createDefaultPreference(Long utilisateurId) {
        Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        UtilisateurPreference preference = new UtilisateurPreference();
        preference.setUtilisateur(utilisateur);
        return preferenceRepository.save(preference);
    }

    private UserPreferencesDTO toDTO(UtilisateurPreference preference) {
        UserPreferencesDTO dto = new UserPreferencesDTO();
        dto.setLanguage(preference.getLanguage());
        dto.setTimezone(preference.getTimezone());
        dto.setTheme(preference.getTheme());
        dto.setEmailNotifications(preference.isEmailNotifications());
        dto.setPushNotifications(preference.isPushNotifications());
        dto.setMarketingEmails(preference.isMarketingEmails());
        dto.setCourseReminders(preference.isCourseReminders());
        dto.setWeeklyDigest(preference.isWeeklyDigest());
        dto.setAutoplay(preference.isAutoplay());
        dto.setPlaybackSpeed(preference.getPlaybackSpeed());
        dto.setSubtitles(preference.isSubtitles());
        dto.setQuality(preference.getQuality());
        dto.setDownloadQuality(preference.getDownloadQuality());
        dto.setShowOnlineStatus(preference.isShowOnlineStatus());
        dto.setAllowProfileViews(preference.isAllowProfileViews());
        dto.setAllowCourseRecommendations(preference.isAllowCourseRecommendations());
        return dto;
    }
}
