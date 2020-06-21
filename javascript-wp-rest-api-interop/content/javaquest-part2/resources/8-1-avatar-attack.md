# 8.1 Attaque de l'avatar

> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-enemies/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-enemies/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-enemies/core.assets.zip" download>core.assets.zip</a> |

Nous avons deja cree une classe `Attack` afin de representer un attaque inflige par un ennemi. Cependant contrairement a la classe `Attack`, l'attaque effectue par l'avatar ne partage pas le meme `Collider` que l'avatar lui meme. Une maniere naive d'implementer cette capacite d'attaque serait de gerer les attaque instantanees (`DirectAttack`) et les attaque physique (`SwordAttack`) differement. Cependant, un interface nous permet de resoudre le probleme de maniere plus elegante.

![](./resources/physical-attack-collision.gif)

> ## Étapes a suivre
> ---
> 1. Ajoutez un interface `IAttack`
> 2. Renommez la classe `Attack` par `DirectAttack`
> 3. Ajoute la classe `SwordAttack` qui derive de `Entity` et implante les composantes de `IAttack`

### `IAttack.java`
```java
package com.tutorialquest;
// import ...

public interface IAttack {
    
    float getDamage();
    float getKnockback();
    Vector2 getDirection();
}
```

### `DirectAttack.java`
```java
package com.tutorialquest;
// import ..

// MODIF:
// public class DirectAttack
public class DirectAttack implements IAttack
{
    // ...
}
```

### `SwordAttack.java`
```java
package com.tutorialquest.entities;
// import ..

public class SwordAttack extends PhysicalObject implements IAttack
{
    protected Vector2 direction;
    private float damage = 10;
    private float knockback = 40f;        

    public float getDamage() {return damage;}
    public float getKnockback() {return knockback; }
    public Vector2 getDirection() { return direction;}

    public SwordAttack(
        Vector2 position,
        Vector2 direction,
        float damage,
        float knockback,
        int mask)
    {
        super(position);
        
        this.collider = new Collider(
            new Vector2(
                WIDTH, 
                HEIGHT),
            Collider.FLAG_NONE);
        
        this.collider.origin = new Vector2(
            WIDTH/2, 
            HEIGHT/2);

        this.knockback = knockback;
        this.damage = damage;
        this.direction = direction;
        this.mask = mask;
    }
}
```
Il est aussi important de s'assurer que chaque attaque ne soient pas effective indefiniment. Nous devons donc imposer une limite de temps a la classe `SwordAttack` apres laquel l'attaque est retiree du monde.

> ## Étapes a suivre
> ---
> 1. Dans la methode `update`, verifiez pour les collisions avec un enemi
> 2. Ajoute une limite de temps apres laquel l'attaque est retire du monde.


## `SwordAttack.java`
```java
// package ..
// import ..
public class SwordAttack extends PhysicalObject implements IAttack
{   
    // AJOUT:
    // Variables de controle pour imposer une limite de temps
    private float timeLimit = 0.2f;
    private float elapsedTime = 0f;

    // AJOUT:
    // `hits` contient les enemis deja attaques
    private List<PhysicalObject> hits = new LinkedList<>();

    // ..    
    
    // AJOUT:
    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        collider.update(position);
        List<PhysicalObject> collisionResults = new LinkedList<>();
        collider.getObjectCollisions(
            this,
            0,
            0,
            mask,
            collisionResults);

        // Endomager les objets avec lesquel l'attque rentre en contact
        for(PhysicalObject result : collisionResults)
        {
            if(hits.contains(result))
                return;

            result.onAttacked(this);
            hits.add(result);
        }

        // Retire l'attaque si a limite de temps expire
        elapsedTime += deltaTime;
        if(elapsedTime > timeLimit) {
            Game.level.remove(this);
            finished = true;
        }
    }
}
```

Finalement, ajoutons le code qui gere la creation de l'attaque depuis l'avatar. Il s'agit d'instantier l'attaque en avant du personnage. Puisque l'attaque n'est sous forme de carre, nous cherchons a redimensionner la boite de collision dependament de l'orientation du personnage.

> ## Étapes a suivre
> ---
> 1. Ajoutez la methode `attack` dans `Avatar` qui est invoquez dans `update`
> 2. Ajoutez la methode `cancelAttack` afin de permettre qu'une attaque en maintenant. 


```java
package com.tutorialquest.entities;
//import ..

public class Avatar extends Character {
    // ...
    private static final float ATTACK_RANGE = 8f;    
    protected static final float DAMAGE = 4f;
    protected static final float KNOCKBACK = 200;    
    
    // AJOUT:
    private SwordAttack attack;
    // ...
    public void attack() { 
        // On annule l'attaque 
        // lorsque le personnage change de direction
        if (
            attack != null && 
            !attack.direction.epsilonEquals(Utils.toVector(fixedDirection)))
        {
            cancelAttack();
        }

        // On determine les dimension et la position de l'attaque 
        // selon la direction du personnage
        
        // Pour la position:
        Vector2 attackOffset =
            fixedDirection == Utils.Direction.LEFT ||
                fixedDirection == Utils.Direction.RIGHT ?
                new Vector2(ATTACK_RANGE, 0)
                    .scl(fixedDirection == Utils.Direction.RIGHT ? 2 : -2) :
                new Vector2(0, ATTACK_RANGE)
                    .scl(fixedDirection == Utils.Direction.UP ? 2 : -2);
        
        // Pour la dimension:
        Vector2 attackSize =
            fixedDirection == Utils.Direction.LEFT ||
                fixedDirection == Utils.Direction.RIGHT ?
                new Vector2(SwordAttack.HEIGHT, SwordAttack.WIDTH) :
                new Vector2(SwordAttack.WIDTH, SwordAttack.HEIGHT);

        // Ajoute une attaque dans le monde lorsque
        // le joueur appui sur la touche requise
        if (input.isAttackJustPressed()) 
        {
            cancelAttack();
            Game.level.add(
                attack = new SwordAttack(
                    new Vector2(position).add(attackOffset),
                    Utils.toVector(fixedDirection),
                    damage,
                    knockback,
                    Collider.FLAG_ENEMY
                ));
        }

        if (attack != null) {
            if (attack.finished) {
                cancelAttack();
                return;
            }

            attack.position
                .set(position)
                .add(attackOffset);
            attack.resize(attackSize);
        }
    }

    public void cancelAttack() {
        if (attack != null) {
            Game.level.remove(attack);
            attack = null;
        }
    }


    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        control(deltaTime);
        turn();
        updateVelocity(deltaTime);
        push(Collider.FLAG_PUSHABLE);
        move();
        // AJOUT:
        attack();
    }
}
```

![](./resources/avatar-attack-no-anim.gif)