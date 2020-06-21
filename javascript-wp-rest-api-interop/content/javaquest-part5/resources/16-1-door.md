# 15. Magasin
> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

Si vous portez attention, vous remarquez qu'une clee est disponible en magasin. Cependant puisque nos transitions sont automatique, ce petit objet metalique est presentement completement inutile!

![](./resources/secret-key.png)

Plusieurs jeux de roles incorporent des casse tête afin d'offrir d'autre sorte de defi pour le joueur. Un mecanimse de clee et porte peut offrir un moyen tres pour construire un case tete. Nous pouvons facilement reutiliser le mecanimse d'item et d'objet interactif pour interagir avec une porte.

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `Door` avec laquelle le joueur peut utiliser une clee.
> 2. Chargez la texture correspondant a la porte
> 3. Ajoutez la methode `unlock` qui cree une nouvelle transition dans le monde. 

### `Door.java`
```java
package com.tutorialquest.entities;
// import ...

public class Door extends PhysicalObject {

    public int WIDTH = 48;
    public int HEIGHT = 48;

    private Sprite unlockedSprite;
    private Sprite lockedSprite;
    private Sprite sprite;
    private String level;
    private String direction;
    public int transitionID;
    public Transition transition = null;

    public Door(
        Vector2 position,
        String level,
        int transitionID,
        String direction,
        boolean isLocked)
    {
        super(position);

        this.level = level;
        this.transitionID = transitionID;
        this.direction = direction;

        collider = new Collider(
            new Vector2(WIDTH, HEIGHT),
            Collider.FLAG_DOOR | Collider.FLAG_COLLIDABLE);

        // Chargement des textures
        unlockedSprite = new Sprite(
            "objects/door_open.png",
            (int)WIDTH, (int)HEIGHT, 0, 0);
        lockedSprite = new Sprite(
            "objects/door_closed.png",
            (int)WIDTH, (int)HEIGHT, 0, 0);

        sprite = lockedSprite;

        if(!isLocked) unlock();
    }

    // Deverouillage de la porte
    public void unlock()
    {
        sprite = unlockedSprite;
        Game.level.add(
            transition = new Transition(
                new Vector2().add(position).add(WIDTH/3, 0),
                level,
                transitionID,
                direction));
    }

    // ...

}

```

> ## Étapes a suivre
> ---
> 1. Ajoutez un nouveau type `Key` a `Item`
>     * Ajoutez l'usage du type type `Key` a l'interieur de la methode `use`
> 2. A l'interieur de la classe `Avatar` 
>     * Ajoutez la methode `unlock` qui sert a ouvrir une porte.
>     * Modifiez la methode `initInventory` pour y ajouter une clee afin de verifier le fonctionement du systeme

### `Item.java`
```java
package com.tutorialquest;
// import ...

public class Item {
    // ...

    // AJOUT:
    public final static String TYPE_KEY = "Key";
    public final static String PROP_TRANSITION_ID = "TransitionID";
    
    // ...

    public void use(Avatar avatar)
    {
        switch (type)
        {
            // AJOUT:
            case Item.TYPE_KEY:
                if(properties.containsKey(PROP_TRANSITION_ID)) {
                    if(avatar.unlock(getInt(PROP_TRANSITION_ID))) {
                        avatar.inventory.remove(this);
                    }
                }
                break;
        }
    }
}
```

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
                name = "Secret Key";
                type = Item.TYPE_KEY;
                properties.put(Item.PROP_TRANSITION_ID, 1);
            }}
        );
    }

    // AJOUT:
    public boolean unlock(int transitionID) {
        List<PhysicalObject> results = new LinkedList<>();
        Vector2 interactionOffset = new Vector2(direction).scl(INTERACTION_RANGE);

        if (!collider.getObjectCollisions(
            this,
            interactionOffset.x,
            interactionOffset.y,
            Collider.FLAG_DOOR,
            results)) return false;

        PhysicalObject next = results.iterator().next();
        Door door = next instanceof Door ? (Door) next : null;
        if (door == null) return false;
        if (door.transitionID != transitionID) return false;

        door.unlock();
        return true;
    }
}
```


> ## Étapes a suivre
> ---
> 1. Ajoutez le code necessaire pour la creation de `Door` dans la classe `Level`
> 2. Tout comme la transition, ajoutez le code afin de definir une position pour le joueur lors d'une transition.

![](./resources/secret-room.png)

```java
package com.tutorialquest;
// import ...

public class Level {

    // ...
    
    // AJOUT:
    public static final String OBJECT_DOOR = "Door";
    public static final String OBJECT_PROP_DOOR_LEVEL = "Level";
    public static final String OBJECT_PROP_DOOR_DIRECTION = "Direction";
    public static final String OBJECT_PROP_DOOR_LOCKED = "Locked";
    public static final String OBJECT_PROP_DOOR_BOSS = "IsBoss";
    public static final String OBJECT_PROP_DOOR_TRANSITION_ID = "TransitionID";

    // ...

    public void load(int transitionID, Avatar avatar)
    {
        this.avatar = avatar;
        add(avatar);

        for (MapLayer layer : tiledMap.getLayers()) {
            switch (layer.getName()) {
                // ...                
                case LAYER_OBJECT:
                    for (int i = 0; i < layer.getObjects().getCount(); i++) {
                        // ...
                        switch (object.getProperties().get(OBJECT_PROP_TYPE, String.class)) {
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
                                    object.getProperties().containsKey(OBJECT_PROP_DOOR_BOSS) ?
                                        object.getProperties().get(OBJECT_PROP_DOOR_BOSS, boolean.class) :
                                        false
                                ));

                                // Lors d'une transition,
                                // la porte est deverouille
                                // le joueur est alors place a la position de la porte
                                if (
                                    door.transitionID == transitionID &&
                                    avatar != null)
                                {
                                    door.unlock();
                                    door.transition.disable(Transition.DISABLE_TIME);
                                    avatar.position = door.transition.getDestination();
                                    avatar.direction = Utils.toVector(door.transition.direction);
                                    avatar.input.disable(.25f);
                                }

                                break;
                            
                            // ...
                        }
                    }
                    break;
            }
        }
    }
}
```

![](./resources/secret-room.gif)