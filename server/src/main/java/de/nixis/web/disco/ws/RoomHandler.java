package de.nixis.web.disco.ws;


import static de.nixis.web.disco.ws.AbstractRoomHandler.channelMap;

import de.nixis.web.disco.dto.ChannelJoined;
import static de.nixis.web.disco.ws.AbstractRoomHandler.channels;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelJoin;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ParticipantJoined;
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

      String participantName = join.getName();

      sendAll(ctx, new ParticipantJoined(participantName));

      channelMap.put(ctx.channel(), participantName);
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
