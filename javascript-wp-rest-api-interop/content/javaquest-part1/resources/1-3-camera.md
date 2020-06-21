## 1.3. Utilisation de la camera
---

La camera controle la facon dont le joueur observe le monde de jeu. Une camera represente un point dans l'espace auquel en modifiant les proprietes devient possible de manipuler ce qui est ultimement afficher a l'ecran.

Il existe principalement deux sorte de camera. La camera orthographique qui ne prends pas en compte la perspective de l'observateur est ideal pour le jeux en 2 dimensions.

### **Camera perspective vs orthographique**[^1]
![](./resources/ortho-vs-proj.png)

> ## Étapes a suivre
> ---
> 1. Creez une instance de `OrthographicCamera` a l'interieur de la classe `Game`
> 2. Configurez le zoom de la camera

### `Game.java`
```java
package com.tutorialquest;
// ...
// Utilisation de la camera offerte par libgdx
import com.badlogic.gdx.graphics.OrthographicCamera;
// ...

public class Game extends ApplicationAdapter {

    // AJOUT:
    public static OrthographicCamera camera;    

    @Override
    public void create() {
        // AJOUT:
        camera = new OrthographicCamera(
            VIEWPORT_WIDTH, 
            VIEWPORT_HEIGHT);
        // AJOUT:
        // Configuration du zoom de la camera
        camera.zoom = 0.25f;
        // ...
    }
}
```

La camera, est definit a l'aide de deux matrices, la matrice *view* et *projection* [^2]. La matrice *view* specifie la position et angle de la camera. La matrice projection determine la surface projete par la camera.

> ## Étapes a suivre
> ---
> 1. Modifiez la methode render de la classe `Avatar` afin de prendre en compte les deux matrices specifiees ci-dessus.
> 2. Metre-a-jour la position de la camera pour suivre le joueur
### `Avatar.java`
```java
public class Avatar extends Entity{

    // ...

    @Override
    public void render(SpriteBatch spriteBatch) {
        // AJOUT
        renderer.setProjectionMatrix(Game.camera.combined);
        renderer.begin(ShapeRenderer.ShapeType.Filled);
        renderer.setColor(Color.BLUE);
        renderer.rect(
            position.x,
            position.y,
            WIDTH,
            HEIGHT);
        renderer.end();
    }

    // ...
}
```

Puisque la camera suit maintenant le joueur, le jeu n'est plus contenu exclusivement a l'interieur de la fenetre. Il ne fait donc plus de sens de specifier la position des entites relativement au centre de la fenetre.

> ## Étapes a suivre
> ---
> 1. Changez l'emplacement initial des entites dans la classe `Level` 
> 2. Mettre a jour la camera dans la methode `update` afin que la camera suive la position du joueur.


### `Game.java`
```java
// import ..

public class Game extends ApplicationAdapter {
    // ..
    public static OrthographicCamera camera;    
    public static Level level;

    @Override
    public void create() {
        // ..
        level = new Level();
        // MODIF:
        level.add(level.avatar = new Avatar(Vector2.Zero.cpy()));
        level.add(new Enemy(Vector2.Zero.cpy().add(new Vector2(48f, 48f))));
        level.add(new Enemy(Vector2.Zero.cpy().add(new Vector2(48f, -48f))));
        level.add(new Enemy(Vector2.Zero.cpy().add(new Vector2(-48f, 48f))));
        level.add(new Enemy(Vector2.Zero.cpy().add(new Vector2(-48f, -48f))));
    }

    @Override
    public void render() {
        // ...        
        // AJOUT:
        // Mise-a-jour de la position de la camera
        // suivant la position du joueur        
        camera.position.set(Game.level.avatar.position, 0);
        camera.update();
    }
}

```

![](./resources/camera.gif) 


[^1]: https://glumpy.readthedocs.io/en/latest/_images/projection.png

[^2]: Une comprehension des matrices etudiees en mathematique n'est pas requis pour ce tutoriel. Ce qui est important de comprendre est que les matrices representes une collection de variables necessaire pour configurer la camera. 

