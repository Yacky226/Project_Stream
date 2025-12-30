package com.fstm.ma.ilisi.appstreaming.model.bo;

import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;


@Entity
@Data
@EqualsAndHashCode(callSuper = false)
public class Administrateur extends Utilisateur {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

}
