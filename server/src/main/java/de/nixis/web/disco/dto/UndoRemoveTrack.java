package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class UndoRemoveTrack extends TrackOperation {

  public UndoRemoveTrack() {
  }

  public UndoRemoveTrack(String trackId) {
    super(trackId);
  }

}
