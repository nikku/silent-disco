package de.nixis.web.disco.room;

import io.netty.channel.Channel;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;

/**
 *
 * @author nico.rehwaldt
 */
public abstract class AbstractRoomHandler<T> implements RoomHandler<T> {

  protected void sendAll(RoomContext ctx, T msg) {
    sendAll(ctx, null, msg);
  }

  protected void send(final RoomContext ctx, final Channel channel, final T msg) {
    ctx.executor().execute(new Runnable() {
      
      public void run() {
        ChannelFuture future = channel.writeAndFlush(msg);

        future.addListener(new ChannelFutureListener() {

          public void operationComplete(ChannelFuture f) throws Exception {
            if (!f.isSuccess()) {
              RoomContext newCtx = ctx.forChannel(channel);
              handleWriteFailure(newCtx);
            }
          }
        });
      }
    });
  }

  protected void send(RoomContext ctx, T msg) {
    send(ctx, ctx.channel(), msg);
  }

  protected void sendAll(RoomContext ctx, Channel exclude, final T msg) {

    for (final Channel channel : ctx.channels()) {
      if (channel.equals(exclude)) {
        continue;
      }

      send(ctx, channel, msg);
    }
  }

  public abstract void handleWriteFailure(RoomContext ctx);

  public abstract void handleMessage(RoomContext ctx, T message);
}
