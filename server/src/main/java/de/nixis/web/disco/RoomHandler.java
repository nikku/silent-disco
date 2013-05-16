package de.nixis.web.disco;


import static de.nixis.web.disco.AbstractRoomHandler.channels;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ChannelOpen;
import de.nixis.web.disco.dto.Text;
import io.netty.channel.ChannelHandlerContext;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomHandler extends AbstractRoomHandler {

  @Override
  public void handleMessage(ChannelHandlerContext ctx, Base message) {

    System.out.println("Receive message " + message);

    if (message instanceof ChannelOpen) {
      sendAll(ctx, new Text("Participant entered (" + (channels.size() + 1) + " in room)", null));
      channels.add(ctx.channel());
    } else
    if (message instanceof Text) {
      sendAll(ctx, ctx.channel(), message);
    } else
    if (message instanceof ChannelLeave) {
      channels.remove(ctx.channel());
      sendAll(ctx, new Text("Participant left (" + (channels.size()) + " left in room)", null));
    }
  }
}
