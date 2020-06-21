# 7. Enemies

> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-level-collision/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-level-collision/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-level-collision/core.assets.zip" download>core.assets.zip</a> |

## 6.2 Ameilioration au monde
---
Lorsque nous avons ecris la classe `Level`, nous avions negligé un probleme qui peut se poser lorsque nous ajoutons des entités et les retirons du monde. En effet, presentement, il est impossible d'ajouter des instance de `Entity` au monde ou de les retirer depuis la methode `update` d'un autre entité. Ce genre de situation, arrive par exemple lorsque l'avatar doit vaincre des enemies, ou encore lorsque celui-ci doit ramasser un objet. 

La raison pour laquelle nous avons ce probleme est qu'il est impossible de modifier les objets d'une liste lorsque nous sommes en train d'iterer sur cette meme liste.

### ```Level.java```
```java
public class Level
{
    // ...
    public void remove(Entity entity) {
        entities.remove(entity);
    }

    public void update(float deltaTime) {
        
        for (Entity entity : entities) {
            // Entite retire soit-meme ou ajoute a liste 
            // lors de l'execution de update
            entity.update(deltaTime);
        }
    }
}
```

### ```Avatar.java```
```java
public class Avatar
{
    public void update(float deltaTime) {
        // ..
        if(attacking) enemy.onAttacked(attack);
    }
}
```

### ```Enemy.java```
```java
public class Enemy
{
    // ...    
    @Override
    public void onAttacked(Attack attack){
        // ..
        // e.g.
        // ERROR: java.util.ConcurrentModificationException
        if(health <= 0)
            Game.room.remove(this);        
    }
}
```

Un moyen pour remedier a ce probleme est d'utiliser une liste intermediaire pour les ajouts et les retraits au monde. De cette maniere, les ajouts et les retrait ne prendrons effet qu'a partir de la prochaine iteration ce qui evitera les acces en concurence a `entities`.

---

> ## Étape a suivre
> ---
> 1. Ajoutez deux liste d'entités, `added` et `removed`
> 2. Modifiez les methode `add` et `remove` afin d'ajouter aux listes
> 3. Apres l'iteration sur les entites
>     * Mettre a jour le contenu de `entities` par rapport a `added` et `removed`
> 4. Effacez le contenu de `added` et `removed`

```java
public class Level
{
    // ...

    // AJOUT:
    private List<Entity> added = new ArrayList<Entity>();
    private List<Entity> removed = new ArrayList<Entity>();
    
    // ...

    // AJOUT:
    public void add(Entity entity) {
        if(entity == null)
            return;
        added.add(entity);
    }

    // AJOUT:
    public void remove(Entity entity){
        if(entity == null)
            return;
        removed.add(entity);
    }

    public void update(float deltaTime) {
        
        // ...

        for (Entity entity : entities) {
            entity.update(deltaTime);
        }

        // AJOUT:
        // Mettre a jour la liste avec 'added'
        for(Entity ent : added) {
            entities.add(ent);
        }

        // AJOUT:
        // Mettre a jour la liste avec 'removed'
        for(Entity ent : removed)
        {
            entities.remove(ent);
        }

        // AJOUT:
        // Signaler l'objet qu'il est pret pour commencer 'start'
        for(Entity ent : added) {
            ent.start();
        }

        // AJOUT:
        // Signaler l'objet qu'il a ete retirer
        for(Entity ent : removed) {
            ent.dispose();
        }

        // AJOUT:
        // Effacer le contenu de added et removed
        added.clear();
        removed.clear();
    }
}
```