package de.nixis.web.disco;


import static de.nixis.web.disco.AbstractRoomHandler.channelMap;
import de.nixis.web.disco.dto.ChannelJoined;
import static de.nixis.web.disco.AbstractRoomHandler.channels;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelJoin;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.Text;
import io.netty.channel.ChannelHandlerContext;
import io.netty.util.AttributeKey;

/**
 *
 * @author nico.rehwaldt
 */
public class RoomHandler extends AbstractRoomHandler {

  public static final AttributeKey<String> ROOM_ID = new AttributeKey<String>("room_id");

  @Override
  public void handleMessage(ChannelHandlerContext ctx, Base message) {

    String participant = channelMap.get(ctx.channel());

    if (message instanceof ChannelJoin) {
      ChannelJoin join = (ChannelJoin) message;

      sendAll(ctx, new Text("Participant " + join.getName() + " entered (" + (channels.size() + 1) + " in room)", null));

      channelMap.put(ctx.channel(), join.getName());
      channels.add(ctx.channel());

      send(ctx, new ChannelJoined(join.getName()));
    } else
    if (message instanceof Text) {
      Text text = (Text) message;

      text.setAuthor(participant);
      sendAll(ctx, ctx.channel(), message);
    } else
    if (message instanceof ChannelLeave) {
      channels.remove(ctx.channel());
      sendAll(ctx, new Text("Participant " + participant + " left (" + (channels.size()) + " left in room)", null));
    }
  }
}
