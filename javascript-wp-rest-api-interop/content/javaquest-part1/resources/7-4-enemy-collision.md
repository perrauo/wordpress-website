## 6.3 Collision Ennemis
---

Bien que les collisions avec le niveau sont en place, nous devons gerer les collisions entres les objets afin d'assurer qu'il soit impossible de marcher a travers d'autre objets.
### Aucune collision avec les ennemis
![](./resources/enemy-behaviour.gif)

Les collision avec les objet va aussi nous permettre d'endommager l'avatar.

Nous sommes capable de reutiliser le code pour les collisions avec le niveau avec quelques modifications afin de pouvoir gerer la collision avec les objets du monde.

> ## Étapes a suivre
> ---
> 1. Ajoutez `getObjectCollisions` a `Collider` pour les collisions objets
> 2. Ajoutez `isCollidingHorizontal` et `isCollidingVertical`
>     * Determine si collision avec tilemap ou objet.
> 3. Modifiez la methode `updateObject` afin de prendre en compte les collision objet

### ```Collider.java```
```java
package com.tutorialquest;
// import ..

public class Collider {

    // ...
    // AJOUT: Resultats de collision
    private List<PhysicalObject> results = new LinkedList<>();

    // ...

    // AJOUT:
    // Methode servant aux collision objet
    public boolean getObjectCollisions(
        PhysicalObject object,
        float ofsx,
        float ofsy,
        List<PhysicalObject> results)
    {
        results.clear();
        PhysicalObject result;        

        for (Entity ent : Game.level.entities) {
            if (ent == object)
                continue;

            // Nous sommes seulement concerne par les objets physiques
            result = ent instanceof PhysicalObject ? (PhysicalObject) ent : null;

            if(result == null)
                continue;

            if(result.collider == null)
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

    // AJOUT:
    public boolean isCollidingHorizontal(
        PhysicalObject source, 
        float xvelocity, 
        float side) 
    {
        return
            isCollidingTilemapHorizontal(xvelocity, side) ||
            getObjectCollisions(source, xvelocity, 0, results);
    }

    // AJOUT:
    public boolean isCollidingVertical(
        PhysicalObject object, 
        float yvelocity, 
        float side) 
    {
        return
            isCollidingTilemapVertical(yvelocity, side) ||
            getObjectCollisions(object, 0, yvelocity, results);
    }

    // MODIF:
    public Vector2 updateObject(PhysicalObject object)
    {
        //--- Horizontal Collision ---//
        // MODIF:
        // if (isCollidingTilemapHorizontal(object, cvx, horizontalSide)) {
        if (isCollidingHorizontal(object, cvx, horizontalSide)) {
            for (int i = 0; i < Math.abs(cvx); i++) {         
                // MODIF:       
                // if (!isCollidingTilemapHorizontal(object, sx, horizontalSide)) {
                if (!isCollidingHorizontal(object, sx, horizontalSide)) {
                    object.position.x += sx;
                }
            }

            // J'annule la velocite de l'objet afin qu'il ne puisse pas depasser le mur
            object.velocity.x = 0;
        }

        //--- Vertical Collision ---//
        // ...

        return object.velocity;
    }
}

```

![](./resources/enemy-collision-yes.gif)

Malgre ces ameilioration, un probleme persiste lorsque les enemies sont situes les uns sur les autres lors de l'initialisation. 

![](./resources/slime-overlap.png)
![](./resources/slime-overlap-gif.gif)

Nous pouvons facilement corriger ce probleme. Il s'agit de detecter si l'objet collisionne avec un autre et le deplacer par rapport a la distance entre ces deux objets.

---

> ## Étapes a suivre
> ---
> 1. Ajoutez la methode `fixObjectOverlap` pour empecher l'intersection des enemis lors de l'initialisation
> 2. Utilisez `fixObjectOverlap` a l'interieur de `updateObject`

```java

package com.tutorialquest;
// import ..

public class Collider {

    // ...

    // AJOUT:
    private float FIX_OVERLAP_SPEED = 1f;

    // ...

    // AJOUT:
    public void fixObjectOverlap(PhysicalObject object, )
    {
        if(getObjectCollisions(object, 0, 0, results))
        {
            for(PhysicalObject res : results)
            {
                float distx = Math.signum(object.position.x - res.position.x) * FIX_OVERLAP_SPEED;
                if (!isCollidingTilemapHorizontal(0, horizontalSide)) {
                    object.position.x += distx;
                }
                float disty = Math.signum(object.position.y - res.position.y) * FIX_OVERLAP_SPEED;
                if (!isCollidingTilemapVertical(0, verticalSide)) {
                    object.position.y += disty;
                }
            }
        }
    }

    // MODIF:
    public Vector2 updateObject(PhysicalObject object)
    {
        //AJOUT:
        fixObjectOverlap(object);
        
        // ...

        return object.velocity;
    }
}
```
