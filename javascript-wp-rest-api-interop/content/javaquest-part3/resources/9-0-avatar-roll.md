# 9. Meilleur mobilité
> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

Bien que l'avatar peut maintenant se defendre, le combat n'est parfois pas la meilleur solution. Nous devons ajouter un moyen a l'avatar d'accelerer au besoin.

![](./resources/animation-full.gif)

> ## Étapes a suivre
> ---
> 1. Ajoutez les animations propre a la roulate `ROLL` de l'avatar
> 2. Ajoutez la variable `rollVelocity`
> 3. Ajoutez la valeur de `rollVelocity` de du calcul de `velocity` dans la methode `updateVelocity`
> 4. Limitez la duree de la roulade a l'aide de `rollTime` et `ROLL_TIME_LIMIT`
> 5. Ajoutez la methode `roll`

```java
public class Avatar extends Character
{
    // AJOUT:
    private static final float ROLL_TIME_LIMIT = 0.4f;
    // AJOUT:
    private Vector2 rollVelocity = new Vector2();
    // AJOUT:
    private float rollTime = ROLL_TIME_LIMIT;

    public void initSprite()
    {
        // ...
            
        sprite.addAnimation(
            SpriteUtils.ROLL_FRONT,
            SpriteUtils.ROLL_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[11][0],
            sprite.frames[11][1],
            sprite.frames[11][2],
            sprite.frames[11][3],
            sprite.frames[11][4]
        );

        sprite.addAnimation(
            SpriteUtils.ROLL_SIDE,
            SpriteUtils.ROLL_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[8][0],
            sprite.frames[8][1],
            sprite.frames[8][2],
            sprite.frames[8][3],
            sprite.frames[8][4]
        );

        sprite.addAnimation(
            SpriteUtils.ROLL_BACK,
            SpriteUtils.ROLL_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[9][0],
            sprite.frames[9][1],
            sprite.frames[9][2],
            sprite.frames[9][3],
            sprite.frames[9][4]
        );

    }

     // AJOUT:
     public void roll(float deltaTime) {

        if (rollTime < ROLL_TIME_LIMIT) rollTime += deltaTime;
        else if (!input.isRollJustPressed()) rollVelocity.setZero();
        else {
            rollVelocity
                .set(direction)
                .scl(ROLL_SPEED);
            switch (fixedDirection) {
                case RIGHT:
                    sprite.flipX = false;
                    playAnimation(SpriteUtils.ROLL_SIDE, true, true);
                    break;

                case LEFT:
                    sprite.flipX = true;
                    playAnimation(SpriteUtils.ROLL_SIDE, true, true);
                    break;

                case DOWN:
                    sprite.flipX = false;
                    playAnimation(SpriteUtils.ROLL_FRONT, true, true);
                    break;

                case UP:
                    sprite.flipX = false;
                    playAnimation(SpriteUtils.ROLL_BACK, true, true);
                    break;
            }

            rollTime = 0;
        }
    }

    // AJOUT:
    @Override
    public void updateVelocity(float deltaTime) {
        velocity.setZero()
            .add(locomotionVelocity)
            .add(pushedVelocity)
            .add(rollVelocity)
            .scl(deltaTime);
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        control(deltaTime);
        turn();
        // AJOUT:
        roll(deltaTime);
        updateVelocity(deltaTime);        
        move();
        attack();
    }
}
```

![](./resources/animation-roll.gif)


