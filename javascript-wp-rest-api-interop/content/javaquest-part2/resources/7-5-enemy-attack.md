## 7.5 Dommages infliges par les ennemis
---

Nous voulons donner la capacite aux ennemis d'endomager l'avatar au contact. A l'aide du code ecrit jusqu'a present il est facile d'obtenir cette fonctionalite.

> ## Étapes a suivre
> ---
> 1. Creez la classe `DirectAttack` pour encapsulez les dommages
> 2. Ajoutez la methode `collisionAttack` a `Enemy`
> 3. Ajoutez la methode `onAttacked` a l'interieur de `Character`

### ```Attack.java```
```java
public class Attack
{
    public float damage = 10;        

    public Attack(float damage)
    {
        this.damage = damage;
    }
}

```

### `Enemy.java`
```java
package com.tutorialquest.entities;
// import ...

public class Enemy extends Character {

    // Endomage les objets avec lesquels entre en contact
    public void collisionAttack() {
        List<PhysicalObject> results = new LinkedList<>();
        if (collider.getObjectCollisions(
            this,
            velocity.x,
            velocity.y,
            results))
        {            
            results.iterator().next()
                .onAttacked(new DirectAttack(damage)); 
        }
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        control();
        turn();
        updateVelocity(deltaTime);
        // AJOUT:
        collisionAttack();
        move();
    }
}
```

### ```Character.java```
```java
// package ..
// import ..

public class Character : PhysicalObject {
            
    // ..
    
    // AJOUT: 
    // lorsqu'un personnage n'a plus de points vie
    // On le retire du niveau
    @Override
    public void onAttacked(Attack attack)
    {
        health -= attack.damage;
        if(health <= 0)
        {
            health = 0;
            Game.room.remove(this);
        }
    }
}
```
La solution parrait simple, mais un probleme persiste puisque les enemis ne sont pas capable de distinguer l'avatar d'un autre enemi!

![](./resources/kill-each-other.gif)