## 14.2 Inventaire
---

Comme nous avons discutte, le fenetre de dialogue peut etre reutilise pour representer l'inventaire du personnage. Nous aurons recours aux classes `InventoryDialog` et `InventoryItemDialog` pour representer l'inventaire.

![](./resources/dialog-inventory.gif)

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `InventoryDialog` afin d'afficher et permettre au joueur de selectionner un item
> 2. A l'interieur de la methode `render` nous affichons le nom de chaque `item` a l'aide d'un simple boucle

### `InventoryDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public class InventoryDialog extends Dialog {

    public static final String NO_ITEM_TEXT = "No items";    
    private Inventory inventory;

    public InventoryDialog() {
        super();        
    }

    public void open(Inventory inventory)
    {
        open();
        this.inventory = inventory;
    }

    @Override
    public void render(
        SpriteBatch spriteBatch,        
        Vector2 position)
    {
        if(!enabled) return;

        super.render(spriteBatch, camera, position);

        Vector2 startPosition = new Vector2(
            position.x + (MARGIN + ICON_SIZE/2),
            position.y + (HEIGHT - MARGIN)
        );

        if(inventory.items.isEmpty())
        {
            spriteBatch.begin();
            font.draw(
                spriteBatch,
                NO_ITEM_TEXT,
                startPosition.x,
                startPosition.y,
                (WIDTH - MARGIN * 2),
                Align.left,
                true);

            spriteBatch.end();
            return;
        }

        for(int i = 0; i < MAX_VISIBLE_ITEMS; i++)
        {
            if(i >= inventory.items.size())
                break;

            Item item = inventory.items.get(i);

            spriteBatch.begin();    
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
        }
    }
}

```
Il n'est pas suffisant d'afficher les elements de l'inventaire. Nous voulons etre capable de les selectionner.

> ## Étapes a suivre
> ---
> 1. Chargez la texture `ui/side_arrow.png` utilise servant a la selection.
> 2. Ajoutez la methode `update` modifier `selectionIndex` servant a indiquer la selection.
> 3. A l'interieur de la methode `render` nous utilisons deux decalage afin d'afficher la selection no
>     * `firstIndexOffset` est un decalage servant a indiquer l'index du premier item a afficher
>     * Le decalage `selectedHeightOffset` calcule a partir de la valeur de `selectionIndex` indique la position du curseur


### `InventoryDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public class InventoryDialog extends Dialog {    
    // ...
    public static final int MAX_VISIBLE_ITEMS = 4;

    // AJOUT:
    // Chargement de la texture pour la selection
    private Texture selectionTexture;

    public InventoryDialog() {
        super();
        selectionTexture = new Texture("ui/arrow_side.png");
        glyphLayout = new GlyphLayout();
    }

    public void open(Inventory inventory)
    {
        open();
        this.inventory = inventory;
    }

    // AJOUT:
    @Override
    public void update(float deltaTime)
    {
        if(!enabled) return;
        super.update(deltaTime);

        // Deplacement de la selection selon 
        // les entrees du joueur
        if(Game.hud.input.isDownJustPressed()) selectedIndex++;
        else if(Game.hud.input.isUpJustPressed()) selectedIndex--;
        else if(Game.hud.input.isInteractJustPressed())
        {
            if(inventory.getItems().size() == 0) return;
            close();
            Item item = inventory.getItems().get(selectedIndex);
            Game.hud.inventoryItemDialog.open(item);
        }
        else if(Game.hud.input.isMenuJustPressed())
        {
            close();
            return;
        }

        // Si l'objet est retire de l'inventaire, 
        // et ceci invalide l'index, nous bornons l'index      
        if(selectedIndex >= inventory.getItems().size())
            selectedIndex = inventory.getItems().size() - 1;
        else if(selectedIndex < 0)
            selectedIndex = 0;

    }

    @Override
    public void render(
        SpriteBatch spriteBatch,
        Vector2 position)
    {
        // ...
        
        // AJOUT:
        // Decalage de la position calcule a partir de la valeur de `selectedIndex`    
        float selectedOffsetHeight = 0;

        // AJOUT
        // Decalage de l'index servant a indique le debut de la liste
        // Ce mecanisme permet ainsi d'afficher une liste defilante        
        int firstIndexOffset = 
            selectedIndex < MAX_VISIBLE_ITEMS ? 
                0 : 
                selectedIndex - (MAX_VISIBLE_ITEMS - 1);

        // MODIF:
        for(
            int i = firstIndexOffset; 
            i < firstIndexOffset + MAX_VISIBLE_ITEMS; 
            i++)
        // for(int i = 0; < MAX_VISIBLE_ITEMS; i++)
        {
            if(i >= inventory.getItems().size())
                break;

            Item item = inventory.getItems().get(i);

            spriteBatch.begin();
            font.draw(
                spriteBatch,
                item.name,
                startPosition.x,
                startPosition.y - offsetHeight,
                (WIDTH - MARGIN * 2),
                Align.left,
                true);            
            spriteBatch.end();
            
            glyphLayout.setText(font, item.name);
            offsetHeight += glyphLayout.height*2;
            // AJOUT:
            if(i < selectedIndex) selectedOffsetHeight += glyphLayout.height*2;
        }

        // AJOUT:
        // Affichage du curseur de selection
        Vector2 selectedPosition = new Vector2(
            startPosition.x,
            startPosition.y - selectedOffsetHeight
        );
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

![](./resources/dialog-select.gif)