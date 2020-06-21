## 5.4 Chargement du niveau
---

Maintenant que nous avons modifiez le niveau a notre guise, il est temps de charger le niveau a l'interieur de notre jeu. Heureusement, comme discutee dans le module precedant, `LibGDX` offre le mecanisme necessaire permettant de facilement pouvoir charger du contenu `XML` genere par l'outil `Tiled`.

> 1. Modifiez la classe `Level` afin d'afficher les tuiles
>     * Utilisez la classe `FixOrthogonalTiledMapRenderer` pour dessiner les tuiles
> 2. Modifiez la classe `Level` afin de creer les enemies
>     * Pour chaque `Layer`
>         * S'il s'agit d'un layer d'objets
>             * Cree les objets contenu dans ce layer   


### ```Level.java```
```java
package com.tutorialquest;
// ...
// AJOUT:
import com.tutorialquest.utils.FixOrthogonalTiledMapRenderer;
import com.badlogic.gdx.maps.MapLayer;
import com.badlogic.gdx.maps.MapObject;
import com.badlogic.gdx.maps.tiled.TiledMap;
import com.badlogic.gdx.maps.tiled.TmxMapLoader;

public class Level {

    // AJOUT:
    // Ajout des constante pour identifier le layer et les objets
    public static final String LAYER_OBJECT = "Objects";
    public static final String OBJECT_PROP_X = "x";
    public static final String OBJECT_PROP_Y = "y";
    public static final String OBJECT_PROP_NAME = "name";
    public static final String OBJECT_PROP_TYPE = "type";
    public static final String OBJECT_AVATAR = "Avatar";
    public static final String OBJECT_SLIME = "Slime";
    
    // AJOUT:
    // Ajout du TiledMap et TiledMapRenderer
    private TiledMap tiledMap;
    private FixOrthogonalTiledMapRenderer tiledMapRenderer;

    public Level(String tilemapPath){
        
        TmxMapLoader.Parameters parameter = new TmxMapLoader.Parameters() {{
            generateMipMaps = false;
            textureMagFilter = Texture.TextureFilter.Nearest;
            textureMinFilter = Texture.TextureFilter.Nearest;

        }};

        // chargement du tilemap et instantiation du renderer
        this.tiledMapPath = tiledMapPath;
        tiledMap = new TmxMapLoader().load(tilemapPath, parameter);
        tiledMapRenderer = new FixOrthogonalTiledMapRenderer(tiledMap);
    }

    public load()
    {        
        // AJOUT:
        for (MapLayer layer : tiledMap.getLayers()) {
            // Pour chaque layer ..
            switch (layer.getName()) {
                // S'il s'agit d'un layer objet ..
                case LAYER_OBJECT:
                    for (int i = 0; i < layer.getObjects().getCount(); i++) {
                        MapObject object = layer.getObjects().get(i);
                        
                        if (object == null)
                            continue;

                        // Cree l'objet necessaire
                        switch (object.getProperties().get(OBJECT_PROP_TYPE, String.class)) 
                        {

                            case OBJECT_AVATAR:
                                if (avatar == null) {
                                    add(this.avatar = new Avatar(new Vector2(
                                        object.getProperties().get(OBJECT_PROP_X, float.class),
                                        object.getProperties().get(OBJECT_PROP_Y, float.class))));
                                }
                                break;

                            case OBJECT_SLIME:
                                add(new Enemy(new Vector2(
                                    object.getProperties().get(OBJECT_PROP_X, float.class),
                                    object.getProperties().get(OBJECT_PROP_Y, float.class))));
                                break;
                        }
                    }
                    break;
            }
        }
    }

        
    public void dispose() {
        for (Entity ent : entities) {
            ent.dispose();
        }

        // AJOUT:
        tiledMap.dispose();
    }

    public void render(SpriteBatch batch) {

        // AJOUT:
        tiledMapRenderer.setView(Game.camera);
        tiledMapRenderer.render();

        // ...
    }
}
```

### ```Game.java```
```java
package com.tutorialquest;
// import ...
public class Game extends ApplicationAdapter {    
    // ..
    public static Level level;    

    @Override
    public void create() {
        Gdx.graphics.setWindowedMode(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        camera = new OrthographicCamera(VIEWPORT_WIDTH, VIEWPORT_HEIGHT);
        camera.zoom = 0.25f;
        spriteBatch = new SpriteBatch();
        // Chargement du niveau par default
        load("levels/dungeon_demo.tmx");
    }

    // AJOUT
    public static void load(String tilemapPath) 
    {
        if (level != null) level.dispose();
        level = new Level(tilemapPath);
        level.load();
    }


    // ..
}
```




![](./resources/loaded-leve.gif)
