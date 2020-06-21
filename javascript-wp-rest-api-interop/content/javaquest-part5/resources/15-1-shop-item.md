# 15. Magasin
> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

Bien entendu, il n'est pas suffisant d'initialiser l'inventaire du joueur avec des objets par default. Nous voulons permettre au joueur d'obtenir des objets a travers le jeu.

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `PhysicalItem` qui represente un objet qui existe dans le monde physique
> 2. Ajoutez la variable `cost` a la classe `Item` afin de permettre la vente de *item* dans un magasin.
> 3. Ajoutez la classe `PhysicalItemDialog` permettant d'interragir avec un objet du monde.
> 4. Incorporez `PhysicalItemDialog` dans le tableau de bord `HUD`

### `PhysicalItem`
```java
package com.tutorialquest.entities;
// import ...

public class PhysicalItem extends PhysicalObject implements IInteractible {

    public static int WIDTH = 16;
    public static int HEIGHT = 16;

    public Item item;
    private Sprite sprite = null;
    public boolean isShopItem = false;

    protected Sprite getSprite() {
        return sprite;
    }

    public PhysicalItem(
        Vector2 position,
        Item item)
    {
        super(position);

        this.item = item;
        sprite = new Sprite(item.texturePath, WIDTH, HEIGHT, 0, 0);
        collider = new Collider(
            new Vector2(WIDTH, HEIGHT),
            Collider.FLAG_INTERACTIBLE | Collider.FLAG_COLLIDABLE | Collider.FLAG_PUSHABLE);
    }

    public PhysicalItem(
        Vector2 position,
        String name,
        String type,
        String texturePath,
        boolean isShopItem,
        float cost,
        MapProperties properties) {

        super(position);

        this.isShopItem = isShopItem;
        item = new Item(name, texturePath, type, cost, properties);
        sprite = new Sprite(texturePath, WIDTH, HEIGHT, 0, 0);
        collider = new Collider(
            new Vector2(WIDTH, HEIGHT),
            Collider.FLAG_INTERACTIBLE | Collider.FLAG_COLLIDABLE | Collider.FLAG_PUSHABLE);
    }

    @Override
    public void update(float deltaTime)
    {
        super.update(deltaTime);
        move();
        sprite.update(deltaTime);
    }

    @Override
    public void render(SpriteBatch spriteBatch)
    {
        super.render(spriteBatch);
        sprite.render(spriteBatch, position);
    }

    @Override
    public void interact(Avatar avatar) {
        Game.hud.physicalItemDialog.open(this, isShopItem);
    }
}
```

### `Item.java`
```java
package com.tutorialquest;
// import ...

public class Item {

    public float cost;
    // AJOUT
    public String texturePath = "";

    public Item(
        String name,        
        String type,
        MapProperties properties,
        // AJOUT:
        float cost,        
        String texturePath)
    {               
        // AJOUT:
        this.cost = cost;    
    }   
}
```

### `PhysicalItemDialog.java`
```java
package com.tutorialquest.ui.dialogs;
// import ...

public class PhysicalItemDialog extends ItemDialog {

    public static final String TAKE_TEXT = "Take";
    public static final String LEAVE_TEXT = "Leave";
    public static final String PURCHASE_TEXT = "Purchase";
    public static final String ITEM_FOR_SALE_TEXT = "%s - %.2f$";

    private PhysicalItem physicalItem;
    private boolean isShopItem = false;

    public void open(PhysicalItem physicalItem, boolean isShopItem)
    {
        this.physicalItem = physicalItem;
        this.isShopItem = isShopItem;
        open(physicalItem.item);
    }


    public boolean isAvailable()
    {
        return
            !isShopItem ||
            Game.level.avatar.hasEnoughMoney(item);
    }

    public void acceptItem()
    {
        Game.level.remove(physicalItem);
        if(isShopItem) Game.level.avatar.purchaseItem(item);
        else Game.level.avatar.inventory.add(item);
    }


    @Override
    protected String getAcceptText() {
        return isShopItem ?
            PURCHASE_TEXT :
            TAKE_TEXT;
    }

    @Override
    protected String getCancelText() {
        return LEAVE_TEXT;
    }

    @Override
    protected String getItemText() {
        return isShopItem ?
            Compatibility.platform.format(ITEM_FOR_SALE_TEXT, item.name, item.cost):
            Compatibility.platform.format(ITEM_TEXT, item.name);
    }
}

```

> ## Étapes a suivre
> ---
> 1. Ouvrez le niveau `shop.tmx` et observez l'utilisation de `PhysicalItem`
> 2. Chaque `PhysicalItem` doit specifier
>     * Un type `ItemType`
>     * Un chemin de fichier `Sprite` pour la texture
>     * Un boolean `IsShopItem` pour determiner si l'item est vendu en magasin
>     * Un cout `cost` pour determiner la valeur en magasin.
> 3. Ajoutez la code necessaire a la creation de `PhysicalItem` dans la classe `Level`

![](./resources/shop-item.png)

```java
package com.tutorialquest;
// import ...

public class Level {
    
    // ...

    // AJOUT:
    public static final String OBJECT_ITEM = "Item";
    public static final String OBJECT_PROP_ITEM_TYPE = "ItemType";
    public static final String OBJECT_PROP_ITEM_SPRITE = "Sprite";
    public static final String OBJECT_PROP_ITEM_COST = "Cost";
    public static final String OBJECT_PROP_ITEM_IS_SHOP_ITEM = "IsShopItem";
    public static final String OBJECT_PROP_ITEM_VALUE = "Value";


    public load(String tilemapPath) { 
        // ...

        for (MapLayer layer : tiledMap.getLayers()) {
            switch (layer.getName()) {
                // ...                
                case LAYER_OBJECT:
                    for (int i = 0; i < layer.getObjects().getCount(); i++) {
                        // ...
                        switch (object.getProperties().get(OBJECT_PROP_TYPE, String.class)) {

                            // AJOUT:
                            case OBJECT_ITEM:
                                add(new PhysicalItem(
                                    new Vector2(
                                        object.getProperties().get(OBJECT_PROP_X, float.class),
                                        object.getProperties().get(OBJECT_PROP_Y, float.class)),
                                    object.getName(),
                                    object.getProperties().get(OBJECT_PROP_ITEM_TYPE, String.class),
                                    object.getProperties().get(OBJECT_PROP_ITEM_SPRITE, String.class),
                                    object.getProperties().get(OBJECT_PROP_ITEM_IS_SHOP_ITEM, Boolean.class),
                                    object.getProperties().get(OBJECT_PROP_ITEM_COST, Float.class),
                                    object.getProperties()));

                                break;
                        }
                    }
                    break;
            }
        }
    }
}

```

![](./resources/buying-from-the-shop.gif)