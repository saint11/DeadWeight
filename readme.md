# Dead Weight
**Dead Weight** is a tabletop RPG system that takes place in a low-fantasy world, it's very grim and dark but doesn't take itself too seriously.
You can see the live website here: https://saint11.org/dead_weight/index.html

This is released under [Creative Commons Attribution](https://creativecommons.org/licenses/by/4.0/),you are free to hack, copy, change and even sell works derivative from this system, as long you give proper attribution. The **Dead Weight** logo cannot be used without express permission, though.

You may use this repository to make your own hacks of **Dead Weight** or to use the Dead Weight website structure to make your own.

# How to build
You need a [text editor](https://code.visualstudio.com/) that supports markdown and [NPM](https://www.npmjs.com/get-npm) installed.

Run `npm update` to install dependencies.

Open your terminal in this repository location, and run `npm run dev`. This will allow you to access you website on `http://localhost:3000/` while the command is running.

The **public folder** has a "draft" version of your website, that includes all chapters and sections tagged as ".draft". Any `.html` files stored here will be deleted with every export and then replaced with the new ones exported from the `.md` in the **source folder**.

The **output folder** has the final version, without any draft. Never store anything in the output folder, because it gets deleted with every export.