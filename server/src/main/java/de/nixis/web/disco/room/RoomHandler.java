package de.nixis.web.disco.room;

/**
 *
 * @author nico.rehwaldt
 */
public interface RoomHandler<T> {

  public void handleMessage(RoomContext ctx, T message);

}