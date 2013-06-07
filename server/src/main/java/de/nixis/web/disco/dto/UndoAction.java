package de.nixis.web.disco.dto;

/**
 *
 * @author nico.rehwaldt
 */
public class UndoAction {

  private String name;

  private Base message;

  public UndoAction(Base compensateOp) {

    this.name = compensateOp.getClass().getSimpleName();
    this.name = name.substring(0, 1).toLowerCase() + name.substring(1);

    // store undo as name: value to be able to send it as a message
    this.message = compensateOp;
  }

  public Base getMessage() {
    return message;
  }

  public String getName() {
    return name;
  }
}
