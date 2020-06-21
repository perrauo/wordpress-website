## 1.2. Gestion des entrées et déplacement de l'avatar
---

La prochaine étape est d'ajouter la capacité de déplacement à notre personnage. 

Le déplacement du personnage a lieu lorsque le joueur appuie sur les touches correspondantes au clavier. À cet effet, à l'intérieur de la méthode `update`, nous aurons recours aux modules `com.badlogic.gdx.Input` offert par LibGDX. Il est possible directement détecter les entrées au clavier depuis l'avatar.

```java
/* Avatar.java */

package com.tutorialquest.entities;
// import ...

public class Avatar extends Entity {    
    // ...
    @Override
    public void update(float deltaTime) {
        // ...        
        if(Gdx.input.isKeyPressed(Input.Keys.LEFT)) 
        // TODO: Movement de l'avatar vers la droite
    }
    // ...
}
// ...

```
Cependant, comme il serait utile de pouvoir configurer le choix de contrôles indépendamment du code pour le personnage, il vaut mieux créer une classe utilitaire `InputManager` dans laquelle nous encapsulerons les entrées au clavier. Ce mécanisme nous permettra aussi d'éventuellement supporter d'autre type de contrôle par exemple une manette de jeu (GamePad).

---
> ### Étapes à suivre
> 1. créez la classe `InputManager` dans laquelle vous encapsulez l'interaction utilisateur
> 2. utilisez les fonctions offertes par `InputManager` afin de tourner et ensuite déplacer l'avatar.

```java
/* InputManager.java */
package com.tutorialquest;
// import ...

// AJOUT:
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;

public class InputManager {
    // ...
    // Encapsulation des interaction de l'utilisateur
    public boolean isLeftPressed() {
        if (!enabled) return false;
        return Gdx.input.isKeyPressed(Input.Keys.A) || Gdx.input.isKeyPressed(Input.Keys.LEFT);
    }
    
    // TODO: right, up, down, space ..
}

```

```java
/* Avatar.java */
package com.tutorialquest.entities;
// import ...

public class Avatar extends Entity {

    protected static final float SPEED = 45f;

    private ShapeRenderer renderer = new ShapeRenderer();
    private InputManager input = new InputManager();
    private Vector2 controlAxes = new Vector2();
    private Vector2 velocity = new Vector2();

    public Avatar(Vector2 position) {
        super(position);
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        // Détection des entrées au clavier
        control(deltaTime);
        // Mise à jour de la position
        position.add(velocity);
    }

    // Utilisez les fonctions offertes par `InputManager`
    // afin de tourner et ensuite déplacer l'avatar.
    public void control(float deltaTime) {
        controlAxes.setZero();
        if (input.isRightPressed() && !input.isLeftPressed()) controlAxes.set(1f, controlAxes.y);
        else if (input.isLeftPressed() && !input.isRightPressed()) controlAxes.set(-1f, controlAxes.y);
        else controlAxes.set(0, controlAxes.y);

        if (input.isUpPressed() && !input.isDownPressed()) controlAxes.set(controlAxes.x, 1f);
        else if (input.isDownPressed() && !input.isUpPressed()) controlAxes.set(controlAxes.x, -1f);
        else controlAxes.set(controlAxes.x, 0);

        controlAxes.clamp(0f, 1f);
        velocity
            .set(controlAxes)
            .scl(SPEED)
            .scl(deltaTime);
    }

    // Affichage du personnage
    @Override
    public void render(SpriteBatch spriteBatch) {
        super.render(spriteBatch);
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
}
```

![](./resources/avatar-movement.gif) 