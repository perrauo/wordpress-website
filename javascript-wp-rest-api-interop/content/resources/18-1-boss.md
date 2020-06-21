# 16.1 Inventaire
> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

Dans les jeux vidéo, le terme *boss* (chef) designe un enemi tres puissant qui represente habituellement le defi ultime pour le joueur. Le *boss* est le point de culmination du jeu et permettra au joueur de mettre en oeuvre son expertise. Tout comme dans un jeu video, ce dernier chapitre dans lesquel nous allons programmer un *boss* vous permettra de combiner vos apprentissages!

### **Super Mario Bros. 3 - World 8 Boss**[^1]
![](./resources/mario-3-boss.png)

### **The Legend of Zelda: A Link to the Past - Ganon**[^2]
![](./resources/zelda-altp-boss.png)

> ## Étapes a suivre
> ---
> 1. A l'interieur de de `levels/dungeon.tmx`, configurez une porte appartenant a un boss a l'aide de la propriete `IsBoss`.
> 2. A l'interieur de la classe `Door`
>     * Distinguez la porte du boss de la porte de la porte secrete
> 3. A l'interieur de la classe `Level` ajoutez la possibilite de creer soit une porte de boss ou une porte normal.
> 4. A l'interieur de la classe `Avatar` modifiez initInventory pour ajouter une clee `Boss Key` afin de verifier le fonctionnement du systeme.

![](./resources/boss-door-level.png)
![](./resources/boss-level.png)


### `Door.java`
```java
package com.tutorialquest.entities;
// ...

public class Door extends PhysicalObject {
    
    // AJOUT:
    private boolean isBoss = true;
    
    // ...
    public Door(
        Vector2 position,
        String level,
        int transitionID,
        String direction,
        boolean isLocked,
        // AJOUT:
        boolean isBoss)
    {
        super(position);

        this.isBoss = isBoss;
        this.level = level;
        this.transitionID = transitionID;
        this.direction = direction;

        collider = new Collider(
            new Vector2(WIDTH, HEIGHT),
            Collider.FLAG_DOOR | Collider.FLAG_COLLIDABLE);

        // MODIF:
        // Ajout d'un sprite different 
        // lorsqu'il s'agit d'une porte de boss
        unlockedSprite = new Sprite(isBoss ?
            "objects/boss_door_open.png" :
            "objects/door_open.png",
            WIDTH, HEIGHT, 0, 0);

        // MODIF:
        lockedSprite = new Sprite(isBoss ?
            "objects/boss_door_closed.png" :
            "objects/door_closed.png",
            WIDTH, HEIGHT, 0, 0);

        sprite = lockedSprite;

    }
}
```

### `Level.java`
```java
// ...
case OBJECT_DOOR:
    Door door;
    add(door = new Door(new Vector2(
        object.getProperties().get(OBJECT_PROP_X, float.class),
        object.getProperties().get(OBJECT_PROP_Y, float.class)),
        object.getProperties().get(OBJECT_PROP_DOOR_LEVEL, String.class),
        object.getProperties().get(OBJECT_PROP_DOOR_TRANSITION_ID, Integer.class),
        object.getProperties().get(OBJECT_PROP_DOOR_DIRECTION, String.class),
        object.getProperties().containsKey(OBJECT_PROP_DOOR_LOCKED) ?
            object.getProperties().get(OBJECT_PROP_DOOR_LOCKED, boolean.class) :
            true,
        // AJOUT:
        // Ajout d'une porte de boss si `IsBoss` est evalue a true
        object.getProperties().containsKey(OBJECT_PROP_DOOR_BOSS) ?
            object.getProperties().get(OBJECT_PROP_DOOR_BOSS, boolean.class) :
            false
    ));

// ...
```

### `Avatar.java`
```java
package com.tutorialquest.entities;
// import ...

public class Avatar extends Character {

    // MODIF:
    // Ajout d'une clee pour tester le fonctionnement du system
    public void initInventory() {
        inventory.add(
            // ...
            // AJOUT:
            new Item() {{
                name = "Boss Key";
                type = Item.TYPE_KEY;
                properties.put(Item.PROP_TRANSITION_ID, 2);
            }}
        );
    }
}
```

![](./resources/boss-entrance.gif)


[^1]: https://www.nintendo.com/games/detail/super-mario-bros-3-3ds/

[^2]: https://www.nintendo.co.uk/Games/Super-Nintendo/The-Legend-of-Zelda-A-Link-to-the-Past-841179.html