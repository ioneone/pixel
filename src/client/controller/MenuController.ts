import * as PIXI from "pixi.js";
import PlayController from "./PlayController";
import Controller from "./Controller";
import { FontSize } from "../ui/Text";
import Input from "../ui/Input";
import App from "../App";
import Button from "../ui/Button";
import Color from "../Color";
import Paragraph from "../ui/Paragraph";

/**
 * View for {@link MenuController}.
 */
class MenuView extends PIXI.Container {
  private nameInput: Input;
  private playButton: Button;

  private nameText: Paragraph;
  private tutorialText: Paragraph;
  private promptText: Paragraph;

  constructor() {
    super();

    this.nameInput = new Input(10, {
      color: Color.WHITE,
      fontSize: FontSize.Medium,
      borderWidth: 1,
      borderColor: Color.WHITE,
      paddingX: 16,
      paddingY: 8,
    });

    this.playButton = new Button("PLAY", {
      fontSize: FontSize.Medium,
      color: Color.WHITE,
      borderColor: Color.WHITE,
      borderWidth: 1,
      paddingX: 16,
      paddingY: 8,
    });

    const viewportWidth = App.shared.viewport.width;
    const viewportHeight = App.shared.viewport.height;

    this.promptText = new Paragraph("Enter your name and click PLAY", {
      color: Color.WHITE,
      fontSize: FontSize.Medium,
    });
    this.promptText.x = viewportWidth / 2 - this.promptText.width / 2;
    this.promptText.y = viewportHeight / 2 + 100;

    this.tutorialText = new Paragraph(
      `[How to Play]\nW: Jump\nA: Left\nD: Right\nJ: Attack`,
      { color: Color.WHITE, fontSize: FontSize.Medium }
    );
    this.tutorialText.x = viewportWidth / 2 - this.tutorialText.width / 2;
    this.tutorialText.y = viewportHeight / 2 - 100;

    this.nameText = new Paragraph("Name", {
      color: Color.WHITE,
      fontSize: FontSize.Medium,
    });
    this.nameText.x = viewportWidth / 2 - this.nameText.width / 2;
    this.nameText.y = this.tutorialText.y - 100;

    this.nameInput.x = viewportWidth / 2 - this.nameInput.width / 2;
    this.nameInput.y = this.nameText.y + 30;

    this.playButton.x = viewportWidth / 2 - this.playButton.width / 2;
    this.playButton.y = this.promptText.y + 50;

    this.addChild(this.promptText);
    this.addChild(this.tutorialText);
    this.addChild(this.nameText);
    this.addChild(this.nameInput);
    this.addChild(this.playButton);
  }

  public getNameInput() {
    return this.nameInput;
  }

  public getPlayButton() {
    return this.playButton;
  }

  public destroy() {
    this.nameInput.destroy();
    super.destroy();
  }
}

/**
 * Prompt the player to enter their name and start the game.
 */
class MenuController extends Controller {
  private menuView: MenuView;

  private get nameInput() {
    return this.menuView.getNameInput();
  }

  private get playButton() {
    return this.menuView.getPlayButton();
  }

  constructor() {
    super();
    this.menuView = new MenuView();
    this.addChild(this.menuView);
  }

  public start() {
    this.nameInput.setFocused(true);
    this.playButton.onClick(() => {
      if (this.nameInput.getValue()) {
        App.shared.setController(new PlayController(this.nameInput.getValue()));
      }
    });
  }

  public tick() {
    this.nameInput.tick();
  }

  public destroy() {
    this.menuView.destroy();
    super.destroy();
  }
}

export default MenuController;
