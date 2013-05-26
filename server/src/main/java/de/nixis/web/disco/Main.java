package de.nixis.web.disco;

/**
 *
 * @author nico.rehwaldt
 */
public class Main {

  private static String DEFAULT_HOST = "localhost";
  private static int DEFAULT_PORT = 8080;

  public static void main(String[] args) throws Exception {
    String host = null;
    int port = DEFAULT_PORT;

    if (args.length == 1 && args[0].equals("--help")) {
      System.out.println("Usage: server [host:port] \n\n    defaults: host=localhost\n    port: 8080");
    }

    if (args.length > 0) {
      String binding = args[0];
      String[] parts = binding.split(":");

      if (parts.length > 1) {
        host = parts[0];
        port = Integer.parseInt(parts[1]);
      } else {
        host = binding;
      }
    }

    if (host == null || host.isEmpty()) {
      host = DEFAULT_HOST;
    }

    new DiscoServer(host, port).run();
  }
}
