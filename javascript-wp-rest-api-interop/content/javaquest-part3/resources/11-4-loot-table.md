## 10.3 Table de distribution des tresors
---

Comme vous pouvez le constater, notre avatar se trouve plutot chanceux durant cette session de jeu. En effet, puisque la fonction `Random` utilise une [distribution uniforme](../glossary/glossary.md#Loi-uniforme), il y a presentement autant de chance de decouvrir un diamant qui vaut beaucoup plus de points que quelques piece de cuivre.

Afin de pouvoir augmenter l'impact de certaines recompenses, Nous voudrions ajuster la distribution des recompenses afin qu'il soit plus rare de decouvrir un diamant plutot qu'une simple peice de cuivre. Une solution simple pour ce mecanisme est d'utiliser une table de recompenses (`LootTable`)

![](./resources/lucky.gif)

> ## Étapes a suivre
> ---
> 1. Creez la classe `LootTable` dans laquelle il est possible de configurer la distribution des tresors pour un ennemi.
>    * Utilisez la methode `add` pour ajouter les elements necessaire a la table de distribution
>    * La methode `take` permet d'un prendre un maximum d'objet `amount` avec chaque obtenu avec une probabilite configure dans la table.
> 2. Ajoutez la methode `drop` a level afin de permettre de plus facilement laisser tomber des tresors.
> 3. Ajoute un instance de `LootTable` a l'interieur de l'ennemi et configurer la table de l'ennemi a vos besoins.
> 4. Ajustez la methode `onDefeated` a l'interieur de `Enemy` afin d'utiliser `LootTable`



### `LootTable.java`
```java
package com.tutorialquest;
// import ...

public class LootTable {

    public static class Loot
    {
        public Collectible.Type type;
        public float value;
        public float probability;
    }

    public List<Loot> loots;

    public LootTable() {}

    public void add(Loot ... loots)
    {
        this.loots = Arrays.asList(loots);
    }

    // Etape 1: Filtre la table de tresor selon le pourcentage de chance des elements
    public List<Loot> Take(int amount)
    {
        LinkedList<Loot> taken = new LinkedList<>();
        if(loots.isEmpty()) return taken;

        int trials = amount;
        while(trials > 0) {
            if(Utils.random.nextInt(amount) <  trials)
            {
                Loot loot = loots.get(Utils.random.nextInt(loots.size()));
                if(
                    loot.probability < 0 ||
                    Utils.random.nextFloat() <= loot.probability)
                {
                    trials--;
                    taken.add(loot);
                    continue;
                }
            }
        }

        return taken;
    }
}
```

### `Level.java`
```java

public class Level {

    // ...

    public void drop(
        LootTable lootTable, 
        int amount, 
        Vector2 position, 
        float range)
    {
        if (lootTable == null)
            return;

        for (LootTable.Loot loot : lootTable.Take(amount)) {
            Vector2 destination =
                new Vector2()
                    .setToRandomDirection()
                    .scl(range)
                    .add(position);

            switch (loot.type) {
                case Money:
                    Game.level.add(new Money(
                        destination,
                        loot.value));
                    break;
                case Health:
                    Game.level.add(new Health(
                        destination,
                        loot.value));
                    break;
            }
        }
    }
}
```

### `Enemy.java`
```java
package com.tutorialquest.entities;
// import ..

public abstract class Enemy extends Character 
{
    // ..
    public static final int DROP_AMOUNT = 4;
    public static final float DROP_DISTANCE_RANGE = 5f;
    public LootTable lootTable;

    // ..

    public void initLootTable()
    {
        // ADDED:
        lootTable = new LootTable();
        lootTable.add(
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 0.8f;
                value = Money.COPPER_COIN_VALUE;
            }},
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 0.5f;
                value = Money.SILVER_COIN_VALUE;
            }},
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 0.3f;
                value = Money.GOLD_COIN_VALUE;
            }},
            new LootTable.Loot()
            {{
                type = Collectible.Type.Money;
                probability = 0.1f;
                value = Money.DIAMOND_VALUE;
            }}
        );
    }

    public void onDefeated()
    {
        Game.level.remove(this);
        Game.level.drop(lootTable, DROP_AMOUNT, position, DROP_DISTANCE_RANGE);
    }
    
    // ..
}

```

![](./resources/collectible-random.gif)