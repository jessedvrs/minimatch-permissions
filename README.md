minimatch-permissions
=====================

[![npm version](https://badge.fury.io/js/minimatch-permissions.svg)](https://badge.fury.io/js/minimatch-permissions)

Define dot-notated permissions and match them using [minimatch](https://github.com/isaacs/minimatch).

Usage
-----

The api is very clean and simple. In this example, we use ES6 classes to define a User and a Tree.

```js
import { Permissions, Authorization } from 'minimatch-permissions';

class NormalUser extends User {
    permissions = new Permissions({
        grant: [
            'Tree.Plant',        // subset in form of action
            'Tree.PlantedByYou', // subset in form of selection
            'Tree.Tall.Chop'     // combination of subsets
        ]
    })
}

class SuperUser extends User {
    permissions = new Permissions({
        grant: [
            'Tree',              // no subset
        ]
    })
}

class Tree {

    /**
     * The user is only permitted when he's granted "Tree" or "Tree.Plant"
     */
    plant() {
        new Authorization()
            .needs('Tree{,.Plant}')
            .check(user.permissions); // throws error for you

        // 💦🌱
    }

    /**
     * The user is only permitted to hug trees planted by himself
     */
    hug() {
        const auth = new Authorization()
            .has('Tree.PlantedByYou*', () => this.plantedByUser === user)
            .needs('Tree{,.PlantedByYou}{,.Hug}');

        if (auth.isPermitted(user.permissions)) {
            // 😙🌳
        }
    }

    /**
     * The user could be restricted to chop tall trees
     */
    chop() {
        new Authorization()
            .has('Tree.Tall*', () => this.height >= 30)
            .needs('Tree{,.Tall}{,.Chop}')
            .check(user.permissions);

        // 🌳⛏
    }
}
```
