## 10.3 Aleatoire
---

Il est important d'incorporer l'element de chance a l'interieur de notre jeu dans le but de rendre l'experience d'un joueur unique par rapport aux autres. Nous voudrions modifier notre system de trésors afin de rendre le type et la qualite des objets aleatoire. Afin de parvenir, a cet objectif nous alons devoir recourrir a un generateur de nombres aleatoires.

## 10.3.1 Pseudo-aleatoire
---

Les generateur de nombre aleatoire sont utilise depuis tres longtempss que ce soit a l'aide d'un tire à pile ou face ou du roulement d'un dé. Le generateur de nombre aleatoire utilise au sein d'un ordinateur sert aussi a generer un resultat imprévisible. Cependant, puisque l'ordinateur ne se base pas sur un phenomene physique, nous precison qu'il est suffisant d'utiliser un resultat qui semble aleatoire et imprévisible du point de vue du joueur.

Par example en java, la classe `Random(long seed)` peut etre utilisé, a l'aide de `System.currentTimeMillis()` comme `seed` qui servira de point de depart pour generer nos valeur pseudo-aleatoires.

```java
Random rand = new Random(System.currentTimeMillis());
```

Afin d'obtenir des valeurs aleatoire nous pouvons utiliser quelques unes des fonctions utilitaires de la classe `Random`

```java
// Afin d'obtenir une valeur aleatoire entre 0 et 5
rand.nextInt(5);
```
> ## Étapes a suivre
> ---
> A l'interieur de la classe `Character`, changez la valeur fixe par une valeur aleatoire.

### `Money.java`
```java
package com.tutorialquest.entities;
// import ..

public class Money extends Collectible {

    // ..

    // ADDED:
    public static final float COPPER_COIN_VALUE = 1f;
    public static final float COPPER_FEW_VALUE = 2f;
    public static final float SILVER_COIN_VALUE = 5;
    public static final float SILVER_FEW_VALUE = 15;
    public static final float SILVER_STACK_VALUE = 25;
    public static final float GOLD_COIN_VALUE = 50;
    public static final float GOLD_FEW_VALUE = 100;
    public static final float GOLD_STACK_VALUE = 200;
    public static final float GOLD_PILE_VALUE = 300;
    public static final float DIAMOND_VALUE = 400;

    private float value;

    public Money(Vector2 position, float amount)
    {
        super(position);

        this.value = amount;
        String texturePath = "";

        // ADDED:
        if(amount <= COPPER_COIN_VALUE) texturePath = "coin_copper.png";
        else if(amount <= COPPER_FEW_VALUE) texturePath = "coin_copper_few.png";
        else if(amount <= SILVER_COIN_VALUE) texturePath = "coin_silver.png";
        else if(amount <= SILVER_FEW_VALUE) texturePath = "coin_silver_few.png";
        else if(amount <= SILVER_STACK_VALUE) texturePath = "coin_silver_stack.png";
        else if(amount <= GOLD_COIN_VALUE) texturePath = "coin_gold.png";
        else if(amount <= GOLD_FEW_VALUE) texturePath = "coin_gold_few.png";
        else if(amount <= GOLD_STACK_VALUE) texturePath = "coin_gold_stack.png";
        else if(amount <= GOLD_PILE_VALUE) texturePath = "coin_gold_pile.png";
        else if(amount <= DIAMOND_VALUE) texturePath = "diamond.png";

        sprite = new Sprite(texturePath, SIZE);
    }

    // ..
}
```

### `Character.java`
```java
package com.tutorialquest.entities;
// import ..

public abstract class Enemy extends Character {
    
    @Override
    public void onDefeated()
    {
        super.onDefeated();

        // MODIFIED:
        Game.room.add(new Money(
            position,            
            // Money.COPPER_COIN_VALUE
            Money.COPPER_COIN_VALUE + Utils.random.nextInt((int)Money.DIAMOND_VALUE)));
        Game.room.remove(this);
    }

    // ..
}

```

![](./resources/collectible-random.gif)