## 7.8 Visualisation de l'attaque
---

Meme si les ennemis sonc capables d'endommager le personnage, il serait bien d'avoir un visuel pour indiquer que l'attaque a eu lieu.

L'effet que nous voulons representer est un 'flash' en blanc lorsque l'ennemi entre en contact. 

![](./resources/attack-flash.gif)

Le moyen le plus facile pour arriver a cet effet est d'utiliser un nuanceur (*shader*). Un *shader* est un programme utilisé pour configurer une partie du processus de rendu réalisé par la carte graphique (*GPU*).

Le 'shader' que nous utilisons calcule la couleur pour chaque pixel d'une texture donnee. 

> ## Étapes a suivre
> ---
> 1. Creez le fichier `core/assets/shaders/white.vert` qui contient le vertex shader prealable au pixel shader.
> 2. Creez le fichier `core/assets/shaders/white.frag` qui contient le pixel shader que nous allons configurer pour notre effet.
> 3. Ajoutez la variable `flashTime`, `FLASH_TIME_LIMIT` et la methode `flash` a l'interieur de `Character`  
> 4. Appliquez le shader pour une courte duree de temps lorsque l'avatar est endommage.

### ```white.vert```
```glsl
#ifdef GL_ES
//--- Vertex Shader ---

// NOTE: 
// Il n'est pas important de comprendre ce fichier.
// Il est prealable au fonctionnement du pixel shader
attribute vec4 a_position;
attribute vec4 a_color;
attribute vec2 a_texCoord0;
uniform mat4 u_projTrans;
varying vec4 v_color;
varying vec2 v_texCoords;

void main() {
    v_color = a_color;
    v_texCoords = a_texCoord0;
    gl_Position = u_projTrans * a_position;
}
```
### `white.frag`
```glsl
#ifdef GL_ES
precision mediump float;
#endif
//--- Pixel Shader ---

// NOTE: Programme execute pour chacun des pixel de notre texture

varying vec4 v_color;
varying vec2 v_texCoords;
uniform sampler2D u_texture;

void main() {
    // Le pixel pour lequel le shader est applique est blanc (255, 255, 255)
    vec4 texColor = texture2D(u_texture, v_texCoords);
    vec3 white = texColor.rgb + vec3(255, 255, 255);
    texColor.rgb = white;
    gl_FragColor = v_color * texColor;
}
```
### `Character.java`
```java
// package ..
// import ..

public class Character extends PhysicalObject {

    // ..
    // AJOUT
    private final static float FLASH_TIME_LIMIT = 0.1f;
    private float flashTime = FLASH_TIME_LIMIT;
    
    // AJOUT
    ShaderProgram whiteShader = new ShaderProgram(
        Gdx.files.internal(
            "white.vert"),
        Gdx.files.internal(
            "white.frag"));

    // ..

    // AJOUT
    public void flash() { flashTime = 0; }

    @Override
    public void onAttacked(IAttack attack) {        
        // AJOUT:
        flash();
        // ...
    }

    public void update(float deltaTime) {
        // AJOUT:
        if(flashTime < FLASH_TIME_LIMIT) flashTime += deltaTime;

        // ...
    }

    @Override
    public void render(SpriteBatch spriteBatch) {
         
        if(flashTime < FLASH_TIME_LIMIT) {
            spriteBatch.setShader(WHITE_SHADER);
        }
        sprite.render(spriteBatch, position);
        spriteBatch.setShader(null);
        
        super.render(spriteBatch);
    }
}
```