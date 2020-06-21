## 14.3 Inventaire
---

La derniere etape consiste a donner un moyen au joueur d'utiliser un *item* de son inventaire. Nous aurons recours a une seconde fenetre de dialogue permettant d'interragir avec l'objet selectionne.

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `ItemDialog`
> 2. Chargez la texture `arrow_side.png` que nous avons utilisez pour l'inventaire.
> 3. A l'interieur de la methode `update` on permet au joueur d'accepter ou refuser l'interaction avec un '*item*
>     * Ce mecanisme permettre de reutiliser cette fenetre de maniere generique
> 4. A l'interieur de la methode `render`, nous calculons la position des options
>     * Selon l'option selectionnees nous affichons le curseur au bon endroit.


### `ItemDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public abstract class ItemDialog extends Dialog {

    public static final String ITEM_TEXT = "%s";

    protected Item item;
    private Texture selectionTexture;
    private boolean isAcceptSelected = false;

    protected abstract String getAcceptText();
    protected abstract String getCancelText();
    public abstract void acceptItem();

    protected String getItemText() {
        return String.Format(ITEM_TEXT, item.name);
    }

    public boolean isAvailable()
    {
        return true;
    }

    public ItemDialog() {
        super();
        selectionTexture = new Texture("ui/arrow_side.png");
    }

    public void open(Item item)
    {
        open();
        this.item = item;
        reset(getItemText());
    }

    @Override
    public void update(float deltaTime)
    {
        if(!enabled) return;

        super.update(deltaTime);

        // Selection de l'option (accepter, refuser)
        if(currentTextProgress >= currentTextLength - 1)
        {
            if(Game.hud.input.isLeftJustPressed()) isAcceptSelected = !isAcceptSelected;
            else if(Game.hud.input.isRightJustPressed()) isAcceptSelected = !isAcceptSelected;
            else if(Game.hud.input.isInteractJustPressed())
            {
                // Confirmation de l'option et interaction
                if(isAcceptSelected)
                {
                    if (isAvailable()) {
                        acceptItem();
                        close();
                    }
                }
                else close();
            }
        }
    }

    @Override
    public void render(
        SpriteBatch spriteBatch,
        Vector2 position)
    {
        if(!enabled) return;

        super.render(spriteBatch, position);

        Vector2 cancelPosition = new Vector2(
            position.x + (WIDTH*.25f - MARGIN),
            position.y + (HEIGHT/2 - MARGIN)
        );

        Vector2 acceptPosition = new Vector2(
            position.x + (WIDTH*.5f - MARGIN),
            position.y + (HEIGHT/2 - MARGIN)
        );

        // Cancel
        spriteBatch.begin();
        font.draw(
            spriteBatch,
            getCancelText(),
            cancelPosition.x,
            cancelPosition.y,
            (WIDTH - MARGIN * 2),
            Align.left,
            true);
        spriteBatch.end();

        // Accept
        spriteBatch.begin();
        font.setColor(
            isAvailable() ?
                Color.DARK_GRAY :
                Color.GRAY
                );

        font.draw(
            spriteBatch,
            getAcceptText(),
            acceptPosition.x,
            takePosition.y,
            (acceptPosition - MARGIN * 2),
            Align.left,
            true);
        font.setColor(Color.DARK_GRAY);
        spriteBatch.end();

        Vector2 selectedPosition = isAcceptSelected ? acceptPosition : cancelPosition;

        // Draw selection arrow icon
        spriteBatch.begin();
        spriteBatch.draw(
            selectionTexture,
            selectedPosition.x - ICON_SIZE,
            selectedPosition.y - (ICON_SIZE*.75f),
            ICON_SIZE,
            ICON_SIZE);
        spriteBatch.end();
    }
}
```
> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `InventoryItemDialog` qui permet l'interaction specifique avec un objet de l'inventaire
> 2. Modifiez le texte afin de differentier l'utilisation d'un *item* de type *Equipement* par rapport a un *item* de type *Consumable*
> 3. Modifiez la classe `InventoryDialog` afin de representer lorsque un *item* de type *Equipement* est equipe

### `InventoryItemDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public class InventoryItemDialog extends ItemDialog {

    public static final String USE_TEXT = "Use";
    public static final String EQUIP_TEXT = "Equip";
    public static final String UNEQUIP_TEXT = "Unequip";

    public String acceptString;

    public InventoryItemDialog() {
        super();
    }

    @Override
    protected String getCancelText()
    {
        return "Return";
    }

    @Override
    protected String getAcceptText()
    {
        return acceptString;
    }

    @Override
    public void acceptItem()
    {
        item.use(Game.level.avatar);
    }

    @Override
    public void open(Item item)
    {
        super.open(item);

        if(item.type.equals(Item.TYPE_EQUIP)) acceptString = Game.level.avatar.isEquipped(item) ? UNEQUIP_TEXT : EQUIP_TEXT;
        else acceptString = USE_TEXT;
    }
}

```

### `InventoryDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public class InventoryDialog extends Dialog {

    @Override
    public void render(
        SpriteBatch spriteBatch,
        Camera camera,
        Vector2 position)
    {
        // ...
        
        for(int i = offset; i < offset + MAX_VISIBLE_ITEMS; i++)
        {
            // ...
            spriteBatch.begin();
            // AJOUT:
            // Affichage de l'item en bleu, lorsque il est equipe
            if(Game.level.avatar.isEquipped(item)) font.setColor(Color.BLUE);
            font.draw(
                spriteBatch,
                item.name,
                startPosition.x,
                startPosition.y - offsetHeight,
                (WIDTH - MARGIN * 2),
                Align.left,
                true);

            font.setColor(Color.DARK_GRAY);
            spriteBatch.end();

            // ...
        }

        // ...
    }
}

```

![](./resources/dialog-inventory.gif)