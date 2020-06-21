## 18.2 Machine a etats
---
Dans un exercice précédent, nous avons amélioré nos ennemis dans le but d'illustrer le concept de comportements avec des **états**. Bien que les états peuvent sembler superflux pour un ennemi simple, l'utilisation d'états est essentiel pour représenter un personnage intelligent complexe comme le *boss*.
Lorsqu'il s'agit de bosse pour un jeu vidéo, il est typique de vouloir avoir plusieurs phases d'attaque. Voici les différentes phases du combat et états du boss.

### `Shoot`

Dans cet etat le *boss* tire une series de projectile en spirale

![](./resources/boss-state-shoot.gif)

### `Chase`

Dans cet etait le *boss* pourchasse le joeur de facons similaire au comportement de l'ennemi.

![](./resources/boss-state-chase.gif)

### `Bounce`

Dans cet etat le boss rebondi sur les bordures du niveau de plus en plus vite.

![](./resources/boss-state-bounce.gif)

### `Minions`

Dans cet etat, le *boss* fait apparaitre un groupe d'ennemi pour attaquer le joueur

![](./resources/boss-state-minions.gif)


### `Waypoint`
![](./resources/boss-state-waypoint.gif)

Dans cet etat, le boss se dirige vers un des points de controle le plus proche

Lorsque nous avons amélioré nos ennemis, nous avons utilisé un simple `switch` statement afin de représenter leurs comportements. En effet, la methode `setState` permet de changer et initialiser l'etat de l'ennemi. La methode `updateState` permet de mettre a jour l'ennemi selon l'etat de maniere assez simple. Cependant lorsqu'il s'agit d'un grand nombre d'etats ce simple mecanimse peut etre tres encombrant.

### `SimpleBossDemo.java`
```java
package com.tutorialquest.entities;
// ...

public class SimpleBossDemo extends Character {

    public class StateUtils
    {
        public static final int SHOOT = 0;
        public static final int CHASE = 1;
        public static final int BOUNCE = 2;
        public static final int MINIONS = 3;
        public static final int WAYPOINT = 4;
        public static final int DECIDE = 5;
        public static final int IDLE = 6;
    }

    public void setState(int state)
    {
        switch (state)
        {
            case StateUtils.SHOOT:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.CHASE:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.MINIONS:
                // Plusieurs lignes de code ...
                break;
            case StateUtils.WAYPOINT:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.DECIDE:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.IDLE:
                // Plusieurs lignes de code ...
                break;
        }

        this.state = state;
    }

    public void updateState(float deltaTime)
    {
        // ...

        switch (state)
        {
            case StateUtils.SHOOT:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.CHASE:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.MINIONS:
                // Plusieurs lignes de code ...
                break;
            case StateUtils.WAYPOINT:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.DECIDE:
                // Plusieurs lignes de code ...
                break;

            case StateUtils.IDLE:
                // Plusieurs lignes de code ...
                break;
        }
    }
}
```

Une meilleur maniere de proceder est d'encapsuler chacun des etats a l'interieur de classes. En d'autre mots, il est possible d'utiliser le polymorphisme afin de mettre a jour le *boss* en delegant le travail a une classe de type `State` plustot qu'au boss en tant que tel.

### `State`
```java

public class State {

    public void enter()
    {
        this.state = state;
    }

    public void update(Boss boss, float deltaTime)
    {
        // ...
        this.state.update(this, deltaTime);
    }
}
```

### `BetterBossDemo.java`
```java
package com.tutorialquest.entities;
// ...

public class BetterBossDemo extends Character {

    public void setState(State state)
    {
        this.state = state;
    }

    public void updateState(float deltaTime)
    {
        // ...
        this.state.update(this, deltaTime);
    }
}
```

En pratique nous voulons etre capable d'effectuer le operations suivante:
> `exit state`
> `enter state`
> `set state`    
> `get state name`
> `update state`
> `add state`

Il est donc naturel de vouloir encapsuler le comportement relatif aux etat dans une classe apart et non a l'interieur de `Boss`. A ces fins, les classes `StateMachine` et `State` peuvent etres utilisees. Afin d'ajouter un nouveau comporement a notre personnage, il s'agit que de deriver la classe `State` et d'ajouter un instance au `StateMachine` situe dans le personnage.

```plantuml
hide circle
class StateMachine {
    Map<Integer, State> states
    State currentState
    private int firstState
    
    void setCurrentState(int stateID)
    String getStateName()
    void update(float deltaTime)
    void addState(State state, boolean first)
}

class State {
    StateMachine stateMachine
    float timeoutTime
    float probability
    int timeoutState
    float timeoutLimit
    int id
    String getName()            
    boolean update(float deltaTime)
    void enter()
    void exit()
}
```

> ## Étapes a suivre
> ---
> 1. Ajoutez la classe `Boss`
> 2. Chargez la texture `assets/objects/boss_spritesheet.png` et ajoutez les animations necessaires.
> 3. Ajoutez les methode `update` et `render` de maniere similaire a l'enemi

### `Boss.java`
```java
package com.tutorialquest.entities;
// import ...

public class Boss extends Character {

    public class SpriteUtils {
        public static final int IDLE_FRONT = Character.SpriteUtils.IDLE_FRONT;
        public static final int WALK_FRONT = Character.SpriteUtils.WALK_FRONT;
        public static final int IDLE_SIDE = Character.SpriteUtils.IDLE_SIDE;
        public static final int WALK_SIDE = Character.SpriteUtils.WALK_SIDE;
        public static final int IDLE_BACK = Character.SpriteUtils.IDLE_BACK;
        public static final int WALK_BACK = Character.SpriteUtils.WALK_BACK;
        public static final int SHOOT = 20;
    }    
    
    public static final int WIDTH = 64;
    public static final int HEIGHT = 64;
    public static final float MAX_HEALTH = 10;
    public static final float DAMAGE = 15;
    public static final float KNOCKBACK = 200f;
    public static final float SPEED = 40f;
    public static final float PUSH_FORCE = 0.8f;

    public Vector2 destination = new Vector2();    
    private StateMachine stateMachine = new StateMachine();

    public void initSprite() {
        sprite = new AnimatedSprite(
            "objects/boss_spritesheet.png", 
            new Vector2(WIDTH, HEIGHT));                    
        sprite.origin = new Vector2(WIDTH/2, 0);

        sprite.addAnimation(
            SpriteUtils.IDLE_FRONT,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[0][1]
        );

        sprite.addAnimation(
            SpriteUtils.WALK_FRONT,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[0][0],
            sprite.frames[0][1],
            sprite.frames[0][2]
        );

        sprite.addAnimation(
            SpriteUtils.IDLE_SIDE,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[2][1]
        );

        sprite.addAnimation(
            SpriteUtils.WALK_SIDE,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[2][0],
            sprite.frames[2][1],
            sprite.frames[2][2]
        );

        sprite.addAnimation(
            SpriteUtils.IDLE_BACK,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[1][1]
        );

        sprite.addAnimation(
            SpriteUtils.WALK_BACK,
            AnimatedSprite.DEFAULT_FRAME_LENGTH,
            Animation.PlayMode.LOOP,
            sprite.frames[1][0],
            sprite.frames[1][1],
            sprite.frames[1][2]
        );

        sprite.play(SpriteUtils.WALK_FRONT, true);
    }

    public void initCollider()
    {
        collider = new Collider(
            new Vector2(WIDTH/2, 16),
            Collider.FLAG_COLLIDABLE | Collider.FLAG_ENEMY);
        collider.origin = new Vector2(WIDTH/4, 0);

    }

    public void initLootTable()
    {
        lootTable = new LootTable();
        lootTable.add(
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 1f;
                value = Money.GOLD_STACK_VALUE;
            }},
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 1f;
                value = Money.DIAMOND_VALUE;
            }}
        );
    }

    public Boss(
        Vector2 position,
        List<Vector2> waypoints)
    {
        super(position, DAMAGE, KNOCKBACK, MAX_HEALTH, SPEED, PUSH_FORCE);
        initSprite();
        initCollider();
        initLootTable();                
    }

    // Mise a jour de Boss de maniere similaire a enemi
    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);        
        updateVelocity(deltaTime);
        turn();
        push(Collider.FLAG_NONE);
        collisionAttack(Collider.FLAG_AVATAR);
        move();
        collider.update(position);
    }
}

```

> ## Étapes a suivre
> ---
> 1. Ajoutez une machine a etat `stateMachine` de type `StateMachine` a `Boss`
>    * Initialiser le contenu a l'interieur de la methode `initStateMachine` 
> 2. Pour commencer, ajoutez l'etat `IdleState` et `DecisionState`
>     * `DecisionState` permet d'obtenir un transition aleatoire lorsque le temps definit pour un etat est ecoule.
>     * `IdleState` prescrit a l'usager de rester Immobile pour la duration de l'etat
> 3. Chaque etat state est construit de la maniere suivante:
>     * `StateMachine stateMachine`
>         * reference a la machine afin de pouvoir changer d'etat
>     * `int id`
>         * l'identifiant de l'etat courant au sein de la machine
>     * `float probability`
>         * probabilite de transition lors d'une decision `Decision` 
>     * `float timeLimit`
>         * Limite de temps a l'etat, `-1` si aucune limite
>     * `int timeoutState`
>         * Etat de transition lorsque le temps est ecoule 

### `Boss.java`
```java
package com.tutorialquest.entities;
// import ...

public class Boss extends Character {

    public void initStateMachine(){
        stateMachine.addState(new StateMachine.DecisionState(stateMachine, BossStateUtils.STATE_DECIDE, -1, -1, -1), true);    
        stateMachine.addState(new BossStateUtils.IdleState(this, stateMachine, BossStateUtils.
    }

    public Boss(
        Vector2 position,
        List<Vector2> waypoints)
    {
        // ...
        // AJOUT:
        initStateMachine();        
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        // AJOUT:
        stateMachine.update(deltaTime);
        updateVelocity(deltaTime);
        // ...
    }
}

```