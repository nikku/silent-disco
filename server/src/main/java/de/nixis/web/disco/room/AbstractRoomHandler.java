package de.nixis.web.disco.room;

import io.netty.channel.Channel;

/**
 *
 * @author nico.rehwaldt
 */
public abstract class AbstractRoomHandler<T> implements RoomHandler<T> {

  protected void sendAll(RoomContext ctx, T msg) {
    sendAll(ctx, null, msg);
  }

  protected void send(RoomContext ctx, final Channel channel, final T msg) {
    ctx.executor().execute(new Runnable() {
      public void run() {
        channel.write(msg);
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

      ctx.executor().execute(new Runnable() {
        public void run() {

          channel.write(msg);
        }
      });
    }
  }

  public abstract void handleMessage(RoomContext ctx, T message);
}
