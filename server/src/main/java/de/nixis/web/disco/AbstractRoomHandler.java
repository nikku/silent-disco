package de.nixis.web.disco;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentSkipListSet;

import de.nixis.web.disco.dto.Base;
import de.nixis.web.disco.dto.ChannelLeave;
import de.nixis.web.disco.dto.ChannelOpen;
import io.netty.channel.Channel;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.ChannelInboundMessageHandlerAdapter;

/**
 *
 * @author nico.rehwaldt
 */
public abstract class AbstractRoomHandler extends ChannelInboundMessageHandlerAdapter<Base> {

  public static enum ChannelEvent {
    OPEN, CLOSE
  }

  protected static final Map<Channel, String> channelMap = new HashMap<Channel, String>();

  protected static Set<Channel> channels = new ConcurrentSkipListSet<Channel>();

  @Override
  public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {

    if (evt == ChannelEvent.OPEN) {
      handleMessage(ctx, new ChannelOpen());
    }

    if (evt == ChannelEvent.CLOSE) {
      handleMessage(ctx, new ChannelLeave());
    }
  }

  public void messageReceived(ChannelHandlerContext ctx, Base msg) throws Exception {
    handleMessage(ctx, msg);
  }

  protected void sendAll(ChannelHandlerContext ctx, Base msg) {
    sendAll(ctx, null, msg);
  }

  protected void send(ChannelHandlerContext ctx, final Channel channel, final Base msg) {
    ctx.executor().execute(new Runnable() {
      public void run() {
        channel.write(msg);
      }
    });
  }

  protected void send(ChannelHandlerContext ctx, Base msg) {
    send(ctx, ctx.channel(), msg);
  }

  protected void sendAll(ChannelHandlerContext ctx, Channel exclude, final Base msg) {

    for (final Channel channel : channels) {
      if (channel.equals(exclude)) {
        continue;
      }

      ctx.executor().execute(new Runnable() {
        public void run() {

          channel.write(msg);
        }
      });
    }
  }

  /**
   * Handle a message in a generic way.
   *
   * @param ctx
   * @param message
   */
  public abstract void handleMessage(ChannelHandlerContext ctx, Base message);
}
