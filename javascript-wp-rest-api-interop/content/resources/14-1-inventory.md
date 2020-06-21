# 14. Inventaire
> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

Dans les jeux videos du style RPG, les *items* sont réunis dans un espace commun de l'interface utilisateur, que l'on appelle l'inventaire. L'inventaire permet au joueur d'interagir avec le *items* de sa collection. Par exemple, il peut equiper un arme, consommer une potion ou encore utiliser une clee pour ouvrir une porte.

![](./resources/dialog-inventory.gif)

Comme nous avons discutte, le fenetre de dialogue peut etre facilement reutilise pour visualiser l'inventaire. Cependant l'etape preliminaire est de representer la structure interne de l'inventaire.

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `Inventory` qui encapsule les *items* de l'avatar.
> 2. Ajoutez la classe `Item` permettant d'utiliser les *items* differenment dependament du type.
>     * Chaque `Item` possede:
>         * `name` pour a l'affichage
>         * `type` pour identifier l'usage
>         * Un tableau associatif `properties` servant a identifier les proprietes specifique a un objet et permet un niveau de flexibilite.

### `Inventory.java`
```java
package com.tutorialquest;
// import ...

public class Inventory {

    private List<Item> items = new ArrayList<>();
    public Item sword;
    public Item shield;

    public List<Item> getItems() {
        return items;
    }

    public void add(Item ... items) {
        for (Item item : items) {
            this.items.add(item);
        }
    }

    public void remove(Item item) {
        items.remove(item);
    }
}
```

### `Item.java`
```java
package com.tutorialquest;
// import ...

public class Item {
    
    public final static String TYPE_EQUIP = "Equip";    
    public final static String TYPE_CONSUMABLE = "Consumable";

    public final static String PROP_HEALTH = "Health";
    public final static String PROP_DAMAGE = "Damage";
    public final static String PROP_KNOCKBACK = "Knockback";    
    public final static String PROP_EQUIP_TYPE = "EquipType";
    public final static String EQUIP_TYPE_SWORD = "Sword";
    public final static String EQUIP_TYPE_SHIELD = "Shield";    
    public final static String PROP_TRANSITION_ID = "TransitionID";
    
    public String name;
    public String type;    
    public MapProperties properties = new MapProperties();

    public Item(
        String name,
        String texturePath,
        String type,        
        MapProperties properties)
    {
        this.name = name;
        this.properties = properties;        
        this.type = type;
        this.texturePath = texturePath;
    }

    public void use(Avatar avatar)
    {
        switch (type)
        {

            case Item.TYPE_EQUIP:
                if(!properties.containsKey(Item.PROP_EQUIP_TYPE))
                    return;

                // Pour utiliser l'item du type Equipment
                // On equipe ou retire l'equipement si
                // l'item est deja equipe
                switch (getString(Item.PROP_EQUIP_TYPE))
                {
                    case Item.EQUIP_TYPE_SHIELD:
                        avatar.inventory.shield =
                            avatar.inventory.shield == this ?
                            null :
                            this;
            
                    case Item.EQUIP_TYPE_SWORD:
                        avatar.inventory.sword =
                            avatar.inventory.sword == this ?
                            null :
                            this;
                }

                break;

            // Pour utiliser l'item de type Consumable
            // On obtien l'attribut a modifier.
            // Nous pouvons imaginer d'autre attributs pouvants 
            // etre modifie comme les dommage ou les defense
            case Item.TYPE_CONSUMABLE:
                if(properties.containsKey(PROP_HEALTH))
                {
                    avatar.heal(getFloat(PROP_HEALTH));
                    avatar.inventory.remove(this);
                }

                break;
        }
    }
}
```

> ## Étapes a suivre
> ---
> 1. Ajoutez la methode `initInventory` afin d'initialiser l'inventaire avec des objets par default afin de tester le fonctionnement du systeme.
> 2. Modifiez les methode `getDamage` et `getKnockback` afin de prendre en compte l'equipement

### `Avatar.java`
```java
package com.tutorialquest.entities;
// import ...

public class Avatar extends Character {
        
    // AJOUT:
    public Inventory inventory;

    // AJOUT:
    // Si une arme est equipe, nous utilisons les dommages 
    // prescrits par l'arme, sinon nous utilison les dommages du personnage.
    public float getDamage() {
        return
            inventory.sword != null &&
            inventory.sword.hasProperty(Item.PROP_DAMAGE) ?
                inventory.sword.getFloat(Item.PROP_DAMAGE) :
                damage;
    }

    // AJOUT:
    public float getKnockback() {
        return
            inventory.sword != null &&
            inventory.sword.hasProperty(Item.PROP_KNOCKBACK) ?
                inventory.sword.getFloat(Item.PROP_KNOCKBACK) :
                damage;
    }


    // AJOUT:
    public void initInventory() {
        inventory = new Inventory();
        inventory.add(
            new Item() {{
                name = "Gold Sword";
                cost = 10.0f;
                type = Item.TYPE_EQUIP;
                properties.put(Item.PROP_EQUIP_TYPE, Item.EQUIP_TYPE_SWORD);
                properties.put(Item.PROP_DAMAGE, 5f);
                properties.put(Item.PROP_KNOCKBACK, 4f);
            }},
            new Item() {{
                name = "Medium Potion";
                cost = 10.0f;
                type = Item.TYPE_CONSUMABLE;
                properties.put(Item.PROP_HEALTH, 5f);
            }}
            // TODO: Ajout d'autre objets au besoin
        );
    }    

    public Avatar(Vector2 position) {
        super(position, DAMAGE, KNOCKBACK, MAX_HEALTH, SPEED, PUSH_FORCE);
        initSprite();

        // AJOUT:
        // Initialisation de l'inventaire
        initInventory();
    }

    public boolean isEquipped(Item item)
    {
        return
            Game.level.avatar.inventory.sword == item ||
            Game.level.avatar.inventory.shield == item;
    }
}
```