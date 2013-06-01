package de.nixis.web.disco;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.logging.LogManager;
import io.netty.util.internal.logging.InternalLoggerFactory;
import io.netty.util.internal.logging.JdkLoggerFactory;

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

    initLogging();

    new DiscoServer(host, port).run();
  }

  private static void initLogging() {

    InputStream is = null;

    try {

      is = getLoggingConfig();

      if (is != null) {
        System.out.println("Found logging.properties file to configure from ...");
        try {
          LogManager.getLogManager().readConfiguration(is);

          // set logging to JDK logging
          InternalLoggerFactory.setDefaultFactory(new JdkLoggerFactory());
        } catch (IOException e) {
          System.err.println("Failed to initialize JDK logging: " + e.toString());
        } catch (SecurityException e) {
          System.err.println("Failed to initialize JDK logging: " + e.toString());
        }
      }
    } finally {
      if (is != null) {
        try { is.close(); } catch (IOException e) { }
      }
    }
  }

  private static InputStream getLoggingConfig() {

    try {
      return new FileInputStream("logging.properties");
    } catch (FileNotFoundException e) {}
    
    return Main.class.getClassLoader().getResourceAsStream("logging.properties");
  }
}
