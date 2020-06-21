## 7.6 Identification des collisions
---

Afin de resoudre le probleme d'identification des collision, nous utilisons le *bitmask*

![](./resources/kill-each-other.gif)

## 7.6.1 Bitmask
---
Comme vous le savez peut etre, en informatique n'importe quel type de donnees est represente a l'aide des *bits* 0 et 1. Par exemple le nombre entier `3` peut etre ecrit de la maniere suivante.

`00000011`

Cependant, il est aussi possible d'utiliser une serie de *bits* de maniere creative afin de representer un ensemble de configurations (*flags*) qui sont soit vrai ou faux. Par exemple le bit le plus a droite peut representer les collisions avec l'avatar (`FLAG_AVATAR`) Le deuxieme bit peut representer les collision avec les ennemis (`FLAG_ENEMY`).

Le *masking* ou l'application d'un *bitmask* est une opération de logique binaire utilisé pour sélectionner dans un groupe de bits un sous-ensemble de bits à verifier. Le pseudocode si-dessous illustre les operations essentiel pour le *masking*

l'operateur `<<` permet de facilement initialiser des *flags*
```java
// (1 << 0) == 0b00000001
int FLAG_AVATAR = 1 << 0

// (1 << 1) == 0b00000010
int FLAG_ENEMY = 1 << 1

// (1 << 2) == 0b00000100
int FLAG_SOME_OTHER_THING = 1 << 2
```

l'operateur `|` sert a combiner la valeur de masques
```java
// (FLAG_AVATAR | FLAG_ENEMY) == 0b00000011
int CollisionFlags = FLAG_AVATAR | FLAG_ENEMY
```

L'operateur `&` pour verifier si les bit sont actifs:
```java
((CollisionFlags & FLAG_AVATAR) != 0) == true
((CollisionFlags & FLAG_ENEMY) != 0) == true
```

Puisque le *flag* `FLAG_SOME_OTHER_THING` n'est pas actif:
```java
`((CollisionFlags & FLAG_SOME_OTHER_THING) != 0) == false`
```

> ## Étapes a suivre
> ---
> 1. Ajoutez `collisionFlags` a `Collider` afin d'ajouter un ensemble de *flags*
> 2. Modifiez la methode `getObjectCollisions` afin de collisionner seulement avec les objets specifiez dans un masque
> 3. Ajoutez un masque `COLLISION_AVATAR` au collider dans la classe `Avatar`
> 5. Ajoutez un masque `COLLISION_ENEMY` au collider dans la classe `Enemy`
> 4. Dans la methode `collisionAttack` configurez l'attaque afin de seulement cibler l'avatar




### `Collider.java`
```java
package com.tutorialquest;
// import ..

public class Collider {

    public static final int FLAG_NONE = 0;
    public static final int FLAG_AVATAR = 1 << 0;
    public static final int FLAG_ENEMY = 1 << 1;
    
    // ...

    public int collisionFlags = FLAG_NONE;

    public Collider(
        Vector2 size,
        // AJOUT:
        int flags)
    {
        this();
        this.rect.setSize(size.x, size.y);
        this.collisionFlags = flags;
    }

    public boolean isCollidingHorizontal(
        PhysicalObject source, 
        float xvelocity, 
        float side, 
        // AJOUT:
        int collisionMask) 
    {
        // ..
    }

    // isCollidingVertical ... 

    public boolean getObjectCollisions(
        PhysicalObject object,
        float ofsx,
        float ofsy,
        // AJOUT:
        int collisionMask,
        List<PhysicalObject> results)
    {
        // ...

        // AJOUT:
        if(collisionMask == 0) return false;

        for (Entity ent : Game.level.entities) {
            if (ent == object)
                continue;

            // ...

            // AJOUT: Si flag du masque n'est pas actif, on ignore la collision
            if((result.collider.collisionFlags & collisionMask) == 0)
                continue;

            if (Intersector.overlaps(
                new Rectangle(
                    rect.x + MathUtils.round(ofsx),
                    rect.y + MathUtils.round(ofsy),
                    rect.width,
                    rect.height),
                result.collider.rect))
            {
                results.add(result);
            }
        }

        return !results.isEmpty();
    }

    public Vector2 updateObject(
        PhysicalObject object,
        // AJOUT:
        int collisionMask)
    {
        // ...
        return object.velocity;
    }
}

```

### `Enemy.java`
```java
// package ..
// import ..

public class Enemy extends Character{

    // ..

    public Enemy(Vector2 position) {
        super(position);
        collider = new Collider(
            new Vector2(
                -Collider.DEFAULT_SIZE.x / 2,
                -Collider.DEFAULT_SIZE.y / 10),
            Collider.DEFAULT_SIZE,
            // AJOUT:
            Collider.FLAG_ENEMY);
    }

    // ..

}
```


### `Avatar.java`
```java
// package ..
// import ..

public class Avatar extends Character{

    // ..

    public Avatar(Vector2 position) {
        super(position);
        collider = new Collider(
            new Vector2(
                -Collider.DEFAULT_SIZE.x / 2,
                -Collider.DEFAULT_SIZE.y / 8),
            Collider.DEFAULT_SIZE,
            // AJOUT:
            Collider.FLAG_AVATAR);
    }

    // ..
}
```
Nos pauvres enemis auront enfin peut-etre une chance contre notre valeureux hero!

![](./resources/kill-the-avatar.gif)