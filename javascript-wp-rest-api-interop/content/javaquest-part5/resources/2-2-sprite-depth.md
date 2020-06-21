## 2.2 Sprites et effet profondeur
---

Comme vous surement peut le remarquer, la profondeur des sprite n'est pas affiche comme on le voudrait.

![](./resources/sprite-no-depth.png)

Plus precisement, nous voudrions que les entites situes plus en bas de l'ecran soit affiche a l'avant tandis que les entites au dessus soit afficher a l'arriere. Afin d'arriver a cet effet il est important de comprendre comment la methode `render` de la classe `SpriteBatch` de LibGDX fonctionne.

![](./resources/sprite-depth.png) ![](./resources/sprite-depth-back.png) 

Lorsqu'un appel a `SpriteBatch.begin` est effectue, l'image n'est pas immediatement dessine a l'ecran. A la place, la requete pour l'affichage est mis dans une "file d'attente" qui sera ensuite envoyee au [GPU](../glossary/glossary.md#Carte-Graphique). Le GPU traite ensure les requete en ordre d'arrivee dans la file d'attente. Donc dans le but d'afficher les sprite plus en bas a l'avant, il sera necessaire de reordonner les entites dans la liste en fonction de leur `position.y` a chaque fois qu'il y a un changement. 


> ## Étape a suivre
> ---
> A l'interieur de la methode `update` de la classe `Level`, reordonne la liste des entite en fonction de `-position.y`.


### ```Level.java```
```java
public class Level {

    // ...

    public void render(SpriteBatch batch) {
        // AJOUT:
        // triage des entites selon leur profondeurs
        entities.sort(Comparator.comparing(x -> -x.position.y));
        for (Entity ent : entities) {
            ent.render(batch);
        }
    }
}
```

![](./resources/working-depth.gif) 