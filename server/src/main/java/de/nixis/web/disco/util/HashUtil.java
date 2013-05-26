package de.nixis.web.disco.util;

/**
 *
 * @author nico.rehwaldt
 */
public class HashUtil {

  public static long decode(String hash) {
    return Long.parseLong(hash, Character.MAX_RADIX);
  }
  
  public static String encode(long number) {
    return Long.toString(number, Character.MAX_RADIX);
  }
}
