

# 1.1 Representation du monde

Comme nous l'avons vue, en programmation orientée objet, la déclaration d'une classe regroupe des attributs et des méthodes à un ensemble d'objets. Ainsi, en spécifiant les comportements et les attributs associés a une classe il est possible de coïncider la représentation du programme avec la représentation du monde reel ce qui facilite la compréhension.

Lorsqu'il s'agit d'une application de jeu vidéo, il est donc avantageux de représenter le monde à l'aide d'une hiérarchie de classes reflétant les différentes composantes de notre monde virtuel. À cet effet nous utilisons dans ce projet la classe `Room` et `Entity`

```plantuml
hide circle
class Room {
    List<Entity> entities
    void update(float deltaTime)
    void render(SpriteBatch spriteBatch)     
    void add(Entity entity)
}

class Room {
    Vector2 position
    void update(float deltaTime)
    void render(SpriteBatch spriteBatch)
    void onAdded()
    void onRemoved()    
}
```

L'objectif principal de `Room` est de contenir les différentes entités ainsi que d'assurer leurs affichages a l'écran conformément aux requêtes d'un utilisateur ou aux modifications apportées par un sous-système de notre jeu comme par exemple un acteur intelligent comme un ennemi ou un allie.

Il doit être possible de retirer une entité de la scène (comme par exemple lorsqu'il est question de retirer un ennemi qui a été vaincu) ou d'ajouter une entité (comme lorsque vient temps d'ajouter une récompense que le joueur pourra récupérer).

> 1. Creez la classe `Room`
> 2. Ajoutez un attribut `entities` de type `List<Entity> = new LinkedList<Entity>`
> 3. Specifiez une methode `add` pour ajouter un objet dans le monde
> 4. Specifiez une methode `remove` pour retirer un objet du monde
> 5. Specifiez une methode `find` pour trouver un objet du monde
> 5. Specifiez une methode `render` pour l'affichage

### ```Room.java```
```java

package com.tutorialquest;

import java.util.ArrayList;
import java.util.List;

public class Room {

	private List<Entities> entities = new LinkedList<Entity>();

	public Room() {
	}

	public void add(Entity entity) {
        if(entity == null)
			return;
        entities.add(entity);        
	}

    
	public void remove(Entity entity) {
        if(entity == null)
			return;
        entities.remove(entity);
	}

	public void update(float deltaTime) {
		for (Entity entity : entities) {
			entity.update(deltaTime);
		}
	}

    public void render() {
        for (Entity entity : actors) {
            entity.render();
        }
	}
}

```

Afin que la scène parvienne à l'affichage des acteurs, il est nécessaire que les acteurs possèdent une position dans la scène ainsi qu'une méthode par laquelle nous spécifierons les détails de l'affichage. Par exemple pour certain objecte il sera suffisant de dessiner qu'une simple carre tandis que pour d'autre nous désirons plutôt afficher un personnage. 

> 1. Creez la classe `Entity`
> 2. Ajoutez un attribut `position` de type `Vector2`
> 2. Specifiez une methode `render` pour l'affichage

### ```Entity.java```
```java

package com.tutorialquest.actors;

import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.math.Vector2;


public class Entity {

	public ShapeRenderer renderer = new ShapeRenderer();
	public Vector2 position = new Vector2();

	public int WIDTH = 32;
	public int HEIGHT = 32;

	public Entity(Vector2 position) {
		this.position = position.cpy();
	}

	public void update(float deltaTime) {
	}

	public void render() {
        // Affichage de l'acteur
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

Pour mettre en oeuvre nos entités, il est nécessaire d'ajouter de nouvelles [instances](../glossary/glossary.md#Instance) et de les ajouter a la sienne.


### ```Game.java```
```java 
package com.tutorialquest;

import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.GL20;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;

import com.cirrus.GLUtils;
package com.tutorialquest;

public class Game extends ApplicationAdapter {

	private Room room;

	public static final int VIEWPORT_WIDTH = 640 * 2;
	public static final int VIEWPORT_HEIGHT = 480 * 2;
	public static final Color CORNFLOWER_BLUE = new Color(0.39f, 0.58f, 0.92f, 1);

	@Override
	public void create() {
		Gdx.graphics.setWindowedMode(WIDTH, HEIGHT);		
		room = new Room();
		Room.add(new Entity());
	}

	@Override
	public void render() {
		GLUtils.glClearColor(CORNFLOWER_BLUE);
		Gdx.gl.glClear(GL20.GL_COLOR_BUFFER_BIT);

		room.update(Gdx.graphics.getDeltaTime());
		room.render(null);
	}
}

```

![](./resources/simple-scene-1.png) 




> # Activité
> Puisque le monde et nos entités sont des modules génériques servant à plusieurs sections de notre jeu, afin de représenter un moment spécifique de la partie, il est utile de créer une classe qui dérive la classe `Room` qui contiendra la configuration de nos acteurs au début du jeu. Il est aussi utile de dériver nos entités de cette manière afin d'arriver à un comportement plus spécifique.
> 1. Crée une classe `Avatar` qui dérive la classe `Entity` afin de représenter le personnage du joueur de manière à le distinguer des autres personnages.
> 2. Crée une classe `Enemy` qui représente un acteur opposant le joueur
> 3. Crée une classe `Room`  contenant les personnages à des endroits différents


````plantuml
@startuml
hide circle
Room <|-- Room1 
Entity <|-- Avatar 

class Room1 {
}

class Avatar {
    void render() <<override>>
}
@enduml
````







