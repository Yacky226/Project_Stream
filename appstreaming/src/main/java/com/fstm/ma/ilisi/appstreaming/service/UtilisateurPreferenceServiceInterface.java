package com.fstm.ma.ilisi.appstreaming.service;

import com.fstm.ma.ilisi.appstreaming.model.dto.UpdateUserPreferencesRequestDTO;
import com.fstm.ma.ilisi.appstreaming.model.dto.UserPreferencesDTO;

public interface UtilisateurPreferenceServiceInterface {
    UserPreferencesDTO getPreferences(Long utilisateurId);
    UserPreferencesDTO updatePreferences(Long utilisateurId, UpdateUserPreferencesRequestDTO request);
}
