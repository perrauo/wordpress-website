## 6.3 Comportement Ennemis
---

Il existe plusieurs manieres possible de programmer un ennemi pour qu'il soit arbitrairement intelligent. Un comportement simple plutot stupide consiste a programmer les ennemis afin qu'ils foncent en ligne droite vers l'avatar.


> ## Étapes a suivre
> ---
> 1. Dans la methode `start` de l'ennemi, obtenez la reference a `Avatar` dans le niveau
> 2. Ajoutez une methode `control` qui dirige l'enemi directment vers le joueur.

### ```Enemy.java```
```java
// package ..
// import ..

public class Enemy extends Character {    
    // ..
    // AJOUT:
    private PhysicalObject target;
    // AJOUT:
    @Override
    public void control()
    {
        if(target == null) controlAxes.setZero();
        else if(position.dst(target.position) > DETECTION_RANGE) controlAxes.setZero();
        else controlAxes
                .set(target.position)
                .sub(position)
                .nor();

        velocity
            .set(controlAxes)
            .scl(speed);
    }

    @Override
    public void start()
    {
        target = Game.level.avatar;
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        // AJOUT:
        control();
        turn();        
        move();
    }
}

```

![](./resources/enemy-behaviour.gif)