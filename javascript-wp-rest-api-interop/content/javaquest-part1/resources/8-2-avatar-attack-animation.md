## 8.2 Attaquer les ennemis
---

Puisque l'avatar n'attaque pas au contact comme les ennemis, il nous faut un moyen pour visualiser les attaques de notre joueur. Il y a deux types de visuel, un animation pour l'avatar et un pour l'attaque.

> ## Étapes a suivre
> ---
> 1. Ajoutez les animations requise a l'avatar
> 2. modifiez la methode `playAnimation` afin que les animations d'attaque prennent préséance a d'autres animations
> 3. Jouez l'animation a l'interieur de `attack`

```java
// package ..
// import ..

public class Avatar extends Character{
    
    // ..
    
    public void initSprite()
    {
        // ...

        // AJOUT:
        sprite.addAnimation(
            SpriteUtils.SLASH_FRONT,
            SpriteUtils.ATTACK_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[7][0],
            sprite.frames[7][1],
            sprite.frames[7][2],
            sprite.frames[7][3]
        );

        // AJOUT:
        sprite.addAnimation(
            SpriteUtils.SLASH_SIDE,
            SpriteUtils.ATTACK_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[4][0],
            sprite.frames[4][1],
            sprite.frames[4][2],
            sprite.frames[4][3]
        );

        // AJOUT:
        sprite.addAnimation(
            SpriteUtils.SLASH_BACK,
            SpriteUtils.ATTACK_FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[5][0],
            sprite.frames[5][1],
            sprite.frames[5][2],
            sprite.frames[5][3]
        );
    }

    @Override
    public void playAnimation(
        int anim, 
        boolean reset, 
        boolean force) 
    {
        if (!force) if (attack != null) return;        
        super.playAnimation(anim, reset, force);
    }


    public void attack(float deltaTime)
    {
        // ...

        if(InputUtils.IsAttackPressed())
        {
            // ...
            // AJOUT:
            switch (fixedDirection) {
                case LEFT:
                case RIGHT:
                    playAnimation(
                        SpriteUtils.SLASH_SIDE,
                        true,
                        true);
                    break;

                case UP:
                case DOWN:
                    playAnimation(
                        fixedDirection == Utils.Direction.UP ?
                            SpriteUtils.SLASH_BACK :
                            SpriteUtils.SLASH_FRONT,
                        true,
                        true);
                    break;
            }
        }

        // ...
    }
    
    // ..
}
```

Ajoutons maintenant l'animation propre a l'attaque elle meme.

> ## Étapes a suivre
> ---
> 1. Ajoutez les animations requise pour l'attaque
> 2. Jouez la bonne animation lors de la creation

```java
package com.tutorialquest.entities;
// import ...

public class SwordAttack extends PhysicalObject implements IAttack
{
    // AJOUT:
    public class SpriteUtils
    {
        public static final float FRAME_LENGTH = 0.1f;
        public static final float SPRITE_WIDTH = 32;
        public static final float SPRITE_HEIGHT = 32;
        
        public static final int ANIM_SLASH_FORWARD = 1;
        public static final int ANIM_SLASH_SIDE = 2;
    }

    private AnimatedSprite sprite;

    // AJOUT:
    // Nous ajoutons les animations necessaires
    public void initSprite()
    {
        this.sprite = new AnimatedSprite(
            "objects/effect_spritesheet.png",
            new Vector2(
                SpriteUtils.SPRITE_WIDTH,
                SpriteUtils.SPRITE_HEIGHT));

        this.sprite.origin = 
            new Vector2(
                SpriteUtils.SPRITE_WIDTH/2, 
                SpriteUtils.SPRITE_HEIGHT/2);

        sprite.addAnimation(
            SpriteUtils.ANIM_SLASH_FORWARD,
            SpriteUtils.FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[0][0],
            sprite.frames[0][1],
            sprite.frames[0][2]
        );

        sprite.addAnimation(
            SpriteUtils.ANIM_SLASH_SIDE,
            SpriteUtils.FRAME_LENGTH,
            Animation.PlayMode.NORMAL,
            sprite.frames[1][0],
            sprite.frames[1][1],
            sprite.frames[1][2]
        );
    }

    public SwordAttack(
        Vector2 position,
        Vector2 direction,
        float damage,
        float knockback,
        int mask)
    {
        super(position);
        
        // ...
        
        // AJOUT:
        initSprite();

        // AJOUT:
        // Il faut jouer la bonne animation selon l'orientation
        Utils.Direction fixedDirection = Utils.toDirection(direction);
        switch (fixedDirection) {
            case LEFT:
            case RIGHT:
                sprite.flipX = fixedDirection == Utils.Direction.RIGHT;
                sprite.flipY = false;
                sprite.play(SpriteUtils.ANIM_SLASH_SIDE, true);
                break;

            case UP:
            case DOWN:
                sprite.flipX = false;
                sprite.flipY = fixedDirection == Utils.Direction.UP;
                sprite.play(SpriteUtils.ANIM_SLASH_FORWARD, true);
                break;
        }

    }
    
    // AJOUT:
    @Override
    public void render(SpriteBatch spriteBatch){
        sprite.render(spriteBatch, position);
        super.render(spriteBatch);
    }
}

```

![](./resources/animation-full.gif)