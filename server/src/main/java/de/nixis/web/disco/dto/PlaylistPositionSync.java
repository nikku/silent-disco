package de.nixis.web.disco.dto;

import de.nixis.web.disco.db.entity.Position;

/**
 *
 * @author nico.rehwaldt
 */
public interface PlaylistPositionSync {

  /**
   * Returns updated playlist position
   * @return
   */
  public Position getPlaylistPosition();
}
