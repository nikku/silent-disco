package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class Text extends Base {

  private String message;
  private String author;

  public Text() {
  }

  public Text(String message, String author) {
    this.message = message;
    this.author = author;
  }

  /**
   * @return the message
   */
  public String getMessage() {
    return message;
  }

  /**
   * @param message the message to set
   */
  public void setMessage(String message) {
    this.message = message;
  }

  /**
   * @return the author
   */
  public String getAuthor() {
    return author;
  }

  /**
   * @param author the author to set
   */
  public void setAuthor(String author) {
    this.author = author;
  }

}
