# 6. Collision avec le niveau

> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-level/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-level/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-level/core.assets.zip" download>core.assets.zip</a> |
---

Comme vous aurez surement remarque, bien que nous avons les visuels necessaire pour notre niveau, il n'y a aucune collision et le personnage est capable de marcher a travers les murs. Afin de remedier a cette situation il est maintenant temps d'ajouter des collisions au niveau et un `Collider` a notre personnage.

![](./resources/loaded-leve.gif)

La premiere etape consiste a ajouter les collisions a notre niveau. Comme pour les visuel il est facile de representer les zones de collision a l'aide de tuiles.

> ## Étapes a suivre
> ---
> 1. Ajoutez le *layer* `Collision` au niveau
> 2. Sauvegarder le *layer* de collision lors du chargement du niveau.
> 3. Affichez les tuiles de collisions pour verifier le fonctionnement du systeme

![](./resources/collision-layer.png)

### `Level.java`
```java
package com.tutorialquest;
// import ...

public class Level {

    // Identifiant pour le layer de collision
    public static final String LAYER_COLLISION = "Collision";

    // ...

    // Taille des tuile pour affichage 'debug'
    public static final int TILE_SIZE = 16;

    public void load(int transitionID, Avatar avatar)
    {
        // ...

        for (MapLayer layer : tiledMap.getLayers()) {
            switch (layer.getName()) {
                
                // Sauvegarde du layer pour les collisions lors du chargement
                case LAYER_COLLISION:
                    collisionLayer = (TiledMapTileLayer) layer;
                    break;
                // ...
            }
        }
    }

    public void render(SpriteBatch batch) {
        // ...

        // Affichage des tuiles pour les collision afin de verifier le fonctionnement du systeme
        if(!Game.isDebugRenderEnabled) return;
        shapeRenderer.setProjectionMatrix(Game.camera.combined);
        shapeRenderer.begin(ShapeRenderer.ShapeType.Line);
        for(int i = 0; i < collisionLayer.getWidth(); i++)
            for(int j = 0; j < collisionLayer.getHeight(); j++)
                if(collisionLayer.getCell(i, j) != null)
                    shapeRenderer.rect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        shapeRenderer.end();
    }
}

```


Le `Collider` que l'on associe a l'avatar permet de definir la forme d'un objet afin que cette objet puisse interagir avec le monde physique. Bien, souvent un collider, qui est invisible, n'a pas besoin d'etre de la meme forme et la meme taille que l'objet initial. Pour les besoins d'un jeu simple en 2D, une approximation a l'aide de boite a largement suffisant.

La technique que nous allons utiliser pour permettre les collisions comprends les etapes suivantes:
* A chaque appel de `update`
    * Determinez quel cote de l'objet devrais collisionner avec le niveau en fonction du signe de la vitesse, i.e 
        ```
        if(velocity.x > 0) collisionSide = right;        
        else if(velocity.x < 0) collisionSide = left;
        ```    
    * verifie si la velocite applique a un objet entraine une collision
        * Si oui, deplace l'objet jusqu'a temps qu'il soit juste a cote du mur
        * Anule la vitesse courrante afin d'empecher l'objet de passer a travers le mur

![](./resources/collision-edit.png)


> ## Étapes a suivre
> ---
> 1. Creez la classe `PhysicalObject` qui represente un objet qui interragi avec le monde physique
> 2. Creez une classe `Collider`
> 3. Ajoutez un `Collider` qui se charge de mettre a jour `velocity`
> 4. Modifiez `Avatar` afin d'utiliser `Collider`

```plantuml
hide circle

class PhysicalObject {
    public Vector2 velocity;
    public Vector2 direction;
    public Collider collider;
    public void move();
}

Entity <|-- PhysicalObject 
PhysicalObject <|-- Avatar 
PhysicalObject <|-- Enemy 

```

### ```PhysicalObject.java```
```java
package com.tutorialquest.entities;
// import ..

public class PhysicalObject extends Entity {

    public Vector2 velocity = new Vector2();
    public Vector2 direction = new Vector2(0, -1);
    public Collider collider;

    public PhysicalObject(Vector2 position) {
        super(position);
    }

    // Mise-a-jour de l'objet et de la boite de collision associee
    public void move() {
        collider.updateObject(this);
        position.add(velocity);
        collider.update(position);
    }

    // ..
}


```

### ```Collider.java```
```java
package com.tutorialquest;
// import ...
import com.badlogic.gdx.math.Rectangle;
import com.tutorialquest.utils.RectangleUtils;
import com.tutorialquest.utils.TiledUtils;
import com.tutorialquest.entities.PhysicalObject;

public class Collider {

    // ...
    public Rectangle rect = new Rectangle(0,0,0,0);    
    public Vector2 origin = new Vector2();

    public Collider(Vector2 size)
    {
        this.rect.setSize(size.x, size.y);
    }

    // Determine si la boite rentre a en collision
    // a l'horizontal soit, dans le coin haut, ou le coin bas
    public boolean isCollidingTilemapHorizontal(float xvelocity, float side) {
        return TiledUtils.worldToCell(
            Level.collisionLayer,
            side + xvelocity,
            RectangleUtils.top(rect)) != null ||
        TiledUtils.worldToCell(
            Level.collisionLayer,
            side + xvelocity,
            RectangleUtils.bottom(rect)) != null;
    }

    // Determine si la boite rentre a en collision 
    //a la vertical soit, dans le coin gauche, ou le coin droit
    public boolean isCollidingTilemapVertical(float yvelocity, float side) {
        return
            TiledUtils.worldToCell(
                Level.collisionLayer,
                RectangleUtils.left(rect),
                side + yvelocity) != null ||
            TiledUtils.worldToCell(
                Level.collisionLayer,
                RectangleUtils.right(rect),
                side + yvelocity) != null;
    }

    public Vector2 updateObject(PhysicalObject object)
    {
        //--- Horizontal Collision ---//
        // Calcul de collision effectue a l'aide de l'arrondi
        // afin d'eviter 'sub-pixel movement' qui pourrait empecher de collisionner avec le mur
        float sx = Math.signum(object.velocity.x);
        float sy = Math.signum(object.velocity.y);
        float cvx = MathUtils.ceil(Math.abs(object.velocity.x)) * sx;
        float cvy = MathUtils.ceil(Math.abs(object.velocity.y)) * sy;

        // Determine si la gauche ou la droite va rentrer en collision
        // en fonction de la vitesse actuelle
        float horizontalSide = cvx > 0 ?
            RectangleUtils.right(rect) :
            RectangleUtils.left(rect);
        float verticalSide = cvy > 0 ?
            RectangleUtils.top(rect) :
            RectangleUtils.bottom(rect);


        // Si l'objet s'appretais a collisioner dans le 'update' courrant
        if (isCollidingTilemapHorizontal(cvx, horizontalSide)) {
            // Tant que l'object n'entre pas en contact avec le mur
            for (int i = 0; i < Math.abs(cvx); i++) {
                // Je deplace l'objet pixel par pixel 
                // jusqu'a temps qu'il soit juste a cote du mur.
                if (!isCollidingTilemapHorizontal(sx, horizontalSide)) {
                    object.position.x += sx;
                }
            }

            // J'annule la velocite de l'objet afin 
            // qu'il ne puisse pas depasser le mur
            object.velocity.x = 0;
        }

        //--- Vertical Collision ---//
        if (isCollidingTilemapVertical(object, cvy, verticalSide)) {
            for (int i = 0; i < Math.abs(cvy); i++) {
                if (!isCollidingTilemapVertical(object, sy, verticalSide)) {
                    object.position.y +=  sy;
                }
            }

            object.velocity.y = 0;
        }

        return object.velocity;
    }

    public void update(Vector2 position) {
        // Je met a jour la position du 'Collider' 
        // en fonction de celle de l'objet
        rect.setPosition(
            position.x - origin.x,
            position.y - origin.y);
    }
}


```

### ```Avatar.java```
```java

package com.tutorialquest.entities;

// MODIF:
// public class Avatar extends Entity {
public class Avatar extends PhysicalObject {

    // ...
    // RETIRE:
    // Nous avons deplace direction + velocity a l'interieur de PhysicalObject 
    // public Vector2 velocity = new Vector2();
    // public Vector2 direction = new Vector2(0, -1);

    // AJOUT:
    public void initCollider()
    {
        collider = new Collider(Collider.DEFAULT_SIZE);
        collider.origin = new Vector2(Collider.DEFAULT_SIZE.x / 2, Collider.DEFAULT_SIZE.y / 2);
    }

    public Avatar()
    {
        // AJOUT:
        initCollider();
        // ..
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        control(deltaTime);
        turn();
        // AJOUT:
        move();
        sprite.update(deltaTime);
    }
}
```
---

> ## Activité
> ---
> Effectuez les meme changements a la classe Enemy




