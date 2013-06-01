package de.nixis.web.disco;

import java.util.logging.Logger;
import de.nixis.web.disco.json.PojoDecoder;
import de.nixis.web.disco.json.PojoEncoder;
import de.nixis.web.disco.ws.DefaultRoomHandler;
import de.nixis.web.disco.ws.RoomAwareHandler;
import de.nixis.web.disco.ws.RoomAwareWebSocketHandler;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.Channel;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;

/**
 * A websocket server that implements
 * the silent disco backend.
 *
 * <p>
 *
 * Accepts websockets on the url <code>http://{HOST}:{PORT}/{ROOM_ID}/websocket</code>, whereas the room id
 * is the disco room a web socket connected to.
 *
 * @author nico.rehwaldt
 */
public class DiscoServer {

  private final int port;
  private final String host;

  private static Logger logger = Logger.getLogger(Main.class.getName());

  public DiscoServer(String host, int port) {
    this.host = host;
    this.port = port;
  }

  public void run() throws Exception {
    EventLoopGroup bossGroup = new NioEventLoopGroup();
    EventLoopGroup workerGroup = new NioEventLoopGroup();
    try {
      final ServerBootstrap sb = new ServerBootstrap();
      sb.group(bossGroup, workerGroup)
          .channel(NioServerSocketChannel.class)
          .childHandler(new ChannelInitializer<SocketChannel>() {
        @Override
        public void initChannel(final SocketChannel ch) throws Exception {
          ch.pipeline().addLast(
              new HttpRequestDecoder(),
              new HttpObjectAggregator(65536),
              new RoomAwareHandler.RoomIdExtractor(),
              new HttpResponseEncoder(),
              new RoomAwareWebSocketHandler("/"),
              new PojoDecoder(),
              new PojoEncoder(),
              new RoomAwareHandler(new DefaultRoomHandler()));
        }
      });

      final Channel ch = sb.bind(host, port).sync().channel();

      logger.info("silent disco backend started at http://" + host + ":" + port);

      ch.closeFuture().sync();
    } finally {
      bossGroup.shutdownGracefully();
      workerGroup.shutdownGracefully();
    }
  }
}