## 4.2 Editeur de niveaux
---

Puisqu'il n'est pas convenable d'editer les niveaux de maniere textuel, l'editeur de niveau qui donne acces a un interface visuel est l'outil de choix. Dans le cadre de ce projet nous aurons recours a l'outil [Tiled](https://www.mapeditor.org/) pour modifier nos niveaux.

![](./resources/tiled.png)

---

> ## Étape a suivre
> ---
> 1. [Telechargez Tiled](https://thorbjorn.itch.io/tiled)
> 2. Installe Tiled
> 3. Ouvrez l'application

Lorsque vous ouvrez l'application, vous serez accueilli par l'interface suivante. Comme l'accent est mis sur la programmation pour cette activité, un niveau de base est deja a votre disposition. Vous pouvez le modifier a votre guise. Vous y retrouverez trois differents "layer"

* `Objects`
    * Contient l'information concernant le type et l'emplacement de nos entites dans le monde
* `Collision`
    * Contient des tuiles invisible servant a calculer les collisions pour notre personnage.
* `Foreground`
    * Contient les tuiles visible propre a l'avant-plan (les murs)  
* `Background`
    * Contient les tuiles visible propre a l'arriere-plan (le plancher)

![](./resources/tiled-startup.png)

> Ouvrez le fichier `levels/dungeon_demo.xml` fourni dans le projet

![](./resources/tiled-tilemap.png)

> ## Étape a suivre
> ---
> 1. Ajoutez l'avatar dans le niveau et specifiez le type `Avatar`
> 2. Ajoutez des enemies dans le niveau et specifiez le type `Slime`

![](./resources/tiled-place-slime.png)