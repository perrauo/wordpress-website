
## 4.3 Integration des sprites
---

Maintenant que nous avons le mechanisme requis pour afficher un animation a l'ecran, il est maintenant temps d'integrer les animation dans la classe `Avatar` afin que celles-ci soient jouees aux bons moments.

> ## Étape a suivre
> ---
> 1. Ajoutez les variables de direction necessaire pour determiner l'orientation du personnage.
> 2. Ajoutez la methode `turn` a l'interieur de `Avatar` afin de jouer l'animation necessaire dependament de l'orientation.

### ```Avatar.java```
```java
package com.tutorialquest.entities;
// ...
public class Avatar extends Entity {
    
    // ...

    // AJOUT: Constante utilise pour dermine un changement de direction
    private static float TURN_EPSILON = 0.5f;
    
    // AJOUT:
    // ajout des variables de direction
    private Vector2 direction = new Vector2(0, -1);
    private Utils.Direction fixedDirection = Utils.Direction.DOWN;    

    // ...

    // AJOUT
    public void turn()
    {        
        // Section qui joue l'animation `IDLE` 
        // lorsque l'avatar est immobile
        // lorsque controlAxes est egal a zero
        // lorsque aucune entrees au clavier
        if (controlAxes.epsilonEquals(Vector2.Zero)) {
            switch (fixedDirection) {
                case LEFT:
                case RIGHT:
                    sprite.play(SpriteUtils.IDLE_SIDE, false);
                    break;

                case UP:
                    sprite.play(SpriteUtils.IDLE_BACK, false);
                    break;

                case DOWN:
                    sprite.play(SpriteUtils.IDLE_FRONT, false);
                    break;
            }

            return;
        }

        // Section pour l'animation `WALK`
        // Lorsque l'entrees au clavier est plus grand que zero
        // Mise-a-jour des variables de direction
        if (controlAxes.x > TURN_EPSILON) {
            direction.set(1, direction.y);
            fixedDirection = Utils.Direction.RIGHT;
            sprite.flipX = false;
            sprite.play(SpriteUtils.WALK_SIDE, false);
        } else if (controlAxes.x < -TURN_EPSILON) {
            direction.set(-1, direction.y);
            fixedDirection = Utils.Direction.LEFT;
            sprite.flipX = true;
            sprite.play(SpriteUtils.WALK_SIDE, false);
        }

        if (controlAxes.y > TURN_EPSILON) {
            direction.set(direction.x, 1);
            fixedDirection = Utils.Direction.UP;
            sprite.flipX = false;
            sprite.play(SpriteUtils.WALK_BACK, false);
        } else if (controlAxes.y < -TURN_EPSILON) {
            direction.set(direction.x, -1);
            fixedDirection = Utils.Direction.DOWN;
            sprite.flipX = false;
            sprite.play(SpriteUtils.WALK_FRONT, false);
        }

        // Normalisation du vecteur de direction
        direction.nor();
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        control(deltaTime);
        turn();
        position.add(velocity);
        sprite.update(deltaTime);
    }

    @Override
    public void render(SpriteBatch spriteBatch) {
        sprite.render(spriteBatch, position);
        super.render(spriteBatch);
    }
}
```

![](./resources/first-animations.gif) 

---
> ## Activité
> ---
> Creez la classe EnemySprite dans laquel vous specifiez les animations propre a l'enemie depuis le fichier `assets/monster_sprite.png`
