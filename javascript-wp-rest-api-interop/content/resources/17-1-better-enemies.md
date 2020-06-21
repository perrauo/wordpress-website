# 17. Inventaire

> | Téléchargement fichiers référence |
> | ------------- |:-------------:|
> | <a href="./resources/part-avatar-attack/desktop.zip" download>desktop.zip</a> |
> | <a href="./resources/part-avatar-attack/core.src.zip" download>core.src.zip</a> |
> | <a href="./resources/part-avatar-attack/core.assets.zip" download>core.assets.zip</a> |

De retour a l'interieur du donjon, nous voulons maintenant ameiliorer le comportement des enemis afin qu'ils semblent plus intelligent. En particulier, a la place de continuellement pourchasser le joueur nous voulons incorporer un nombre d'**etats** differents dans le comportements des enemis.

Dans le cadre de ce projet nous defenirons les etats
* `Wander` qui permet aux enemis de se promenner sans but predetermine
* `Idle` qui permet aux enemis de rester immobile pour une duree limite
* `Chase` qui permet aux enemis de pourchaser le joueur

![](./resources/better-enemies.gif)

> ## Étapes a suivre
> ---
> Modifiez la classe `Enemy` en ajoutant les etats definit ci-dessus
> 1. Ajoutez une la classe `StateUtils` qui defini les etat de l'enemie 
> 2. Ajoutez les constantes permettant de configurer les etats de l'enemi
> 3. Ajoutez une methode `setState` permettant l'intialisation d'un etat
>     * Pour chaque etat, l'initialisation permet d'imobiliser l'enemi afin de partir a zero.
>     * Pour l'etat `Wander` l'initialisation permet de chosir une destination aleatoirement
> 4. Ajoutez une methode `updateState` permettant la mise a jour de l'etat
>     * Imposez une limite de temps a chaque etat a l'aide de la variable `stateTime`
>     * Determinez les transition necessaire entre les etats lorsque le joueur passe suffisament proche de l'enemi ou lorsque la limite de temps est ecoule.  

### `Enemy.java`
```java
package com.tutorialquest.entities;
// import ...

public class Enemy extends Character {

    // AJOUT:
    public class StateUtils
    {
        public static final int IDLE = 0;
        public static final int CHASE = 1;
        public static final int WANDER = 2;
    }

    // AJOUT:
    // Constantes pour configurer les etats de l'enemi
    public static final float IDLE_TIME_LIMIT = 2f;
    public static final float WANDER_DISTANCE_RANGE = 96f;
    public static final float WANDER_TIME_LIMIT = 5f;
    public static final float CHASE_DETECTION_RANGE = 64f;
    public static final float DESTINATION_DISTANCE_EPSILON = 0.1f;

    // AJOUT:
    private PhysicalObject chaseTarget = null;
    private Vector2 wanderTarget = new Vector2();
    public int state = StateUtils.IDLE;
    // Variable servant a imposer une limite de temps a un etat
    private float stateTime = 0;

    // AJOUT:
    // Initialisation de l'etat    
    public void setState(int state)
    {
        stateTime = 0;
        switch (state)
        {
            case StateUtils.CHASE:
                controlAxes.setZero();
                locomotionVelocity.setZero();
                break;

            case StateUtils.IDLE:
                controlAxes.setZero();
                locomotionVelocity.setZero();
                break;

            case StateUtils.WANDER:
                controlAxes.setZero();
                locomotionVelocity.setZero();
                // Choix de la destination de promenade aleatoire
                wanderTarget
                    .set(position)
                    .add(new Vector2()
                        .setToRandomDirection()
                        .scl(WANDER_DISTANCE_RANGE));
                break;
        }

        this.state = state;
    }

    // AJOUT:
    public void updateState(float deltaTime)
    {
        stateTime += deltaTime;
        switch (state)
        {
            // Mouvement en direction du joueur
            case StateUtils.CHASE:
                if(
                    chaseTarget == null ||
                    position.dst(chaseTarget.position) > CHASE_DETECTION_RANGE)
                {
                    setState(StateUtils.IDLE);
                    return;
                }

                controlAxes
                    .set(chaseTarget.position)
                    .sub(position)
                    .nor();

                locomotionVelocity
                    .set(controlAxes)
                    .scl(speed);

                break;

            // Imobilisation
            case StateUtils.IDLE:

                if(
                    chaseTarget != null &&
                    position.dst(chaseTarget.position) < CHASE_DETECTION_RANGE)
                {
                    setState(StateUtils.CHASE);
                    return;
                }

                if(stateTime >= IDLE_TIME_LIMIT)
                {
                    setState(StateUtils.WANDER);
                    return;
                }

                break;

            // Mouvement end direction de la destination de promenade
            case StateUtils.WANDER:

                if(
                    chaseTarget != null &&
                    position.dst(chaseTarget.position) < CHASE_DETECTION_RANGE)
                {
                    setState(StateUtils.CHASE);
                    return;
                }

                if(
                    stateTime >= WANDER_TIME_LIMIT ||
                    position.epsilonEquals(wanderTarget, DESTINATION_DISTANCE_EPSILON))
                {
                    setState(StateUtils.IDLE);
                    return;
                }

                controlAxes
                    .set(wanderTarget)
                    .sub(position)
                    .nor();

                locomotionVelocity
                    .set(controlAxes)
                    .scl(speed);

                break;

        }
    }

    public Enemy(Vector2 position) {
        // ...
        // AJOUT:
        // Etat initial
        setState(StateUtils.IDLE);
    }

    @Override
    public void update(float deltaTime) {
        super.update(deltaTime);
        
        // AJOUT:
        updateState(deltaTime);
        
        // ...
    }
}
```