package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class TrackRemoved extends TrackOperation {

  public TrackRemoved() {
  }

  public TrackRemoved(String trackId, String user) {
    super(trackId, user);

    super.setUndo(new UndoAction(new UndoRemoveTrack(trackId)));
  }
}
