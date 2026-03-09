package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.*;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class ProgressionLeconId implements Serializable {

    private static final long serialVersionUID = 1L;

    @Column(name = "inscription_id")
    private Long inscriptionId;

    @Column(name = "lecon_id")
    private Long leconId;

    public ProgressionLeconId() {
    }

    public ProgressionLeconId(Long inscriptionId, Long leconId) {
        this.inscriptionId = inscriptionId;
        this.leconId = leconId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ProgressionLeconId that = (ProgressionLeconId) o;

        if (inscriptionId != null ? !inscriptionId.equals(that.inscriptionId) : that.inscriptionId != null)
            return false;
        return leconId != null ? leconId.equals(that.leconId) : that.leconId == null;
    }

    @Override
    public int hashCode() {
        int result = inscriptionId != null ? inscriptionId.hashCode() : 0;
        result = 31 * result + (leconId != null ? leconId.hashCode() : 0);
        return result;
    }
}
